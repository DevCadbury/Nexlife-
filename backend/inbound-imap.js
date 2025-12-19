import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { ObjectId } from "mongodb";
import { getCollections, addLog } from "./db.js";
import {
  broadcastThreadUpdate,
  sendStaffNotification,
  broadcastDashboardNotification,
} from "./routes/inquiries.js";

function getEnvBool(name, def = false) {
  const v = (process.env[name] || "").toLowerCase();
  if (v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return def;
}

// Track processed message IDs to avoid duplicates
const processedMessages = new Set();

export async function startInboundImapPoller() {
  const enabled = getEnvBool("IMAP_ENABLED", true);
  if (!enabled) {
    return; // explicitly disabled
  }
  const host = process.env.IMAP_HOST || "";
  const user = process.env.IMAP_USER || "";
  const pass = process.env.IMAP_PASS || "";
  if (!host || !user || !pass) {
    // no IMAP configured; skip
    return;
  }
  const port = Number(process.env.IMAP_PORT || 993);
  const secure = getEnvBool("IMAP_SECURE", true);
  const intervalMs = Number(process.env.IMAP_POLL_INTERVAL_MS || 30000);

  async function cycleOnce() {
    console.log(`[IMAP] Starting cycle for ${user}@${host}:${port}`);
    
    const client = new ImapFlow({
      host,
      port,
      secure,
      auth: { user, pass },
      logger: process.env.NODE_ENV === 'production', // Enable logging in production
      tls: { 
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
      },
      // Add timeout settings for serverless
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    });
    
    client.on("error", (err) => {
      // eslint-disable-next-line no-console
      console.error("[IMAP] ❌ Client error:", {
        code: err?.code,
        message: err?.message,
        command: err?.command,
        response: err?.response,
      });
    });
    
    try {
      console.log('[IMAP] Connecting to mailbox...');
      await client.connect();
      console.log('[IMAP] ✅ Connected successfully');
      const lock = await client.getMailboxLock("INBOX");
      try {
        // Check mailbox status first
        const status = await client.status("INBOX", {
          messages: true,
          unseen: true,
        });
        console.log(
          `[IMAP] Mailbox status - Total: ${status.messages}, Unseen: ${status.unseen}`
        );

        // fetch unseen messages first, then recent messages
        console.log(`[IMAP] Fetching unseen messages...`);

        let messageCount = 0;

        // First, try unseen messages
        for await (const msg of client.fetch(
          { seen: false },
          { source: true, envelope: true }
        )) {
          messageCount++;
          console.log(
            `[IMAP] Processing unseen message ${messageCount} - UID: ${msg.uid}`
          );
          const parsed = await simpleParser(msg.source);

          // Extract just the email address, not the display name
          let from = "";
          if (parsed.from?.value?.[0]?.address) {
            from = parsed.from.value[0].address;
          } else if (parsed.from?.text) {
            // Try to extract email from text like "Name <email@domain.com>"
            const emailMatch = parsed.from.text.match(/<([^>]+)>/);
            if (emailMatch) {
              from = emailMatch[1];
            } else {
              // If no angle brackets, check if it's just an email
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailRegex.test(parsed.from.text.trim())) {
                from = parsed.from.text.trim();
              }
            }
          }

          from = from.toLowerCase().trim();

          // Ignore emails sent from our own mailbox
          if (from === (process.env.IMAP_USER || "").toLowerCase()) {
            await client.messageFlagsAdd(msg.uid, ["\\Seen"]);
            continue;
          }
          const subject = parsed.subject || "";
          const messageId = (parsed.messageId || "").toString();

          // Skip if already processed
          if (messageId && processedMessages.has(messageId)) {
            continue;
          }

          const inReplyTo = (parsed.inReplyTo || "").toString();
          const references = Array.isArray(parsed.references)
            ? parsed.references.map((r) => r.toString())
            : parsed.references
            ? [parsed.references.toString()]
            : [];
          let message = (
            parsed.textAsHtml ||
            parsed.html ||
            parsed.text ||
            ""
          ).toString();

          // Limit message size to prevent payload too large errors
          if (message.length > 100000) {
            // 100KB limit
            message =
              message.substring(0, 100000) +
              "\n\n[Message truncated due to size]";
          }
          const { inquiries } = await getCollections();

          let target = await inquiries
            .find({ email: from })
            .sort({ createdAt: -1 })
            .limit(1)
            .toArray();

          // Try case-insensitive matching if no exact match
          if (!target.length) {
            target = await inquiries
              .find({
                email: {
                  $regex: new RegExp(
                    `^${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                    "i"
                  ),
                },
              })
              .sort({ createdAt: -1 })
              .limit(1)
              .toArray();
          }
          if (!target.length && (inReplyTo || references.length)) {
            const ids = [inReplyTo, ...references].filter(Boolean);
            if (ids.length) {
              target = await inquiries
                .find({ "replies.messageId": { $in: ids } })
                .sort({ updatedAt: -1, createdAt: -1 })
                .limit(1)
                .toArray();
            }
          }
          if (!target.length) {
            // Fallback by subject (strip common prefixes like Re:, Fwd:)
            const base = String(subject || "")
              .replace(/^(\s*(re|fw|fwd)\s*:\s*)+/i, "")
              .trim();
            if (base) {
              const rx = new RegExp(
                base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
              );
              target = await inquiries
                .find({ subject: rx })
                .sort({ createdAt: -1 })
                .limit(1)
                .toArray();
            }
          }
          if (target.length) {
            const _doc = target[0];
            const _id = _doc._id;

            // De-duplication: skip if this inbound messageId already stored
            if (messageId && Array.isArray(_doc.replies)) {
              const exists = _doc.replies.some(
                (r) => r && r.messageId === messageId
              );
              if (exists) {
                await client.messageFlagsAdd(msg.uid, ["\\Seen"]);
                continue;
              }
            }

            await inquiries.updateOne(
              { _id },
              {
                $set: {
                  updatedAt: new Date(),
                  status: target[0].status === "replied" ? "replied" : "read",
                },
                $push: {
                  replies: {
                    _id: new ObjectId(),
                    at: new Date(),
                    subject,
                    message: message.replace(/\r/g, ""),
                    fromName: from,
                    inbound: true,
                    ...(messageId ? { messageId } : {}),
                  },
                },
              }
            );

            // Mark as processed
            if (messageId) {
              processedMessages.add(messageId);
            }

            // eslint-disable-next-line no-console
            console.log(
              `[IMAP] ✅ New reply appended to thread ${_id} from ${from}: "${subject}"`
            );
            await addLog({ type: "inquiry.inbound", refId: _id, actor: from });

            // Broadcast real-time update (use thread email for channel)
            broadcastThreadUpdate(_doc.email, {
              type: "thread_update",
              subtype: "new_reply",
              inquiryId: _id,
              from,
              subject,
              message: message.replace(/\r/g, ""),
            });

            // Send dashboard notification to all staff
            await sendStaffNotification(
              _doc.email,
              from,
              subject,
              message.replace(/\r/g, "")
            );

            // Send dashboard notification for real-time updates
            broadcastDashboardNotification({
              subtype: "new_reply",
              inquiryEmail: _doc.email,
              fromName: from,
              subject: subject,
              message:
                message.replace(/\r/g, "").substring(0, 100) +
                (message.length > 100 ? "..." : ""),
              timestamp: new Date().toISOString(),
            });
          }
          // mark message seen
          await client.messageFlagsAdd(msg.uid, ["\\Seen"]);
        }

        // Also check recent messages (last 2 hours) that might have been seen but not processed
        const since = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
        console.log(
          `[IMAP] Fetching recent messages since: ${since.toISOString()}`
        );

        for await (const msg of client.fetch(
          { since: since },
          { source: true, envelope: true }
        )) {
          messageCount++;
          console.log(
            `[IMAP] Processing recent message ${messageCount} - UID: ${msg.uid}`
          );

          const parsed = await simpleParser(msg.source);

          // Extract just the email address, not the display name
          let from = "";
          if (parsed.from?.value?.[0]?.address) {
            from = parsed.from.value[0].address;
          } else if (parsed.from?.text) {
            // Try to extract email from text like "Name <email@domain.com>"
            const emailMatch = parsed.from.text.match(/<([^>]+)>/);
            if (emailMatch) {
              from = emailMatch[1];
            } else {
              // If no angle brackets, check if it's just an email
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailRegex.test(parsed.from.text.trim())) {
                from = parsed.from.text.trim();
              }
            }
          }

          from = from.toLowerCase().trim();

          // Ignore emails sent from our own mailbox
          if (from === (process.env.IMAP_USER || "").toLowerCase()) {
            continue;
          }

          const subject = parsed.subject || "";
          const messageId = (parsed.messageId || "").toString();

          // Skip if already processed
          if (messageId && processedMessages.has(messageId)) {
            console.log(
              `[IMAP] Skipping already processed message: ${messageId}`
            );
            continue;
          }

          const inReplyTo = (parsed.inReplyTo || "").toString();
          const references = Array.isArray(parsed.references)
            ? parsed.references.map((r) => r.toString())
            : parsed.references
            ? [parsed.references.toString()]
            : [];
          let message = (
            parsed.textAsHtml ||
            parsed.html ||
            parsed.text ||
            ""
          ).toString();

          // Limit message size to prevent payload too large errors
          if (message.length > 100000) {
            // 100KB limit
            message =
              message.substring(0, 100000) +
              "\n\n[Message truncated due to size]";
          }
          const { inquiries } = await getCollections();

          let target = await inquiries
            .find({ email: from })
            .sort({ createdAt: -1 })
            .limit(1)
            .toArray();

          // Try case-insensitive matching if no exact match
          if (!target.length) {
            target = await inquiries
              .find({
                email: {
                  $regex: new RegExp(
                    `^${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                    "i"
                  ),
                },
              })
              .sort({ createdAt: -1 })
              .limit(1)
              .toArray();
          }
          if (!target.length && (inReplyTo || references.length)) {
            const ids = [inReplyTo, ...references].filter(Boolean);
            if (ids.length) {
              target = await inquiries
                .find({ "replies.messageId": { $in: ids } })
                .sort({ updatedAt: -1, createdAt: -1 })
                .limit(1)
                .toArray();
            }
          }
          if (!target.length) {
            // Fallback by subject (strip common prefixes like Re:, Fwd:)
            const base = String(subject || "")
              .replace(/^(\s*(re|fw|fwd)\s*:\s*)+/i, "")
              .trim();
            if (base) {
              const rx = new RegExp(
                base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
              );
              target = await inquiries
                .find({ subject: rx })
                .sort({ createdAt: -1 })
                .limit(1)
                .toArray();
            }
          }
          if (target.length) {
            const _doc = target[0];
            const _id = _doc._id;

            // De-duplication: skip if this inbound messageId already stored
            if (messageId && Array.isArray(_doc.replies)) {
              const exists = _doc.replies.some(
                (r) => r && r.messageId === messageId
              );
              if (exists) {
                continue;
              }
            }

            await inquiries.updateOne(
              { _id },
              {
                $set: {
                  updatedAt: new Date(),
                  status: target[0].status === "replied" ? "replied" : "read",
                },
                $push: {
                  replies: {
                    _id: new ObjectId(),
                    at: new Date(),
                    subject,
                    message: message.replace(/\r/g, ""),
                    fromName: from,
                    inbound: true,
                    ...(messageId ? { messageId } : {}),
                  },
                },
              }
            );

            // Mark as processed
            if (messageId) {
              processedMessages.add(messageId);
            }

            // eslint-disable-next-line no-console
            console.log(
              `[IMAP] ✅ New reply appended to thread ${_id} from ${from}: "${subject}"`
            );
            await addLog({ type: "inquiry.inbound", refId: _id, actor: from });

            // Broadcast real-time update (use thread email for channel)
            broadcastThreadUpdate(_doc.email, {
              type: "thread_update",
              subtype: "new_reply",
              inquiryId: _id,
              from,
              subject,
              message: message.replace(/\r/g, ""),
            });

            // Send dashboard notification to all staff
            await sendStaffNotification(
              _doc.email,
              from,
              subject,
              message.replace(/\r/g, "")
            );

            // Send dashboard notification for real-time updates
            broadcastDashboardNotification({
              subtype: "new_reply",
              inquiryEmail: _doc.email,
              fromName: from,
              subject: subject,
              message:
                message.replace(/\r/g, "").substring(0, 100) +
                (message.length > 100 ? "..." : ""),
              timestamp: new Date().toISOString(),
            });
          }
        }

        console.log(`[IMAP] Processed ${messageCount} messages in this cycle`);
      } finally {
        lock.release();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[IMAP] ❌ Poller error:", {
        code: e?.code,
        message: e?.message,
        command: e?.command,
        response: e?.response,
        stack: process.env.NODE_ENV === 'production' ? e?.stack : undefined,
      });
      
      // Provide specific error guidance
      if (e?.code === 'EAUTH') {
        console.error('[IMAP] Authentication failed. Please verify IMAP credentials in Vercel environment variables.');
      } else if (e?.code === 'ETIMEDOUT' || e?.code === 'ECONNECTION') {
        console.error('[IMAP] Connection timeout. Please check IMAP host and port settings.');
      }
    } finally {
      try {
        await client.logout();
      } catch (logoutError) {
        // Ignore logout errors
        console.log('[IMAP] Logout completed (or connection already closed)');
      }
    }
  }

  // initial immediate poll then interval
  cycleOnce();
  setInterval(cycleOnce, intervalMs);
  // eslint-disable-next-line no-console
  console.log(
    `IMAP poller started for ${user}@${host}:${port} every ${intervalMs}ms (${
      intervalMs / 1000
    }s) (secure=${secure})`
  );
}
