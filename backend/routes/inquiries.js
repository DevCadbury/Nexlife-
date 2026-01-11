import express from "express";
import { ObjectId } from "mongodb";
import { getCollections, addLog } from "../db.js";
import { logCommunication, ActivityLevel } from "../config/logger.js";
import { requireAuth } from "./auth.js";
import { sendEmail, validateEmail } from "../config/email.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Function to get all staff emails for notifications
async function getStaffEmails() {
  try {
    const { staff } = await getCollections();
    const staffMembers = await staff
      .find({
        role: { $in: ["admin", "superadmin", "staff"] },
      })
      .toArray();
    return staffMembers.map((user) => user.email).filter(Boolean);
  } catch (error) {
    console.error("Error fetching staff emails:", error);
    return [];
  }
}

// Function to send staff notification
export async function sendStaffNotification(
  inquiryEmail,
  fromName,
  subject,
  message
) {
  try {
    const staffEmails = await getStaffEmails();
    if (staffEmails.length === 0) return;

    const notificationSubject = `New Reply Added - ${subject}`;
    // Limit message size for notifications
    const truncatedMessage =
      message.length > 200 ? message.substring(0, 200) + "..." : message;

    const notificationMessage = `
A new reply has been added to the conversation with ${inquiryEmail}.

From: ${fromName}
Subject: ${subject}
Message: ${truncatedMessage}

Please check the admin panel for the full conversation.
    `.trim();

    // Send notification to all staff
    for (const staffEmail of staffEmails) {
      try {
        await sendEmail(
          staffEmail,
          "contact", // Use existing contact template
          {
            name: fromName,
            email: inquiryEmail,
            subject: subject,
            message: truncatedMessage,
          },
          {
            subject: notificationSubject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">New Reply Added</h2>
                <p><strong>Customer:</strong> ${inquiryEmail}</p>
                <p><strong>From:</strong> ${fromName}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                  <p><strong>Message Preview:</strong></p>
                  <p>${truncatedMessage}</p>
                </div>
                <p style="color: #666; font-size: 14px;">
                  Please check the admin panel for the full conversation.
                </p>
              </div>
            `,
          }
        );
      } catch (emailError) {
        console.error(
          `Failed to send notification to ${staffEmail}:`,
          emailError
        );
      }
    }
  } catch (error) {
    console.error("Error sending staff notifications:", error);
  }
}

// Function to broadcast dashboard notification to all connected admin/staff
export const broadcastDashboardNotification = (notificationData) => {
  if (!global.dashboardConnections) return;

  const message = `data: ${JSON.stringify({
    type: "dashboard_notification",
    ...notificationData,
  })}\n\n`;

  for (const [connectionId, connection] of global.dashboardConnections) {
    try {
      connection.res.write(message);
    } catch (error) {
      global.dashboardConnections.delete(connectionId);
    }
  }
};

const router = express.Router();

// Image upload endpoint
router.post(
  "/upload-image",
  requireAuth(),
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              folder: "nexlife-inquiries",
              transformation: [
                { width: 1200, height: 1200, crop: "limit" },
                { quality: "auto" },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      res.json({
        success: true,
        imageUrl: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  }
);

function sanitizeString(value, max = 5000) {
  if (typeof value !== "string") return "";
  return value.toString().slice(0, max).trim();
}

// POST /api/inquiries - public submission
router.post("/", async (req, res) => {
  const { name, email, phone, message, subject, productName, company } =
    req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  try {
    const { inquiries, subscribers } = await getCollections();
    const doc = {
      name: sanitizeString(name, 100),
      email: sanitizeString(email, 200).toLowerCase(),
      phone: sanitizeString(phone || "", 40),
      company: sanitizeString(company || "", 120),
      subject: sanitizeString(subject || "", 200),
      productName: sanitizeString(productName || "", 200),
      message: sanitizeString(message, 5000),
      status: "new", // new -> read -> replied
      createdAt: new Date(),
      updatedAt: new Date(),
      replyCount: 0,
      lastReplyAt: null,
    };

    const insert = await inquiries.insertOne(doc);

    // upsert subscriber email
    if (email) {
      await subscribers.updateOne(
        { email: doc.email },
        {
          $setOnInsert: {
            email: doc.email,
            createdAt: new Date(),
          },
          $set: { lastSeenAt: new Date() },
        },
        { upsert: true }
      );
    }

    await addLog({
      type: "inquiry.created",
      refId: insert.insertedId,
      actor: "public",
      meta: { email: doc.email },
    });

    // Send admin notification using existing template
    const toAddress = process.env.CONTACT_TO || process.env.SMTP_USER;
    await sendEmail(toAddress, "contact", {
      name: doc.name,
      email: doc.email,
      subject: doc.subject || `New inquiry from ${doc.name}`,
      message: doc.message,
    });

    // Send confirmation email to customer with catalogue attachment
    try {
      const cataloguePath = path.join(process.cwd(), "public", "catalogue.pdf");
      const attachments = [];

      // Check if catalogue PDF exists
      if (fs.existsSync(cataloguePath)) {
        attachments.push({
          filename: "Nexlife_Product_Catalogue.pdf",
          path: cataloguePath,
          contentType: "application/pdf",
        });
      }

      const baseUrl = process.env.FRONTEND_URL || "https://nexlifeinternational.com";
      const catalogueUrl = `${baseUrl}/catalogue.pdf`;

      await sendEmail(
        doc.email,
        "inquiryConfirmation",
        {
          name: doc.name,
          email: doc.email,
          subject: doc.subject || "Your Inquiry",
          inquiryId: insert.insertedId.toString().slice(-6).toUpperCase(), // Last 6 chars of ObjectId
          catalogueUrl,
        },
        attachments.length > 0 ? { attachments } : {}
      );
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the inquiry creation if confirmation email fails
    }

    return res.json({ success: true, id: insert.insertedId });
  } catch (err) {
    console.error("Create inquiry failed", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/inquiries - list for dashboard
router.get("/", requireAuth(), async (req, res) => {
  try {
    const { status, email, q, limit = 50, offset = 0 } = req.query || {};
    const { inquiries } = await getCollections();
    const filter = {};
    if (status) filter.status = String(status);
    if (email) filter.email = String(email).toLowerCase();
    if (q) {
      const text = String(q).trim();
      // Use regex-based fallback to avoid missing text index errors
      const rx = new RegExp(text.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");
      filter.$or = [
        { name: rx },
        { email: rx },
        { phone: rx },
        { subject: rx },
        { message: rx },
      ];
    }

    const raw = await inquiries
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(offset) || 0)
      .limit(Math.min(Number(limit) || 50, 200))
      .toArray();

    // Normalize ObjectId to string for frontend safety
    const items = raw.map((d) => ({
      ...d,
      _id: String(d._id),
    }));

    const total = await inquiries.countDocuments(filter);
    return res.json({ total, items });
  } catch (err) {
    console.error("List inquiries failed", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/inquiries/:id/status - update status
router.patch(
  "/:id([0-9a-fA-F]{24})/status",
  requireAuth(),
  async (req, res) => {
    const id = req.params.id;
    const { status } = req.body || {};
    if (!id || !status) return res.status(400).json({ error: "Bad request" });
    if (!["new", "read", "replied"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    try {
      const { inquiries } = await getCollections();
      const _id = new ObjectId(id);
      await inquiries.updateOne(
        { _id },
        { $set: { status, updatedAt: new Date() } }
      );
      await logCommunication(req, {
        level: ActivityLevel.INFO,
        type: "inquiry.status",
        message: `Inquiry ${id} status updated to ${status}`,
        refId: _id,
        actorId: req.user?.id,
        actorName: req.user?.name,
        customerId: undefined,
        customerName: undefined,
        status,
        channel: "email",
        meta: { status },
      });
      return res.json({ success: true });
    } catch (err) {
      console.error("Update status failed", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PATCH /api/inquiries/:id/mark-unread - revert status to new
router.patch(
  "/:id([0-9a-fA-F]{24})/mark-unread",
  requireAuth(),
  async (req, res) => {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Bad request" });
    try {
      const { inquiries } = await getCollections();
      const _id = new ObjectId(id);
      await inquiries.updateOne(
        { _id },
        { $set: { status: "new", updatedAt: new Date() } }
      );
      await addLog({
        type: "inquiry.status",
        refId: _id,
        actor: "admin",
        meta: { status: "new" },
      });
      return res.json({ success: true });
    } catch (err) {
      console.error("Mark unread failed", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PATCH /api/inquiries/:id/replies/:idx/note - superadmin can edit or delete note
router.patch(
  "/:id([0-9a-fA-F]{24})/replies/:idx/note",
  requireAuth(["superadmin"]),
  async (req, res) => {
    const id = req.params.id;
    const idx = Number(req.params.idx);
    const { note } = req.body || {};
    if (!id || Number.isNaN(idx))
      return res.status(400).json({ error: "Bad request" });
    try {
      const { inquiries } = await getCollections();
      const _id = new ObjectId(id);
      const doc = await inquiries.findOne({ _id });
      if (
        !doc ||
        !Array.isArray(doc.replies) ||
        idx < 0 ||
        idx >= doc.replies.length
      )
        return res.status(404).json({ error: "Reply not found" });
      const path = `replies.${idx}.note`;
      const update = note
        ? { $set: { [path]: String(note) } }
        : { $unset: { [path]: "" } };
      await inquiries.updateOne({ _id }, update);
      await logCommunication(req, {
        level: ActivityLevel.INFO,
        type: "inquiry.note",
        message: `Inquiry ${id} note ${note ? "updated" : "cleared"}`,
        refId: _id,
        actorId: req.user?.id,
        actorName: req.user?.name,
      });
      return res.json({ success: true });
    } catch (e) {
      console.error("Update note failed", e);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PATCH /api/inquiries/:id/meta - update CRM metadata (priority, tags, notes, assignees, reminderAt)
router.patch("/:id([0-9a-fA-F]{24})/meta", requireAuth(), async (req, res) => {
  const id = req.params.id;
  const { priority, tags, notes, assignees, reminderAt } = req.body || {};
  if (!id) return res.status(400).json({ error: "Bad request" });
  try {
    const _id = new ObjectId(id);
    const $set = { updatedAt: new Date() };
    if (priority !== undefined) $set.priority = String(priority || "");
    if (Array.isArray(tags))
      $set.tags = tags.map((t) => String(t || "")).slice(0, 20);
    if (notes !== undefined) $set.notes = String(notes || "");
    if (Array.isArray(assignees))
      $set.assignees = assignees.map((t) => String(t || "")).slice(0, 20);
    if (reminderAt !== undefined)
      $set.reminderAt = reminderAt ? new Date(reminderAt) : null;

    const { inquiries } = await getCollections();
    await inquiries.updateOne({ _id }, { $set });
    await logCommunication(req, {
      level: ActivityLevel.INFO,
      type: "inquiry.meta",
      message: `Inquiry ${id} metadata updated`,
      refId: _id,
      actorId: req.user?.id,
      actorName: req.user?.name,
      meta: { priority, tags, notes, assignees, reminderAt },
    });
    return res.json({ success: true });
  } catch (err) {
    console.error("Update meta failed", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/inquiries/:id/reply - admin reply (sends email)
router.post("/:id([0-9a-fA-F]{24})/reply", requireAuth(), async (req, res) => {
  const id = req.params.id;
  const { subject, message, fromName, attachments = [], note } = req.body || {};
  if (!id || !subject || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const { inquiries } = await getCollections();
    const _id = new ObjectId(id);
    const inquiry = await inquiries.findOne({ _id });
    if (!inquiry) return res.status(404).json({ error: "Not found" });

    const to = inquiry.email;
    // Build nodemailer attachments if provided (expects base64 content)
    const files = Array.isArray(attachments)
      ? attachments
          .slice(0, 10)
          .map((a) => ({
            filename: sanitizeString(a.filename || "attachment", 120),
            content:
              typeof a.content === "string"
                ? Buffer.from(a.content, "base64")
                : undefined,
            contentType: sanitizeString(
              a.contentType || "application/octet-stream",
              100
            ),
          }))
          .filter((f) => !!f.content)
      : [];

    const result = await sendEmail(
      to,
      "contact",
      {
        name: inquiry.name,
        email: to,
        subject,
        message,
      },
      {
        ...(files.length ? { attachments: files } : {}),
        replyTo: process.env.SMTP_USER, // ensure customer replies to info@
      }
    );

    if (!result.success) {
      return res
        .status(502)
        .json({ error: "Email failed", details: result.error });
    }

    await inquiries.updateOne(
      { _id },
      {
        $set: {
          status: "replied",
          updatedAt: new Date(),
          lastReplyAt: new Date(),
        },
        $inc: { replyCount: 1 },
        $push: {
          replies: {
            at: new Date(),
            subject: sanitizeString(subject, 200),
            message: sanitizeString(message, 5000),
            fromName: sanitizeString(fromName || "Admin", 100),
            messageId: result.messageId || null,
            attachments: files.map((f) => ({
              filename: f.filename,
              contentType: f.contentType,
            })),
            note: note ? sanitizeString(note, 2000) : undefined,
          },
        },
      }
    );

    await logCommunication(req, {
      level: ActivityLevel.SUCCESS,
      type: "inquiry.replied",
      message: `Replied to ${inquiry.email}`,
      refId: _id,
      actorId: req.user?.id,
      actorName: req.user?.name || sanitizeString(fromName || "Admin", 100),
      customerName: inquiry.name,
      customerId: String(_id),
      channel: "email",
      status: "sent",
      meta: { subject },
    });
    return res.json({ success: true, messageId: result.messageId });
  } catch (err) {
    console.error("Reply failed", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/inquiries/:id - delete entire inquiry thread (superadmin only)
router.delete("/:id([0-9a-fA-F]{24})", async (req, res) => {
  try {
    // Authorization check: verify JWT token and superadmin role
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      const jwt = await import("jsonwebtoken");
      decoded = jwt.default.verify(
        token,
        process.env.JWT_SECRET || "fallback-secret"
      );
    } catch (jwtError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userRole = (decoded.role || decoded.userRole || "").toLowerCase();
    if (userRole !== "superadmin") {
      return res.status(403).json({
        error: "Insufficient permissions. Superadmin role required.",
      });
    }

    const id = req.params.id;
    const _id = new ObjectId(id);
    const { inquiries } = await getCollections();
    const doc = await inquiries.findOne({ _id });
    if (!doc) return res.status(404).json({ error: "Inquiry not found" });

    // Delete the inquiry
    await inquiries.deleteOne({ _id });

    await logCommunication(req, {
      level: ActivityLevel.WARN,
      type: "inquiry.deleted",
      message: `Deleted entire inquiry thread for ${doc.email}`,
      refId: _id,
      actorId: (decoded && decoded.id) || req.user?.id,
      actorName:
        (decoded && (decoded.name || decoded.email)) || req.user?.name,
      meta: {
        email: doc.email,
        subject: doc.subject || null,
        messagePreview: (doc.message || "").slice(0, 200),
      },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Delete inquiry failed", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/inquiries/:id/replies/:idx - delete a reply (superadmin only)
router.delete(
  "/:id([0-9a-fA-F]{24})/replies/:idx([0-9]+)",
  async (req, res) => {
    try {
      // Authorization check: verify JWT token and superadmin role
      const authHeader = req.headers.authorization;
      console.log("Delete request headers:", req.headers);
      console.log("Authorization header:", authHeader);
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
      }

      const token = authHeader.substring(7);
      let decoded;
      try {
        const jwt = await import("jsonwebtoken");
        console.log("JWT_SECRET from env:", process.env.JWT_SECRET);
        console.log("JWT_SECRET length:", process.env.JWT_SECRET?.length);
        console.log("Token to verify:", token.substring(0, 50) + "...");
        decoded = jwt.default.verify(
          token,
          process.env.JWT_SECRET || "fallback-secret"
        );
        console.log("JWT verification successful:", decoded);
      } catch (jwtError) {
        console.log("JWT verification failed:", jwtError.message);
        return res.status(401).json({ error: "Invalid token" });
      }

      const userRole = (decoded.role || decoded.userRole || "").toLowerCase();
      if (userRole !== "superadmin") {
        return res.status(403).json({
          error: "Insufficient permissions. Superadmin role required.",
        });
      }

      const id = req.params.id;
      const idx = Number(req.params.idx);
      const _id = new ObjectId(id);
      const { inquiries } = await getCollections();
      const doc = await inquiries.findOne({ _id });
      if (!doc) return res.status(404).json({ error: "Inquiry not found" });
      if (!Array.isArray(doc.replies) || idx < 0 || idx >= doc.replies.length)
        return res.status(400).json({ error: "Invalid reply index" });
      const pullTarget = doc.replies[idx];
      await inquiries.updateOne({ _id }, { $pull: { replies: pullTarget } });
      await logCommunication(req, {
        level: ActivityLevel.WARN,
        type: "inquiry.reply.deleted",
        message: `Deleted reply #${idx} on inquiry ${id}`,
        refId: _id,
        actorId: (decoded && decoded.id) || req.user?.id,
        actorName:
          (decoded && (decoded.name || decoded.email)) || req.user?.name,
        meta: {
          idx,
          subject: pullTarget?.subject || null,
          messagePreview: (pullTarget?.message || "").slice(0, 200),
          fromName: pullTarget?.fromName || null,
        },
      });
      return res.json({ success: true });
    } catch (err) {
      console.error("Delete reply failed", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/inquiries/:id - fetch single inquiry with replies (admin/staff)
router.get("/:id([0-9a-fA-F]{24})", requireAuth(), async (req, res) => {
  try {
    const id = req.params.id;
    const _id = new ObjectId(id);
    const { inquiries } = await getCollections();
    const doc = await inquiries.findOne({ _id });
    if (!doc) return res.status(404).json({ error: "Not found" });
    // normalize
    const data = { ...doc, _id: String(doc._id) };
    return res.json({ inquiry: data });
  } catch (err) {
    console.error("Get inquiry failed", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

// ===== Thread helpers and endpoints =====

// GET /api/inquiries/threads?email=foo@example.com
router.get("/threads", requireAuth(), async (req, res) => {
  try {
    const email = String(req.query.email || "")
      .toLowerCase()
      .trim();
    if (!email) return res.status(400).json({ error: "email is required" });
    const { inquiries } = await getCollections();
    const messages = await inquiries
      .find({ email })
      .sort({ createdAt: 1 })
      .toArray();

    // Flatten into unified timeline
    const events = [];
    for (const msg of messages) {
      events.push({
        type: "inbound",
        at: msg.createdAt || msg.updatedAt || new Date(),
        subject: msg.subject || null,
        message: msg.message || "",
        fromName: msg.name || "Unknown",
        inquiryId: String(msg._id),
        status: msg.status || "new",
        inbound: true,
      });
      if (Array.isArray(msg.replies)) {
        for (let ri = 0; ri < msg.replies.length; ri++) {
          const r = msg.replies[ri];
          events.push({
            type: "reply",
            at: r.at || new Date(),
            subject: r.subject || null,
            message: r.message || "",
            fromName: r.fromName || "Admin",
            inquiryId: String(msg._id),
            status: "replied",
            inbound: !!r.inbound,
            note: r.note || null,
            replyIdx: ri,
          });
        }
      }
    }
    events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    const latest = messages[messages.length - 1] || null;
    return res.json({
      email,
      totalInquiries: messages.length,
      latestInquiryId: latest?._id || null,
      events,
    });
  } catch (err) {
    console.error("Fetch threads failed", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Lightweight count of new inquiries for notifications
router.get("/new/count", requireAuth(), async (req, res) => {
  try {
    const { inquiries } = await getCollections();
    const count = await inquiries.countDocuments({ status: "new" });
    res.json({ count });
  } catch (err) {
    console.error("New inquiries count failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/inquiries/:id/mark-seen - mark inquiry as seen by agent
router.patch("/:id([0-9a-fA-F]{24})/mark-seen", requireAuth(), async (req, res) => {
  const id = req.params.id;
  const { agentName } = req.body || {};
  if (!id || !agentName) return res.status(400).json({ error: "Bad request" });
  try {
    const { inquiries } = await getCollections();
    const _id = new ObjectId(id);
    
    // Check if agent has already seen this inquiry
    const inquiry = await inquiries.findOne({ _id });
    if (!inquiry) return res.status(404).json({ error: "Inquiry not found" });
    
    const alreadySeen = Array.isArray(inquiry.seenBy) && 
      inquiry.seenBy.some(entry => 
        typeof entry === 'object' && entry.agentName === agentName
      );
    
    if (!alreadySeen) {
      // Add agentName with timestamp to seenBy array
      await inquiries.updateOne(
        { _id },
        { 
          $push: { 
            seenBy: { 
              agentName: agentName, 
              seenAt: new Date() 
            } 
          },
          $set: { updatedAt: new Date() }
        }
      );
    }
    
    return res.json({ success: true });
  } catch (err) {
    console.error("Mark seen failed", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/inquiries/threads/mark-seen - mark thread as seen by agent
router.patch("/threads/mark-seen", requireAuth(), async (req, res) => {
  const { email, agentName } = req.body || {};
  if (!email || !agentName) return res.status(400).json({ error: "Bad request" });
  try {
    const emailLc = String(email).toLowerCase().trim();
    const { inquiries } = await getCollections();
    
    // Get all inquiries for this email
    const inquiriesForEmail = await inquiries.find({ email: emailLc }).toArray();
    
    // Update each inquiry, adding agent with timestamp if not already seen
    for (const inquiry of inquiriesForEmail) {
      const alreadySeen = Array.isArray(inquiry.seenBy) && 
        inquiry.seenBy.some(entry => 
          typeof entry === 'object' && entry.agentName === agentName
        );
      
      if (!alreadySeen) {
        await inquiries.updateOne(
          { _id: inquiry._id },
          { 
            $push: { 
              seenBy: { 
                agentName: agentName, 
                seenAt: new Date() 
              } 
            },
            $set: { updatedAt: new Date() }
          }
        );
      }
    }
    
    return res.json({ success: true });
  } catch (err) {
    console.error("Mark thread seen failed", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/inquiries/threads/reply { email, subject, message, fromName, inquiryId }
router.post("/threads/reply", requireAuth(), async (req, res) => {
  const {
    email,
    subject,
    message,
    fromName,
    inquiryId,
    attachments = [],
  } = req.body || {};
  if (!email || !subject || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const { inquiries } = await getCollections();
    const emailLc = String(email).toLowerCase().trim();
    let targetDoc = null;
    if (inquiryId) {
      try {
        targetDoc = await inquiries.findOne({
          _id: new ObjectId(String(inquiryId)),
        });
      } catch {}
    }
    if (!targetDoc) {
      const latest = await inquiries
        .find({ email: emailLc })
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();
      targetDoc = latest[0];
    }
    if (!targetDoc)
      return res.status(404).json({ error: "No inquiry for email" });

    const to = emailLc;
    // Try to send email, but even if it fails, store the reply to keep full history
    let result = { success: false, messageId: null, error: null };
    try {
      const files = Array.isArray(attachments)
        ? attachments
            .slice(0, 10)
            .map((a) => ({
              filename: sanitizeString(a.filename || "attachment", 120),
              content:
                typeof a.content === "string"
                  ? Buffer.from(a.content, "base64")
                  : undefined,
              contentType: sanitizeString(
                a.contentType || "application/octet-stream",
                100
              ),
            }))
            .filter((f) => !!f.content)
        : [];
      const r = await sendEmail(
        to,
        "contact",
        {
          name: targetDoc.name,
          email: to,
          subject,
          message,
        },
        files.length ? { attachments: files } : {}
      );
      result = {
        success: !!r.success,
        messageId: r.messageId || null,
        error: r.error || null,
      };
    } catch (e) {
      result = { success: false, messageId: null, error: String(e) };
    }
    const _id = new ObjectId(targetDoc._id);
    await inquiries.updateOne(
      { _id },
      {
        $set: {
          status: "replied",
          updatedAt: new Date(),
          lastReplyAt: new Date(),
        },
        $inc: { replyCount: 1 },
        $push: {
          replies: {
            _id: new ObjectId(),
            at: new Date(),
            subject: sanitizeString(subject, 200),
            message: sanitizeString(message, 5000),
            fromName: sanitizeString(fromName || "Admin", 100),
            messageId: result.messageId || null,
            attachments: (attachments || []).map((a) => ({
              filename: sanitizeString(a.filename || "attachment", 120),
              contentType: sanitizeString(
                a.contentType || "application/octet-stream",
                100
              ),
            })),
          },
        },
      }
    );
    await logCommunication(req, {
      level: ActivityLevel.SUCCESS,
      type: "inquiry.replied",
      message: `Replied to ${emailLc}`,
      refId: _id,
      actorId: req.user?.id,
      actorName: req.user?.name || sanitizeString(fromName || "Admin", 100),
      customerName: targetDoc.name,
      customerId: String(_id),
      channel: "email",
      status: result.success ? "sent" : "failed",
      meta: { email: emailLc, subject },
    });

    // Do not notify staff for staff-sent replies; notifications handled for inbound via IMAP

    // Broadcast dashboard notification to all connected admin/staff
    broadcastDashboardNotification({
      subtype: "new_reply",
      inquiryEmail: emailLc,
      fromName,
      subject,
      message: message.substring(0, 100) + (message.length > 100 ? "..." : ""),
      timestamp: new Date().toISOString(),
    });

    return res.json({
      success: true,
      messageId: result.messageId,
      inquiryId: targetDoc._id,
      emailSent: result.success,
      emailError: result.success ? null : result.error,
    });
  } catch (err) {
    console.error("Thread reply failed", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/inquiries/threads/mark-read-all { email }
router.patch("/threads/mark-read-all", requireAuth(), async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "email is required" });
  try {
    const emailLc = String(email).toLowerCase().trim();
    const { inquiries } = await getCollections();
    const result = await inquiries.updateMany(
      { email: emailLc, status: { $ne: "replied" } },
      { $set: { status: "read", updatedAt: new Date() } }
    );
    return res.json({ success: true, modified: result.modifiedCount || 0 });
  } catch (err) {
    console.error("Mark all read failed", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// SSE endpoint for real-time thread updates
router.get("/threads/:email/stream", requireAuth(), async (req, res) => {
  const { email } = req.params;

  // Set SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  // Send initial connection confirmation
  res.write(
    `data: ${JSON.stringify({
      type: "connected",
      message: "SSE connection established",
    })}\n\n`
  );

  // Store this connection for broadcasting updates
  if (!global.sseConnections) {
    global.sseConnections = new Map();
  }

  const connectionId = `${email}-${Date.now()}`;
  global.sseConnections.set(connectionId, { res, email });

  // Clean up on disconnect
  req.on("close", () => {
    if (global.sseConnections) {
      global.sseConnections.delete(connectionId);
    }
  });

  // Keep connection alive with periodic ping
  const pingInterval = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ type: "ping" })}\n\n`);
    } catch (error) {
      clearInterval(pingInterval);
      if (global.sseConnections) {
        global.sseConnections.delete(connectionId);
      }
    }
  }, 30000);

  req.on("close", () => {
    clearInterval(pingInterval);
  });
});

// Get recent replies count (individual per user)
router.get("/replies/count", requireAuth(), async (req, res) => {
  try {
    const { inquiries } = await getCollections();
    const userId = req.user.id;

    // Count replies from the last 24 hours that this user hasn't read
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const pipeline = [
      { $unwind: "$replies" },
      {
        $match: {
          "replies.at": { $gte: since },
          "replies.inbound": true,
          $or: [
            { "replies.readBy": { $exists: false } },
            { "replies.readBy": { $ne: userId } },
          ],
        },
      },
      { $count: "count" },
    ];

    const result = await inquiries.aggregate(pipeline).toArray();
    const count = result.length > 0 ? result[0].count : 0;

    res.json({ count });
  } catch (error) {
    console.error("Error getting replies count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get recent replies (individual per user)
router.get("/replies/recent", requireAuth(), async (req, res) => {
  try {
    const { inquiries } = await getCollections();
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // Get recent replies from the last 24 hours that this user hasn't read
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const pipeline = [
      { $unwind: "$replies" },
      {
        $match: {
          "replies.at": { $gte: since },
          "replies.inbound": true,
          $or: [
            { "replies.readBy": { $exists: false } },
            { "replies.readBy": { $ne: userId } },
          ],
        },
      },
      { $sort: { "replies.at": -1 } },
      { $limit: limit },
      {
        $project: {
          _id: "$replies._id",
          from: "$replies.fromName",
          fromName: "$replies.fromName",
          subject: "$replies.subject",
          message: "$replies.message",
          createdAt: "$replies.at",
          inquiryEmail: "$email",
          inquiryId: "$_id",
          readBy: "$replies.readBy",
        },
      },
    ];

    const replies = await inquiries.aggregate(pipeline).toArray();

    res.json({ items: replies });
  } catch (error) {
    console.error("Error getting recent replies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Test endpoint to verify server is working
router.get("/test-replies", (req, res) => {
  res.json({
    message: "Replies endpoint is working",
    timestamp: new Date().toISOString(),
  });
});

// Simple migration endpoint (no auth required for testing)
router.get("/migrate-replies", async (req, res) => {
  try {
    const { inquiries } = await getCollections();

    // Find all inquiries with replies that don't have _id
    const inquiriesWithReplies = await inquiries
      .find({
        replies: { $exists: true, $ne: [] },
      })
      .toArray();

    let updatedCount = 0;

    for (const inquiry of inquiriesWithReplies) {
      let needsUpdate = false;
      const updatedReplies = inquiry.replies.map((reply) => {
        if (!reply._id) {
          needsUpdate = true;
          return {
            ...reply,
            _id: new ObjectId(),
          };
        }
        return reply;
      });

      if (needsUpdate) {
        await inquiries.updateOne(
          { _id: inquiry._id },
          { $set: { replies: updatedReplies } }
        );
        updatedCount++;
        console.log(
          `Updated inquiry ${inquiry._id} with ${updatedReplies.length} replies`
        );
      }
    }

    res.json({
      success: true,
      message: `Migrated ${updatedCount} inquiries with replies`,
      updatedCount,
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({ error: "Migration failed" });
  }
});

// Migration endpoint to add _id fields to existing replies
router.post("/migrate-replies", requireAuth(), async (req, res) => {
  try {
    const { inquiries } = await getCollections();

    // Find all inquiries with replies that don't have _id
    const inquiriesWithReplies = await inquiries
      .find({
        replies: { $exists: true, $ne: [] },
      })
      .toArray();

    let updatedCount = 0;

    for (const inquiry of inquiriesWithReplies) {
      let needsUpdate = false;
      const updatedReplies = inquiry.replies.map((reply) => {
        if (!reply._id) {
          needsUpdate = true;
          return {
            ...reply,
            _id: new ObjectId(),
          };
        }
        return reply;
      });

      if (needsUpdate) {
        await inquiries.updateOne(
          { _id: inquiry._id },
          { $set: { replies: updatedReplies } }
        );
        updatedCount++;
        console.log(
          `Updated inquiry ${inquiry._id} with ${updatedReplies.length} replies`
        );
      }
    }

    res.json({
      success: true,
      message: `Migrated ${updatedCount} inquiries with replies`,
      updatedCount,
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({ error: "Migration failed" });
  }
});

// Mark reply as read (individual per staff member)
router.patch("/replies/:replyId/mark-read", requireAuth(), async (req, res) => {
  try {
    const { replyId } = req.params;
    const userId = req.user.id; // Get the current user's ID
    console.log("Marking reply as read:", replyId, "for user:", userId);

    const { inquiries } = await getCollections();

    // Try to find the reply first to see if it exists
    const inquiry = await inquiries.findOne({
      "replies._id": new ObjectId(replyId),
    });
    console.log("Found inquiry:", inquiry ? "Yes" : "No");

    if (!inquiry) {
      console.log("Reply not found in any inquiry:", replyId);
      return res.status(404).json({ error: "Reply not found" });
    }

    // Find the specific reply to check its current state
    const reply = inquiry.replies.find(
      (r) => r._id && r._id.toString() === replyId
    );
    console.log("Found reply:", reply ? "Yes" : "No");
    if (reply) {
      console.log("Reply current state:", {
        _id: reply._id,
        fromName: reply.fromName,
        readBy: reply.readBy || [],
        at: reply.at,
      });
    } else {
      console.log(
        "Reply not found in inquiry, but inquiry was found. This might be a migration issue."
      );
      return res
        .status(404)
        .json({ error: "Reply not found - may need migration" });
    }

    // If reply was found, add user to readBy array
    if (reply) {
      const result = await inquiries.updateOne(
        {
          "replies._id": new ObjectId(replyId),
          "replies.readBy": { $ne: userId },
        },
        {
          $addToSet: { "replies.$.readBy": userId },
        }
      );

      console.log("Update result:", result);

      if (result.matchedCount === 0) {
        const alreadyRead = reply.readBy && reply.readBy.includes(userId);
        if (alreadyRead) {
          console.log("User already marked this reply as read");
          return res.json({ success: true, message: "Already marked as read" });
        }
        console.log("Reply not found or user already read:", replyId);
        // Treat as idempotent success to avoid client 404 noise
        return res.json({ success: true, message: "No change" });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking reply as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mark all replies as read (individual per user)
router.patch("/replies/mark-all-read", requireAuth(), async (req, res) => {
  try {
    const { inquiries } = await getCollections();
    const userId = req.user.id;

    // Find all inquiries with unread inbound replies for this user
    const inquiriesWithUnreadReplies = await inquiries
      .find({
        "replies.inbound": true,
        $or: [
          { "replies.readBy": { $exists: false } },
          { "replies.readBy": { $ne: userId } },
        ],
      })
      .toArray();

    // Update each inquiry to add this user to readBy for all unread replies
    for (const inquiry of inquiriesWithUnreadReplies) {
      const updatedReplies = inquiry.replies.map((reply) => {
        if (
          reply.inbound &&
          (!reply.readBy || !reply.readBy.includes(userId))
        ) {
          return {
            ...reply,
            readBy: [...(reply.readBy || []), userId],
          };
        }
        return reply;
      });

      await inquiries.updateOne(
        { _id: inquiry._id },
        { $set: { replies: updatedReplies } }
      );
    }

    res.json({
      success: true,
      message: `Marked all replies as read for user ${userId}`,
      updatedInquiries: inquiriesWithUnreadReplies.length,
    });
  } catch (error) {
    console.error("Error marking all replies as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// SSE endpoint for dashboard notifications (all admin/staff)
router.get("/notifications/stream", requireAuth(), async (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });
  res.write(
    `data: ${JSON.stringify({
      type: "connected",
      message: "Dashboard notification stream established",
    })}\n\n`
  );

  if (!global.dashboardConnections) {
    global.dashboardConnections = new Map();
  }
  const connectionId = `dashboard-${Date.now()}-${Math.random()}`;
  global.dashboardConnections.set(connectionId, { res });

  req.on("close", () => {
    if (global.dashboardConnections) {
      global.dashboardConnections.delete(connectionId);
    }
  });

  const pingInterval = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ type: "ping" })}\n\n`);
    } catch (error) {
      clearInterval(pingInterval);
      if (global.dashboardConnections) {
        global.dashboardConnections.delete(connectionId);
      }
    }
  }, 30000);

  req.on("close", () => {
    clearInterval(pingInterval);
  });
});

// Global dashboard notifications stream endpoint
router.get("/notifications/stream", requireAuth(), async (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  // Send initial connection confirmation
  res.write(
    `data: ${JSON.stringify({
      type: "connected",
      message: "Dashboard notifications connected",
    })}\n\n`
  );

  // Store this connection for broadcasting dashboard updates
  if (!global.dashboardConnections) {
    global.dashboardConnections = new Set();
  }

  const connectionId = `dashboard-${Date.now()}-${Math.random()}`;
  global.dashboardConnections.add({ id: connectionId, res, user: req.user });

  // Clean up on disconnect
  req.on("close", () => {
    if (global.dashboardConnections) {
      global.dashboardConnections.forEach((conn) => {
        if (conn.id === connectionId) {
          global.dashboardConnections.delete(conn);
        }
      });
    }
  });

  // Keep connection alive with periodic ping
  const pingInterval = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ type: "ping" })}\n\n`);
    } catch (error) {
      clearInterval(pingInterval);
      if (global.dashboardConnections) {
        global.dashboardConnections.forEach((conn) => {
          if (conn.id === connectionId) {
            global.dashboardConnections.delete(conn);
          }
        });
      }
    }
  }, 30000);

  req.on("close", () => {
    clearInterval(pingInterval);
  });
});

// Helper function to broadcast thread updates
export const broadcastThreadUpdate = (email, updateData) => {
  if (!global.sseConnections) return;

  const message = `data: ${JSON.stringify({
    type: "thread_update",
    ...updateData,
  })}\n\n`;

  for (const [connectionId, connection] of global.sseConnections) {
    if (connection.email === email) {
      try {
        connection.res.write(message);
      } catch (error) {
        // Remove dead connections
        global.sseConnections.delete(connectionId);
      }
    }
  }
};
