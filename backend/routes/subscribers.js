import express from "express";
import { getCollections, addLog } from "../db.js";
import { sendEmail, sendBulkEmail, validateEmail } from "../config/email.js";
import { requireAuth } from "./auth.js";

const router = express.Router();

// GET /api/subscribers/stats
router.get("/stats", requireAuth(), async (req, res) => {
  try {
    const { subscribers } = await getCollections();
    const { role, id: userId } = req.user;
    
    if (role === "superadmin") {
      const total = await subscribers.countDocuments({ deleted_by_super: { $ne: true } });
      const locked = await subscribers.countDocuments({ 
        is_locked: true, 
        deleted_by_super: { $ne: true } 
      });
      const adminDeleted = await subscribers.countDocuments({ 
        deleted_by_admin: true, 
        deleted_by_super: { $ne: true } 
      });
      
      res.json({ 
        total, 
        locked, 
        adminDeleted,
        active: total - locked - adminDeleted
      });
    } else {
      const total = await subscribers.countDocuments({
        added_by: userId,
        deleted_by_admin: { $ne: true },
        deleted_by_super: { $ne: true }
      });
      const locked = await subscribers.countDocuments({
        added_by: userId,
        is_locked: true,
        deleted_by_super: { $ne: true }
      });
      
      res.json({ 
        total, 
        locked,
        active: total - locked
      });
    }
  } catch (err) {
    console.error("Get subscriber stats failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/subscribers
router.get("/", requireAuth(), async (req, res) => {
  try {
    const { subscribers } = await getCollections();
    const { role, id: userId } = req.user;
    
    let query = { deleted_by_super: { $ne: true } };
    
    if (role === "superadmin") {
      // Superadmin sees all subscribers except those deleted by superadmin
      query = { deleted_by_super: { $ne: true } };
    } else if (role === "admin") {
      // Admin sees only their own unlocked subscribers
      query = {
        added_by: userId,
        is_locked: { $ne: true },
        deleted_by_admin: { $ne: true },
        deleted_by_super: { $ne: true }
      };
    }
    
    const items = await subscribers
      .find(query)
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
router.post("/", requireAuth(), async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: "Valid email required" });
    }
    
    const { subscribers } = await getCollections();
    const { id: userId, role, name } = req.user;
    const normalizedEmail = String(email).toLowerCase();
    
    // Check if subscriber already exists
    const existing = await subscribers.findOne({ email: normalizedEmail });
    
    if (existing) {
      // If subscriber exists but was deleted by admin, allow re-adding by the same admin
      if (existing.deleted_by_admin && existing.added_by === userId) {
        await subscribers.updateOne(
          { email: normalizedEmail },
          {
            $set: {
              deleted_by_admin: false,
              added_at: new Date(),
              is_locked: false
            }
          }
        );
      } else if (existing.deleted_by_super) {
        return res.status(400).json({ error: "Subscriber was permanently removed" });
      } else {
        return res.status(400).json({ error: "Email already exists" });
      }
    } else {
      // Create new subscriber
      await subscribers.insertOne({
        email: normalizedEmail,
        added_by: userId,
        added_at: new Date(),
        createdAt: new Date(),
        is_locked: false,
        deleted_by_admin: false,
        deleted_by_super: false
      });
    }
    
    await addLog({ 
      type: "subscriber.added", 
      actorId: userId,
      actorName: name,
      meta: { email: normalizedEmail } 
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error("Add subscriber failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/subscribers/bulk - Bulk delete for superadmins
router.delete("/bulk", requireAuth(["superadmin"]), async (req, res) => {
  try {
    const { emails } = req.body || {};
    
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: "Array of emails required" });
    }
    
    const { subscribers } = await getCollections();
    const { id: userId, name } = req.user;
    
    const normalizedEmails = emails.map(email => String(email).toLowerCase());
    
    const result = await subscribers.updateMany(
      { email: { $in: normalizedEmails } },
      { $set: { deleted_by_super: true, deleted_at: new Date() } }
    );
    
    await addLog({
      type: "subscriber.bulk_removed",
      actorId: userId,
      actorName: name,
      meta: { 
        emails: normalizedEmails, 
        deletedBy: "superadmin",
        count: result.modifiedCount 
      },
    });
    
    res.json({ success: true, deleted: result.modifiedCount });
  } catch (err) {
    console.error("Bulk delete subscribers failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/subscribers/:email
router.delete("/:email", requireAuth(), async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email || "");
    const normalizedEmail = email.toLowerCase();
    const { subscribers } = await getCollections();
    const { role, id: userId, name } = req.user;
    
    const subscriber = await subscribers.findOne({ email: normalizedEmail });
    
    if (!subscriber) {
      return res.status(404).json({ error: "Subscriber not found" });
    }
    
    if (role === "superadmin") {
      // Superadmin can delete any subscriber anytime
      await subscribers.updateOne(
        { email: normalizedEmail },
        { $set: { deleted_by_super: true, deleted_at: new Date() } }
      );
      
      await addLog({
        type: "subscriber.removed",
        actorId: userId,
        actorName: name,
        meta: { email: normalizedEmail, deletedBy: "superadmin" },
      });
    } else if (role === "admin") {
      // Check if admin owns this subscriber
      if (subscriber.added_by !== userId) {
        return res.status(403).json({ error: "You can only delete subscribers you added" });
      }
      
      // Check if within 24 hours
      const addedAt = new Date(subscriber.added_at || subscriber.createdAt);
      const now = new Date();
      const hoursDiff = (now - addedAt) / (1000 * 60 * 60);
      
      if (hoursDiff <= 24) {
        // Within 24 hours - allow delete
        await subscribers.updateOne(
          { email: normalizedEmail },
          { $set: { deleted_by_admin: true, deleted_at: new Date() } }
        );
        
        await addLog({
          type: "subscriber.removed",
          actorId: userId,
          actorName: name,
          meta: { email: normalizedEmail, deletedBy: "admin", withinTimeLimit: true },
        });
      } else {
        // After 24 hours - lock subscriber (hide from admin)
        await subscribers.updateOne(
          { email: normalizedEmail },
          { $set: { is_locked: true, locked_at: new Date() } }
        );
        
        await addLog({
          type: "subscriber.locked",
          actorId: userId,
          actorName: name,
          meta: { email: normalizedEmail, reason: "attempted_delete_after_24h" },
        });
        
        return res.status(400).json({ 
          error: "Cannot delete subscriber after 24 hours. Contact superadmin for removal." 
        });
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error("Delete subscriber failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/subscribers/campaign - basic campaign send
router.post("/campaign", requireAuth(), async (req, res) => {
  try {
    const { subject, message, recipients } = req.body || {};
    if (!subject || !message)
      return res.status(400).json({ error: "Subject and message required" });
    const { subscribers, campaigns } = await getCollections();
    let targetEmails;
    if (Array.isArray(recipients) && recipients.length) {
      targetEmails = recipients.filter((e) => validateEmail(e)).map((e) => e.toLowerCase());
    } else {
      // Get active subscribers only (not deleted by superadmin)
      const activeSubscribers = await subscribers
        .find({ deleted_by_super: { $ne: true } })
        .project({ email: 1, _id: 0 })
        .toArray();
      targetEmails = activeSubscribers.map((d) => d.email);
    }

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
