import express from "express";
import { ObjectId } from "mongodb";
import { getCollections } from "../db.js";
import { requireAuth } from "./auth.js";
import { sendEmail, validateEmail } from "../config/email.js";

const router = express.Router();

// ─── Helpers ────────────────────────────────────────────────────────────────

function sanitize(value, max = 2000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

/** Generate next referenceId: NXL-Q-YYYY-NNN */
async function generateReferenceId(quotes) {
  const year = new Date().getFullYear();
  const prefix = `NXL-Q-${year}-`;
  // Find the highest sequential number for this year
  const latest = await quotes
    .find({ referenceId: { $regex: `^${prefix}` } })
    .sort({ referenceId: -1 })
    .limit(1)
    .toArray();

  let seq = 1;
  if (latest.length > 0) {
    const parts = latest[0].referenceId.split("-");
    const last = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(last)) seq = last + 1;
  }
  return `${prefix}${String(seq).padStart(3, "0")}`;
}

// ─── Email Templates ─────────────────────────────────────────────────────────

/**
 * Parse cart items from the message field when source is 'surgical-cart'
 * Message format: "Cart items:\n1. PRODUCT NAME (qty: N)\n2. ...\n\nAdditional notes:\n..."
 */
function parseCartItems(message) {
  if (!message) return [];
  const lines = message.split('\n');
  const items = [];
  for (const line of lines) {
    const match = line.match(/^\d+\.\s+(.+?)\s+\(qty:\s*(\d+)\)/);
    if (match) {
      items.push({ name: match[1].trim(), qty: parseInt(match[2], 10) });
    }
  }
  return items;
}

