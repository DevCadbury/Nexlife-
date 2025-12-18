import express from "express";
import { simpleParser } from "mailparser";
import { getCollections, addLog } from "../db.js";
import { broadcastThreadUpdate } from "./inquiries.js";

const router = express.Router();

// Webhook to ingest inbound email (e.g., via a gateway that forwards raw MIME)
// POST /api/inbound/webhook { raw: string }
router.post("/webhook", async (req, res) => {
  try {
    const raw = req.body?.raw || req.body?.mime || "";
    if (!raw || typeof raw !== "string")
      return res.status(400).json({ error: "raw MIME required" });
    const parsed = await simpleParser(raw);
    const from = String(
      parsed.from?.text || parsed.from?.value?.[0]?.address || ""
    ).toLowerCase();
    const to = String(
      parsed.to?.text || parsed.to?.value?.[0]?.address || ""
    ).toLowerCase();
    const subject = parsed.subject || "";
    const message = (
      parsed.textAsHtml ||
      parsed.html ||
      parsed.text ||
      ""
    ).toString();

    const { inquiries } = await getCollections();
    // eslint-disable-next-line no-console
    console.log(`[WEBHOOK] inbound from ${from} subject="${subject}"`);
    // find latest thread by the inbound sender
    let target = await inquiries
      .find({ email: from })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();
    if (!target.length) {
      const base = String(subject || "")
        .replace(/^(\s*(re|fw|fwd)\s*:\s*)+/i, "")
        .trim();
      if (base) {
        const rx = new RegExp(base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        target = await inquiries
          .find({ subject: rx })
          .sort({ createdAt: -1 })
          .limit(1)
          .toArray();
      }
    }
    if (!target.length)
      return res.status(200).json({ success: true, ignored: true });
    const _id = target[0]._id;

    await inquiries.updateOne(
      { _id },
      {
        $set: {
          updatedAt: new Date(),
          status: target[0].status === "replied" ? "replied" : "read",
        },
        $push: {
          replies: {
            at: new Date(),
            subject,
            message: message.replace(/\r/g, ""),
            fromName: from,
            inbound: true,
          },
        },
      }
    );
    await addLog({ type: "inquiry.inbound", refId: _id, actor: from });
    // eslint-disable-next-line no-console
    console.log(`[WEBHOOK] appended to thread ${_id}`);

    // Broadcast real-time update (use thread email for channel)
    broadcastThreadUpdate(email, {
      type: "thread_update",
      subtype: "new_reply",
      inquiryId: _id,
      from,
      subject,
      message: message.replace(/\r/g, ""),
    });

    return res.json({ success: true });
  } catch (e) {
    console.error("Inbound webhook error", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
