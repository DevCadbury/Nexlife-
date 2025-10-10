import express from "express";
import { getCollections, addLog } from "../db.js";
import { sendEmail, sendBulkEmail, validateEmail } from "../config/email.js";

const router = express.Router();

// GET /api/subscribers
router.get("/", async (req, res) => {
  try {
    const { subscribers } = await getCollections();
    const items = await subscribers
      .find({})
      .project({ _id: 0 })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ total: items.length, items });
  } catch (err) {
    console.error("List subscribers failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/subscribers - add subscriber
router.post("/", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: "Valid email required" });
    }
    const { subscribers } = await getCollections();
    await subscribers.updateOne(
      { email: String(email).toLowerCase() },
      {
        $setOnInsert: {
          email: String(email).toLowerCase(),
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    await addLog({ type: "subscriber.added", actor: "admin", meta: { email } });
    res.json({ success: true });
  } catch (err) {
    console.error("Add subscriber failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/subscribers/:email
router.delete("/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email || "");
    const { subscribers } = await getCollections();
    await subscribers.deleteOne({ email: email.toLowerCase() });
    await addLog({
      type: "subscriber.removed",
      actor: "admin",
      meta: { email },
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete subscriber failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/subscribers/campaign - basic campaign send
router.post("/campaign", async (req, res) => {
  try {
    const { subject, message, recipients } = req.body || {};
    if (!subject || !message)
      return res.status(400).json({ error: "Subject and message required" });
    const { subscribers, campaigns } = await getCollections();
    let targetEmails =
      Array.isArray(recipients) && recipients.length
        ? recipients.filter((e) => validateEmail(e)).map((e) => e.toLowerCase())
        : (
            await subscribers.find({}).project({ email: 1, _id: 0 }).toArray()
          ).map((d) => d.email);

    const campaign = {
      subject,
      message,
      recipients: targetEmails,
      status: "sending",
      createdAt: new Date(),
    };
    const inserted = await campaigns.insertOne(campaign);

    const results = await sendBulkEmail(targetEmails, "contact", {
      name: "Subscriber",
      email: process.env.SMTP_USER,
      subject,
      message,
    });

    const sent = results.filter((r) => r.success).length;
    const failed = results.length - sent;

    await campaigns.updateOne(
      { _id: inserted.insertedId },
      { $set: { status: "completed", sent, failed, completedAt: new Date() } }
    );
    await addLog({
      type: "campaign.sent",
      actor: "admin",
      refId: inserted.insertedId,
      meta: { sent, failed },
    });
    res.json({ success: true, sent, failed });
  } catch (err) {
    console.error("Send campaign failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