function cartItemsTable(items, frontendUrl) {
  if (!items.length) return '';
  const base = frontendUrl || 'https://nexlifeinternational.in';
  const rows = items.map((item, i) => {
    const nameSlug = String(item.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const productUrl = `${base}/product/${nameSlug}`;
    return `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #E8F0EE;font-size:13px;color:#0D2240">${i + 1}. ${item.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #E8F0EE;font-size:13px;color:#64748B;text-align:center">${item.qty}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #E8F0EE;font-size:13px;text-align:right">
        <a href="${productUrl}" style="color:#0A8A78;font-size:11px;font-weight:600;text-decoration:none">View ›</a>
      </td>
    </tr>`;
  }).join('');

  return `
    <div style="font-size:12px;font-weight:700;color:#0A8A78;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;margin-top:20px">Products Requested</div>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E8F0EE;border-radius:6px;overflow:hidden;margin-bottom:16px">
      <thead>
        <tr style="background:#F7F8FA">
          <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.06em">Product</th>
          <th style="padding:8px 12px;text-align:center;font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.06em">Qty</th>
          <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:600;color:#64748B"></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function customerConfirmationEmail(data) {
  const {
    name,
    email,
    referenceId,
    company,
    phone,
    country,
    productName,
    quantity,
    unit,
    message,
    source,
  } = data;

  const frontendUrl = process.env.FRONTEND_URL || 'https://nexlifeinternational.in';
  // Cart quotes originate from the surgical site — use its domain for product links
  const surgicalUrl = process.env.SURGICAL_URL || 'https://nexlifeinternational.in';
  const isCart = source === 'surgical-cart';
  const cartItems = isCart ? parseCartItems(message) : [];

  // Extract additional notes from cart message
  let additionalNotes = message || '';
  if (isCart) {
    const notesMatch = message?.match(/Additional notes:\n([\s\S]*?)$/);
    additionalNotes = notesMatch ? notesMatch[1].trim() : '';
    if (additionalNotes === 'None') additionalNotes = '';
  }

  const rows = [
    ["Reference Number", `<strong style="color:#0A8A78;font-size:15px">${referenceId}</strong>`],
    ["Name", name],
    ["Email", email],
    company && ["Company / Hospital", company],
    phone && ["Phone", phone],
    country && ["Country", country],
    !isCart && productName && ["Product of Interest", productName],
    !isCart && (quantity || unit) && ["Quantity", `${quantity || ""} ${unit || ""}`.trim()],
    (!isCart && message) && ["Message", message],
  ]
    .filter(Boolean)
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #E8F0EE;font-weight:600;color:#5A7A74;width:170px;vertical-align:top;font-size:13px">${label}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #E8F0EE;color:#0D2240;font-size:13px;line-height:1.5">${value}</td>
      </tr>`
    )
    .join("");

  return {
    subject: `Quote Request Received – ${referenceId} | Nexlife International`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F4F7F6;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F7F6;padding:30px 0">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #D8E6E3">

      <!-- Header -->
      <tr>
        <td style="background:#0D2240;padding:28px 32px">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>
                <div style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.3px">Nexlife International</div>
                <div style="font-size:12px;color:#8AADCC;margin-top:2px;letter-spacing:0.05em;text-transform:uppercase">Global Healthcare Solutions</div>
              </td>
              <td align="right">
                <div style="background:#0A8A78;color:#fff;font-size:11px;font-weight:700;padding:6px 14px;border-radius:4px;letter-spacing:0.05em;text-transform:uppercase">Quote Request</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Banner -->
      <tr>
        <td style="background:#0A8A78;padding:18px 32px">
          <div style="color:#ffffff;font-size:18px;font-weight:700">Thank you for your quote request!</div>
          <div style="color:rgba(255,255,255,0.85);font-size:13px;margin-top:4px">We have received your inquiry and will respond within 24 business hours.</div>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:28px 32px">
          <p style="color:#0D2240;font-size:14px;margin:0 0 20px">Dear <strong>${name}</strong>,</p>
          <p style="color:#4A6070;font-size:13px;margin:0 0 24px;line-height:1.7">
            Thank you for reaching out to Nexlife International. We have received your quote request and our specialist team is reviewing it. You can expect a detailed response within <strong>24 business hours</strong>.
          </p>

          <!-- Reference Box -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F0FAF8;border:1px solid #C0DDD8;border-radius:6px;margin-bottom:24px">
            <tr>
              <td style="padding:16px 20px;text-align:center">
                <div style="font-size:11px;font-weight:700;color:#0A8A78;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">Your Reference Number</div>
                <div style="font-size:22px;font-weight:800;color:#0D2240;letter-spacing:0.05em;font-family:monospace">${referenceId}</div>
                <div style="font-size:11px;color:#6B8EA0;margin-top:4px">Please quote this number in all correspondence</div>
              </td>
            </tr>
          </table>

          <!-- Summary Table -->
          <div style="font-size:12px;font-weight:700;color:#0A8A78;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px">Request Summary</div>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E8F0EE;border-radius:6px;overflow:hidden">
            ${rows}
          </table>

          ${isCart && cartItems.length > 0 ? cartItemsTable(cartItems, surgicalUrl) : ''}
          ${additionalNotes ? `<div style="margin-top:16px;background:#F8FBFF;border:1px solid #D0E4F4;border-radius:6px;padding:14px 16px"><div style="font-size:11px;font-weight:700;color:#1A4A7A;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:6px">Additional Notes</div><div style="font-size:13px;color:#374151;line-height:1.6;white-space:pre-wrap">${additionalNotes}</div></div>` : ''}

          <!-- What's Next -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FBFF;border:1px solid #D0E4F4;border-radius:6px;margin-top:24px">
            <tr>
              <td style="padding:16px 20px">
                <div style="font-size:12px;font-weight:700;color:#1A4A7A;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px">What Happens Next?</div>
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr><td style="padding:4px 0;vertical-align:top"><span style="color:#0A8A78;font-weight:700;margin-right:8px">1.</span></td><td style="padding:4px 0;font-size:13px;color:#3A5A70;line-height:1.5">Our product specialist will review your requirements</td></tr>
                  <tr><td style="padding:4px 0;vertical-align:top"><span style="color:#0A8A78;font-weight:700;margin-right:8px">2.</span></td><td style="padding:4px 0;font-size:13px;color:#3A5A70;line-height:1.5">We will prepare a detailed, competitive quote for you</td></tr>
                  <tr><td style="padding:4px 0;vertical-align:top"><span style="color:#0A8A78;font-weight:700;margin-right:8px">3.</span></td><td style="padding:4px 0;font-size:13px;color:#3A5A70;line-height:1.5">You will receive a response at <strong>${email}</strong> within 24 business hours</td></tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#0D2240;padding:22px 32px">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>
                <div style="color:#ffffff;font-size:13px;font-weight:600;margin-bottom:8px">Nexlife International</div>
                <div style="color:#8AADCC;font-size:12px;line-height:1.8">
                  📧 Info@nexlifeinternational.com<br/>
                  📞 +91 96648 43790 &nbsp;|&nbsp; +91 84015 46910<br/>
                  📍 S-223, Angel Business Center – 2, Mota Varachha, Surat - 394101 (Gujarat)
                </div>
              </td>
              <td align="right" valign="top">
                <div style="color:#6A8A9C;font-size:11px;text-align:right">Ref: ${referenceId}</div>
              </td>
            </tr>
          </table>
          <div style="border-top:1px solid #1E3A5A;margin-top:16px;padding-top:12px">
            <div style="color:#4A6A7C;font-size:11px">This is an automated confirmation. Please do not reply to this email. For urgent inquiries, contact us directly.</div>
          </div>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body></html>`,
    text: `Quote Request Received – ${referenceId}\n\nDear ${name},\n\nThank you for your quote request. Reference: ${referenceId}\n\nOur team will respond within 24 business hours at ${email}.\n\nNexlife International\nInfo@nexlifeinternational.com\n+91 96648 43790`,
  };
}

function adminNotificationEmail(data) {
  const {
    name,
    email,
    referenceId,
    company,
    phone,
    country,
    productName,
    productId,
    quantity,
    unit,
    message,
    source,
    createdAt,
  } = data;

  const rows = [
    ["Reference ID", referenceId],
    ["Name", name],
    ["Email", email],
    company && ["Company / Hospital", company],
    phone && ["Phone", phone],
    country && ["Country", country],
    productName && ["Product of Interest", productName],
    productId && ["Product ID", productId],
    (quantity || unit) && ["Quantity", `${quantity || ""} ${unit || ""}`.trim()],
    source && ["Source", source],
    ["Received", new Date(createdAt).toLocaleString()],
    ["Message", message],
  ]
    .filter(Boolean)
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:9px 12px;border-bottom:1px solid #eee;font-weight:600;color:#555;width:160px;vertical-align:top;font-size:13px">${label}</td>
        <td style="padding:9px 12px;border-bottom:1px solid #eee;color:#1a1a1a;font-size:13px;line-height:1.5">${value}</td>
      </tr>`
    )
    .join("");

  const crmUrl = process.env.CRM_URL || "https://nexlife-admin.vercel.app";

  return {
    subject: `[CRM] New Quote Request – ${referenceId} from ${name}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:20px;background:#f0f0f0;font-family:Arial,sans-serif">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background:#fff;border-radius:6px;overflow:hidden;border:1px solid #ddd">
  <tr><td style="background:#0D2240;padding:18px 24px">
    <span style="color:#fff;font-size:17px;font-weight:700">New Quote Request Received</span>
    <span style="float:right;background:#0A8A78;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:3px">${referenceId}</span>
  </td></tr>
  <tr><td style="padding:6px 24px 0">
    <p style="color:#555;font-size:13px;margin:14px 0">A new quote request has been submitted via the <strong>${source || "surgical"}</strong> website.</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e0e0e0;border-radius:4px;overflow:hidden;margin-bottom:16px">
      ${rows}
    </table>
    <div style="background:#f5f5f5;border-radius:4px;padding:12px 16px;margin-bottom:20px">
      <a href="${crmUrl}/admin/quotes" style="color:#0A8A78;font-weight:700;font-size:13px;text-decoration:none">→ View in CRM: ${crmUrl}/admin/quotes</a>
    </div>
  </td></tr>
  <tr><td style="background:#f8f8f8;padding:12px 24px;border-top:1px solid #eee">
    <span style="color:#999;font-size:11px">Nexlife International CRM · Automated notification · Do not reply</span>
  </td></tr>
</table>
</body></html>`,
    text: `New Quote Request – ${referenceId}\n\nFrom: ${name} <${email}>\nProduct: ${productName || "N/A"}\nMessage: ${message}\n\nView in CRM: ${crmUrl}/admin/quotes`,
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// POST / — public, create a new quote
router.post("/", async (req, res) => {
  const {
    name,
    email,
    company,
    phone,
    country,
    productName,
    productId,
    quantity,
    unit,
    message,
    source = "surgical",
  } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email, and message are required" });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  try {
    const { quotes } = await getCollections();

    const referenceId = await generateReferenceId(quotes);
    const now = new Date();

    const doc = {
      referenceId,
      name: sanitize(name, 100),
      email: sanitize(email, 200).toLowerCase(),
      company: sanitize(company || "", 120),
      phone: sanitize(phone || "", 40),
      country: sanitize(country || "", 80),
      productName: sanitize(productName || "", 200),
      productId: sanitize(productId || "", 100),
      quantity: sanitize(quantity || "", 40),
      unit: sanitize(unit || "", 30),
      message: sanitize(message, 5000),
      status: "new",
      source: sanitize(source || "surgical", 30),
      createdAt: now,
      updatedAt: now,
    };

    await quotes.insertOne(doc);

    // Customer confirmation — non-blocking
    sendEmail(doc.email, "rawHtml", {
      ...customerConfirmationEmail(doc),
    }).catch((e) => console.error("[quotes] Customer email failed:", e));

    // Admin notification — non-blocking
    const adminTo = process.env.CONTACT_TO || process.env.SMTP_USER;
    sendEmail(adminTo, "rawHtml", {
      ...adminNotificationEmail(doc),
    }).catch((e) => console.error("[quotes] Admin email failed:", e));

    return res.status(201).json({ success: true, referenceId });
  } catch (err) {
    console.error("[quotes] Create failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET / — authenticated, list all quotes
router.get("/", requireAuth(), async (req, res) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query || {};
    const { quotes } = await getCollections();
    const filter = {};
    if (status) filter.status = String(status);

    const total = await quotes.countDocuments(filter);
    const raw = await quotes
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(offset) || 0)
      .limit(Math.min(Number(limit) || 100, 500))
      .toArray();

    const items = raw.map((d) => ({ ...d, _id: String(d._id) }));
    return res.json({ total, items });
  } catch (err) {
    console.error("[quotes] List failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /count — authenticated, count new quotes
router.get("/count", requireAuth(), async (req, res) => {
  try {
    const { quotes } = await getCollections();
    const count = await quotes.countDocuments({ status: "new" });
    return res.json({ count });
  } catch (err) {
    console.error("[quotes] Count failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /:id/status — authenticated, update status
router.patch("/:id([0-9a-fA-F]{24})/status", requireAuth(), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!["new", "read", "replied"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  try {
    const { quotes } = await getCollections();
    await quotes.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );
    return res.json({ success: true });
  } catch (err) {
    console.error("[quotes] Status update failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /track-download — public, track a PDF download + auto-subscribe + send confirmation email
router.post("/track-download", async (req, res) => {
  const { email, name, referenceId, cartItems } = req.body || {};
  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: "Valid email required" });
  }
  try {
    const { quotes, subscribers } = await getCollections();
    const now = new Date();
    const normalizedEmail = sanitize(email, 200).toLowerCase();
    const downloaderName = sanitize(name || "", 100);

    const downloadEntry = {
      email: normalizedEmail,
      name: downloaderName,
      downloadedAt: now,
    };

    // 1. Link download to existing quote if referenceId provided
    if (referenceId) {
      await quotes.updateOne(
        { referenceId: String(referenceId) },
        {
          $set: { lastDownloadedAt: now, lastDownloaderEmail: normalizedEmail },
          $push: { downloads: downloadEntry },
        }
      );
    } else {
      // 2. No referenceId — create a standalone download-only quote record so it shows in CRM
      const downloadRefId = `NXL-DL-${now.getFullYear()}-${String(Date.now()).slice(-6)}`;
      await quotes.insertOne({
        referenceId: downloadRefId,
        name: downloaderName || normalizedEmail,
        email: normalizedEmail,
        productName: Array.isArray(cartItems) && cartItems.length > 0
          ? cartItems.map((i) => i.name).join(", ").slice(0, 200)
          : "Quote PDF Download",
        source: "pdf-download",
        status: "read",
        message: Array.isArray(cartItems) && cartItems.length > 0
          ? `Cart items:\n${cartItems.map((i, idx) => `${idx + 1}. ${i.name} (qty: ${i.qty || 1})`).join("\n")}`
          : "",
        downloads: [downloadEntry],
        lastDownloadedAt: now,
        lastDownloaderEmail: normalizedEmail,
        createdAt: now,
        updatedAt: now,
      });
    }

    // 3. Auto-subscribe (idempotent)
    const existing = await subscribers.findOne({ email: normalizedEmail });
    if (!existing) {
      await subscribers.insertOne({
        email: normalizedEmail,
        name: downloaderName,
        phone: "",
        internalNote: "Auto-subscribed via quote PDF download",
        added_by: "system",
        added_at: now,
        createdAt: now,
        updatedAt: now,
        source: "quote_download",
        is_locked: false,
        deleted_by_admin: false,
        deleted_by_super: false,
      });
    } else if (existing.deleted_by_admin || existing.deleted_by_super || existing.is_locked) {
      await subscribers.updateOne(
        { email: normalizedEmail },
        {
          $set: {
            deleted_by_admin: false,
            deleted_by_super: false,
            is_locked: false,
            updatedAt: now,
            ...(downloaderName ? { name: downloaderName } : {}),
          },
        }
      );
    }

    // 4. Send confirmation email to downloader
    const cartItemsArr = Array.isArray(cartItems) ? cartItems : [];
    const productListHtml = cartItemsArr.length > 0
      ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E8F0EE;border-radius:6px;overflow:hidden;margin:16px 0">
          <thead><tr style="background:#F7F8FA">
            <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase">Product</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase">Qty</th>
          </tr></thead>
          <tbody>${cartItemsArr.map((item, i) => `
            <tr>
              <td style="padding:10px 12px;border-top:1px solid #E8F0EE;font-size:13px;color:#0D2240">${i + 1}. ${item.name || item}</td>
              <td style="padding:10px 12px;border-top:1px solid #E8F0EE;font-size:13px;color:#64748B;text-align:center">${item.qty || 1}</td>
            </tr>`).join("")}
          </tbody>
        </table>`
      : "";

    const greeting = downloaderName ? `Dear ${downloaderName},` : "Hello,";
    const frontendUrl = process.env.SURGICAL_URL || process.env.FRONTEND_URL || "https://nexlifeinternational.in";

    const confirmHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F4F7F6;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F7F6;padding:30px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #D8E6E3">
  <tr><td style="background:#0D2240;padding:24px 32px">
    <div style="font-size:20px;font-weight:800;color:#fff">Nexlife International</div>
    <div style="font-size:11px;color:#8AADCC;margin-top:2px;text-transform:uppercase;letter-spacing:0.05em">Global Healthcare Solutions</div>
  </td></tr>
  <tr><td style="background:#0A8A78;padding:16px 32px">
    <div style="color:#fff;font-size:17px;font-weight:700">Your quote PDF is ready</div>
    <div style="color:rgba(255,255,255,0.85);font-size:13px;margin-top:3px">Thank you for your interest in Nexlife products</div>
  </td></tr>
  <tr><td style="padding:28px 32px">
    <p style="color:#0D2240;font-size:14px;margin:0 0 16px">${greeting}</p>
    <p style="color:#4A6070;font-size:13px;line-height:1.7;margin:0 0 20px">
      Thank you for downloading the Nexlife International quote PDF. We've noted your interest and a member of our team will be happy to assist with detailed pricing, availability, and shipping information.
    </p>
    ${productListHtml ? `<div style="font-size:12px;font-weight:700;color:#0A8A78;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Products of Interest</div>${productListHtml}` : ""}
    <div style="background:#F0FAF8;border:1px solid #C0DDD8;border-radius:6px;padding:16px 20px;margin:20px 0;text-align:center">
      <div style="font-size:11px;font-weight:700;color:#0A8A78;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Need a formal quote?</div>
      <a href="${frontendUrl}/cart" style="display:inline-block;background:#0A8A78;color:#fff;font-size:13px;font-weight:700;padding:10px 24px;border-radius:5px;text-decoration:none">Request a Quote</a>
    </div>
    <p style="color:#4A6070;font-size:13px;line-height:1.7;margin:0">
      Our specialists are available to answer any questions about specifications, certifications, bulk pricing, or shipping. Don&apos;t hesitate to reach out.
    </p>
  </td></tr>
  <tr><td style="background:#0D2240;padding:20px 32px">
    <div style="color:#fff;font-size:13px;font-weight:600;margin-bottom:6px">Nexlife International</div>
    <div style="color:#8AADCC;font-size:12px;line-height:1.8">
      info@nexlifeinternational.com · +91 96648 43790<br/>
      S-223, Angel Business Center – 2, Mota Varachha, Surat - 394101 (Gujarat, India)
    </div>
    <div style="border-top:1px solid #1E3A5A;margin-top:12px;padding-top:10px">
      <div style="color:#4A6A7C;font-size:11px">You received this because you downloaded a quote PDF from our website.</div>
    </div>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;

    sendEmail(normalizedEmail, "rawHtml", {
      subject: "Your Nexlife International Quote PDF",
      html: confirmHtml,
      text: `${greeting}\n\nThank you for downloading the Nexlife International quote PDF. Our team will be happy to assist with pricing and shipping.\n\nContact us: info@nexlifeinternational.com | +91 96648 43790`,
    }).catch((e) => console.error("[quotes] Download confirmation email failed:", e));

    return res.json({ success: true });
  } catch (err) {
    console.error("[quotes] Track download failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /downloads — authenticated, list quotes that have been downloaded
router.get("/downloads", requireAuth(), async (req, res) => {
  try {
    const { quotes } = await getCollections();
    const { limit = 100 } = req.query || {};

    const items = await quotes
      .find(
        { downloads: { $exists: true, $not: { $size: 0 } } },
        { projection: { referenceId: 1, name: 1, email: 1, productName: 1, source: 1, createdAt: 1, downloads: 1, lastDownloadedAt: 1 } }
      )
      .sort({ lastDownloadedAt: -1 })
      .limit(Math.min(Number(limit) || 100, 500))
      .toArray();

    // Flatten downloads for easy display
    const flatDownloads = [];
    for (const quote of items) {
      for (const dl of (quote.downloads || [])) {
        flatDownloads.push({
          quoteId: String(quote._id),
          referenceId: quote.referenceId,
          quoteName: quote.name,
          quoteEmail: quote.email,
          productName: quote.productName,
          source: quote.source,
          quoteCreatedAt: quote.createdAt,
          downloaderEmail: dl.email,
          downloaderName: dl.name,
          downloadedAt: dl.downloadedAt,
        });
      }
    }

    flatDownloads.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime());

    return res.json({ total: flatDownloads.length, items: flatDownloads });
  } catch (err) {
    console.error("[quotes] Downloads list failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /:id — superadmin only
router.delete("/:id([0-9a-fA-F]{24})", requireAuth(["superadmin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const { quotes } = await getCollections();
    const result = await quotes.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Quote not found" });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("[quotes] Delete failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
