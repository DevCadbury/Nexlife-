import express from "express";
import { getCollections, addLog } from "../db.js";
import { sendEmail, sendBulkEmail, validateEmail } from "../config/email.js";
import { requireAuth } from "./auth.js";
import multer from "multer";
import csv from "csv-parser";
import xlsx from "xlsx";
import { Readable } from "stream";

const router = express.Router();

const MAX_NAME_LENGTH = 120;
const MAX_PHONE_LENGTH = 40;
const MAX_NOTE_LENGTH = 4000;

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const normalizeName = (value) => String(value || "").trim().slice(0, MAX_NAME_LENGTH);
const normalizePhone = (value) => String(value || "").trim().slice(0, MAX_PHONE_LENGTH);
const normalizeInternalNote = (value) =>
  String(value || "").trim().slice(0, MAX_NOTE_LENGTH);

const getOptionalSubscriberFields = (input = {}) => {
  const updates = {};

  if (input.name !== undefined) {
    updates.name = normalizeName(input.name);
  }

  if (input.phone !== undefined) {
    updates.phone = normalizePhone(input.phone);
  }

  if (input.internalNote !== undefined) {
    updates.internalNote = normalizeInternalNote(input.internalNote);
  }

  return updates;
};

const parseEmailInputs = (emails) => {
  if (Array.isArray(emails)) {
    return emails
      .map((email) => normalizeEmail(email))
      .filter(Boolean);
  }

  if (typeof emails === "string") {
    return emails
      .split(/[\n,\s]+/)
      .map((email) => normalizeEmail(email))
      .filter(Boolean);
  }

  return [];
};

const normalizeColumnKey = (key) =>
  String(key || "")
    .toLowerCase()
    .replace(/[\s_\-]+/g, "")
    .trim();

const EMAIL_COLUMN_KEYS = new Set([
  "email",
  "emailaddress",
  "mail",
  "e-mail",
].map((key) => normalizeColumnKey(key)));

const NAME_COLUMN_KEYS = new Set([
  "name",
  "fullname",
  "contactname",
].map((key) => normalizeColumnKey(key)));

const PHONE_COLUMN_KEYS = new Set([
  "phone",
  "phonenumber",
  "mobile",
  "mobilenumber",
  "contact",
  "contactnumber",
  "whatsapp",
  "whatsappnumber",
].map((key) => normalizeColumnKey(key)));

const NOTE_COLUMN_KEYS = new Set([
  "internalnote",
  "note",
  "notes",
  "remark",
  "remarks",
  "comment",
  "comments",
].map((key) => normalizeColumnKey(key)));

const getStringCell = (value) => String(value ?? "").trim();

const pickColumnValue = (row, keySet) => {
  const entries = Object.entries(row || {});
  for (const [key, value] of entries) {
    if (keySet.has(normalizeColumnKey(key))) {
      const cell = getStringCell(value);
      if (cell) return cell;
    }
  }
  return "";
};

const parseSubscriberRow = (row, rowIndex) => {
  let emailRaw = pickColumnValue(row, EMAIL_COLUMN_KEYS);

  if (!emailRaw) {
    for (const value of Object.values(row || {})) {
      const cell = getStringCell(value);
      if (cell && validateEmail(cell)) {
        emailRaw = cell;
        break;
      }
    }
  }

  const email = normalizeEmail(emailRaw);
  const name = normalizeName(pickColumnValue(row, NAME_COLUMN_KEYS));
  const phone = normalizePhone(pickColumnValue(row, PHONE_COLUMN_KEYS));
  const internalNote = normalizeInternalNote(pickColumnValue(row, NOTE_COLUMN_KEYS));

  if (!email) {
    return {
      row: rowIndex,
      email: "",
      name,
      phone,
      internalNote,
      status: "invalid",
      reason: "missing_email",
    };
  }

  if (!validateEmail(email)) {
    return {
      row: rowIndex,
      email,
      name,
      phone,
      internalNote,
      status: "invalid",
      reason: "invalid_email_format",
    };
  }

  return {
    row: rowIndex,
    email,
    name,
    phone,
    internalNote,
    status: "valid",
  };
};

const markDuplicateRows = (rows) => {
  const seen = new Set();
  return rows.map((row) => {
    if (row.status !== "valid") return row;

    if (seen.has(row.email)) {
      return {
        ...row,
        status: "duplicate_in_file",
        reason: "duplicate_email_in_file",
      };
    }

    seen.add(row.email);
    return row;
  });
};

async function parseSubscriberRowsFromUpload(file) {
  let sourceRows = [];

  if (file.mimetype === "text/csv") {
    const rows = [];
    const stream = Readable.from(file.buffer.toString());

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on("data", (data) => rows.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    sourceRows = rows;
  } else {
    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    sourceRows = xlsx.utils.sheet_to_json(worksheet, { defval: "" });
  }

  const parsedRows = sourceRows.map((row, index) => parseSubscriberRow(row, index + 2));
  return markDuplicateRows(parsedRows);
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

// GET /api/subscribers/template - Download CSV template for import
router.get("/template", requireAuth(), async (req, res) => {
  try {
    const template = [
      "email,name,phone,internalNote",
      "john.doe@example.com,John Doe,+1 555 0100,Priority distributor",
      "jane.smith@example.com,Jane Smith,+91 9876543210,Follow up in Q2",
    ].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=subscribers-template.csv");
    res.status(200).send(template);
  } catch (err) {
    console.error("Download subscribers template failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/subscribers/import/preview - Parse file and return preview rows
router.post("/import/preview", requireAuth(), upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    const { subscribers } = await getCollections();
    const rows = await parseSubscriberRowsFromUpload(req.file);

    const candidateEmails = Array.from(
      new Set(rows.filter((row) => row.status === "valid").map((row) => row.email))
    );

    const existingDocs = candidateEmails.length
      ? await subscribers
          .find(
            { email: { $in: candidateEmails } },
            {
              projection: {
                email: 1,
                deleted_by_admin: 1,
                deleted_by_super: 1,
                is_locked: 1,
              },
            }
          )
          .toArray()
      : [];

    const existingByEmail = new Map(existingDocs.map((doc) => [doc.email, doc]));

    const items = rows.map((row) => {
      if (row.status !== "valid") return row;

      const existing = existingByEmail.get(row.email);
      if (!existing) {
        return { ...row, status: "new", reason: "will_add" };
      }

      if (!existing.deleted_by_admin && !existing.deleted_by_super && !existing.is_locked) {
        return { ...row, status: "already_exists", reason: "already_exists" };
      }

      return { ...row, status: "reactivate", reason: "will_reactivate" };
    });

    const valid = items.filter(
      (row) => row.status === "new" || row.status === "reactivate" || row.status === "already_exists"
    ).length;
    const invalid = items.filter((row) => row.status === "invalid").length;
    const duplicates = items.filter((row) => row.status === "duplicate_in_file").length;
    const alreadyExists = items.filter((row) => row.status === "already_exists").length;
    const importable = items.filter(
      (row) => row.status === "new" || row.status === "reactivate"
    ).length;

    res.json({
      success: true,
      filename: req.file.originalname,
      total: items.length,
      valid,
      invalid,
      duplicates,
      alreadyExists,
      importable,
      items: items.slice(0, 200),
    });
  } catch (err) {
    console.error("Preview import subscribers failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/subscribers/stats
router.get("/stats", requireAuth(), async (req, res) => {
  try {
    const { subscribers } = await getCollections();
    const { role, id: userId } = req.user;
    
    if (role === "superadmin" || role === "dev") {
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
      // Both admin and staff see only their own stats
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
    
    let matchQuery = { deleted_by_super: { $ne: true } };
    
    if (role === "superadmin" || role === "dev") {
      // Superadmin and dev see all subscribers except those deleted by superadmin
      matchQuery = { deleted_by_super: { $ne: true } };
    } else if (role === "admin" || role === "staff") {
      // Admin and staff see only their own unlocked subscribers
      matchQuery = {
        added_by: userId,
        is_locked: { $ne: true },
        deleted_by_admin: { $ne: true },
        deleted_by_super: { $ne: true }
      };
    }
    
    // Use aggregation to include staff info
    const items = await subscribers.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "staff",
          let: {
            addedBy: {
              $convert: {
                input: "$added_by",
                to: "objectId",
                onError: null,
                onNull: null,
              },
            },
          },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$addedBy"] } } },
            { $project: { name: 1, email: 1, role: 1 } }
          ],
          as: "addedByUser"
        }
      },
      {
        $addFields: {
          staff_name: { $arrayElemAt: ["$addedByUser.name", 0] },
          staff_email: { $arrayElemAt: ["$addedByUser.email", 0] },
          staff_role: { $arrayElemAt: ["$addedByUser.role", 0] }
        }
      },
      {
        $project: {
          _id: 0,
          email: 1,
          name: 1,
          phone: 1,
          internalNote: 1,
          createdAt: 1,
          added_at: 1,
          added_by: 1,
          staff_name: 1,
          staff_email: 1,
          staff_role: 1,
          is_locked: 1,
          deleted_by_admin: 1,
          deleted_by_super: 1
        }
      },
      {
        $addFields: {
          sortDate: { $ifNull: ["$added_at", "$createdAt"] }
        }
      },
      { $sort: { sortDate: -1 } }
    ]).toArray();
      
    res.json({ total: items.length, items });
  } catch (err) {
    console.error("List subscribers failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/subscribers - add subscriber
router.post("/", requireAuth(), async (req, res) => {
  try {
    const payload = req.body || {};
    const normalizedEmail = normalizeEmail(payload.email);
    if (!normalizedEmail || !validateEmail(normalizedEmail)) {
      return res.status(400).json({ error: "Valid email required" });
    }
    
    const { subscribers } = await getCollections();
    const { id: userId, name } = req.user;
    const optionalFields = getOptionalSubscriberFields(payload);
    
    // Check if subscriber already exists
    const existing = await subscribers.findOne({ email: normalizedEmail });
    
    if (existing) {
      // If subscriber was deleted or locked, allow re-adding
      if (existing.deleted_by_admin || existing.deleted_by_super || existing.is_locked) {
        await subscribers.updateOne(
          { email: normalizedEmail },
          {
            $set: {
              deleted_by_admin: false,
              deleted_by_super: false,
              added_by: userId,
              added_at: new Date(),
              is_locked: false,
              updatedAt: new Date(),
              ...optionalFields,
            }
          }
        );
      } else {
        // Active subscriber: keep operation idempotent and allow metadata updates.
        if (Object.keys(optionalFields).length > 0) {
          await subscribers.updateOne(
            { email: normalizedEmail },
            {
              $set: {
                ...optionalFields,
                updatedAt: new Date(),
              },
            }
          );
        }

        return res.json({ success: true, alreadyExists: true });
      }
    } else {
      // Create new subscriber
      await subscribers.insertOne({
        email: normalizedEmail,
        name: optionalFields.name || "",
        phone: optionalFields.phone || "",
        internalNote: optionalFields.internalNote || "",
        added_by: userId,
        added_at: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
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

// POST /api/subscribers/bulk - Add multiple subscribers (comma-separated)
router.post("/bulk", requireAuth(), async (req, res) => {
  try {
    const { emails } = req.body || {};
    const parsedEmails = parseEmailInputs(emails);

    if (parsedEmails.length === 0) {
      return res.status(400).json({ error: "Email list required" });
    }
    
    const { subscribers } = await getCollections();
    const { id: userId, name } = req.user;
    
    // Remove duplicates
    const uniqueEmails = [...new Set(parsedEmails)];
    
    let added = 0;
    let updated = 0;
    let skipped = 0;
    let invalid = 0;
    const results = [];
    
    for (const email of uniqueEmails) {
      try {
        if (!validateEmail(email)) {
          invalid++;
          results.push({ email, status: 'invalid', reason: 'invalid_format' });
          continue;
        }

        const existing = await subscribers.findOne({ email });
        
        if (existing && !existing.deleted_by_admin && !existing.deleted_by_super && !existing.is_locked) {
          skipped++;
          results.push({ email, status: 'skipped', reason: 'already_exists' });
          continue;
        }
        
        if (existing) {
          // Re-add previously deleted/locked subscriber
          await subscribers.updateOne(
            { email },
            {
              $set: {
                deleted_by_admin: false,
                deleted_by_super: false,
                added_by: userId,
                added_at: new Date(),
                is_locked: false,
                updatedAt: new Date(),
              }
            }
          );
          updated++;
          results.push({ email, status: 'updated' });
        } else {
          // Create new subscriber
          await subscribers.insertOne({
            email,
            name: "",
            phone: "",
            internalNote: "",
            added_by: userId,
            added_at: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            is_locked: false,
            deleted_by_admin: false,
            deleted_by_super: false
          });

          added++;
          results.push({ email, status: 'added' });
        }
      } catch (error) {
        skipped++;
        results.push({ email, status: 'error', reason: error.message });
      }
    }
    
    await addLog({
      type: "subscriber.bulk_added",
      actorId: userId,
      actorName: name,
      meta: { 
        total: uniqueEmails.length,
        added,
        updated,
        skipped,
        invalid,
        method: Array.isArray(emails) ? 'array' : 'comma_separated'
      }
    });
    
    res.json({ 
      success: true, 
      total: uniqueEmails.length,
      added, 
      updated,
      skipped,
      invalid,
      results 
    });
  } catch (err) {
    console.error("Bulk add subscribers failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/subscribers/bulk-emails - Compatibility endpoint for bulk email arrays
router.post("/bulk-emails", requireAuth(), async (req, res) => {
  try {
    const { emails } = req.body || {};
    const parsedEmails = parseEmailInputs(emails);

    if (parsedEmails.length === 0) {
      return res.status(400).json({ error: "Email list required" });
    }

    const { subscribers } = await getCollections();
    const { id: userId, name } = req.user;

    const uniqueEmails = [...new Set(parsedEmails)];

    let added = 0;
    let updated = 0;
    let skipped = 0;
    let invalid = 0;
    const results = [];

    for (const email of uniqueEmails) {
      try {
        if (!validateEmail(email)) {
          invalid++;
          results.push({ email, status: "invalid", reason: "invalid_format" });
          continue;
        }

        const existing = await subscribers.findOne({ email });

        if (existing && !existing.deleted_by_admin && !existing.deleted_by_super && !existing.is_locked) {
          skipped++;
          results.push({ email, status: "skipped", reason: "already_exists" });
          continue;
        }

        if (existing) {
          await subscribers.updateOne(
            { email },
            {
              $set: {
                deleted_by_admin: false,
                deleted_by_super: false,
                added_by: userId,
                added_at: new Date(),
                is_locked: false,
                updatedAt: new Date(),
              },
            }
          );
          updated++;
          results.push({ email, status: "updated" });
        } else {
          await subscribers.insertOne({
            email,
            name: "",
            phone: "",
            internalNote: "",
            added_by: userId,
            added_at: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            is_locked: false,
            deleted_by_admin: false,
            deleted_by_super: false,
          });
          added++;
          results.push({ email, status: "added" });
        }
      } catch (error) {
        skipped++;
        results.push({ email, status: "error", reason: error.message });
      }
    }

    await addLog({
      type: "subscriber.bulk_added",
      actorId: userId,
      actorName: name,
      meta: {
        total: uniqueEmails.length,
        added,
        updated,
        skipped,
        invalid,
        method: "bulk_emails",
      },
    });

    res.json({
      success: true,
      total: uniqueEmails.length,
      added,
      updated,
      skipped,
      invalid,
      results,
    });
  } catch (err) {
    console.error("Bulk emails endpoint failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/subscribers/import - Import from CSV/Excel file
router.post("/import", requireAuth(), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    const { subscribers } = await getCollections();
    const { id: userId, name } = req.user;

    const rows = await parseSubscriberRowsFromUpload(req.file);

    let added = 0;
    let updated = 0;
    let skipped = 0;
    let invalid = 0;
    const results = [];

    for (const row of rows) {
      try {
        if (row.status === "invalid") {
          invalid++;
          results.push({
            row: row.row,
            email: row.email,
            status: "invalid",
            reason: row.reason || "invalid_format",
          });
          continue;
        }

        if (row.status === "duplicate_in_file") {
          skipped++;
          results.push({
            row: row.row,
            email: row.email,
            status: "skipped",
            reason: row.reason || "duplicate_email_in_file",
          });
          continue;
        }

        const existing = await subscribers.findOne({ email: row.email });

        if (existing && !existing.deleted_by_admin && !existing.deleted_by_super && !existing.is_locked) {
          skipped++;
          results.push({
            row: row.row,
            email: row.email,
            status: "skipped",
            reason: "already_exists",
          });
          continue;
        }

        const metadataUpdates = {};
        if (row.name) metadataUpdates.name = row.name;
        if (row.phone) metadataUpdates.phone = row.phone;
        if (row.internalNote) metadataUpdates.internalNote = row.internalNote;

        if (existing) {
          // Re-add previously deleted/locked subscriber
          await subscribers.updateOne(
            { email: row.email },
            {
              $set: {
                deleted_by_admin: false,
                deleted_by_super: false,
                added_by: userId,
                added_at: new Date(),
                is_locked: false,
                updatedAt: new Date(),
                ...metadataUpdates,
              }
            }
          );
          updated++;
          results.push({ row: row.row, email: row.email, status: 'updated' });
        } else {
          // Create new subscriber
          await subscribers.insertOne({
            email: row.email,
            name: row.name || "",
            phone: row.phone || "",
            internalNote: row.internalNote || "",
            added_by: userId,
            added_at: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            is_locked: false,
            deleted_by_admin: false,
            deleted_by_super: false
          });

          added++;
          results.push({ row: row.row, email: row.email, status: 'added' });
        }
      } catch (error) {
        skipped++;
        results.push({
          row: row.row,
          email: row.email,
          status: 'error',
          reason: error.message,
        });
      }
    }

    await addLog({
      type: "subscriber.file_imported",
      actorId: userId,
      actorName: name,
      meta: { 
        filename: req.file.originalname,
        fileType: req.file.mimetype,
        total: rows.length,
        added,
        updated,
        skipped,
        invalid
      }
    });

    res.json({ 
      success: true, 
      total: rows.length,
      added, 
      updated,
      skipped,
      invalid,
      results: results.slice(0, 100) // Limit results to first 100 for performance
    });
  } catch (err) {
    console.error("Import subscribers failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/subscribers/bulk - Bulk delete for superadmins and devs
router.delete("/bulk", requireAuth(["superadmin", "dev"]), async (req, res) => {
  try {
    const { emails } = req.body || {};
    
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: "Array of emails required" });
    }
    
    const { subscribers } = await getCollections();
    const { id: userId, name } = req.user;
    
    const normalizedEmails = emails
      .map((email) => normalizeEmail(email))
      .filter(Boolean);
    
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
        deletedBy: req.user.role,
        count: result.modifiedCount 
      },
    });
    
    res.json({ success: true, deleted: result.modifiedCount });
  } catch (err) {
    console.error("Bulk delete subscribers failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/subscribers/:email - Edit subscriber (superadmin/dev only)
router.patch("/:email", requireAuth(["superadmin", "dev"]), async (req, res) => {
  try {
    const currentEmail = normalizeEmail(decodeURIComponent(req.params.email || ""));
    const payload = req.body || {};

    if (!currentEmail || !validateEmail(currentEmail)) {
      return res.status(400).json({ error: "Valid current email required" });
    }

    const nextEmail = payload.email !== undefined
      ? normalizeEmail(payload.email)
      : currentEmail;

    if (!nextEmail || !validateEmail(nextEmail)) {
      return res.status(400).json({ error: "Valid email required" });
    }

    const { subscribers } = await getCollections();
    const { id: userId, name: actorName } = req.user;

    const existing = await subscribers.findOne({ email: currentEmail });
    if (!existing) {
      return res.status(404).json({ error: "Subscriber not found" });
    }

    if (nextEmail !== currentEmail) {
      const conflict = await subscribers.findOne({ email: nextEmail });
      if (conflict) {
        return res.status(400).json({ error: "Target email already exists" });
      }
    }

    const updateFields = {
      ...getOptionalSubscriberFields(payload),
      updatedAt: new Date(),
    };

    if (nextEmail !== currentEmail) {
      updateFields.email = nextEmail;
    }

    await subscribers.updateOne({ email: currentEmail }, { $set: updateFields });

    await addLog({
      type: "subscriber.updated",
      actorId: userId,
      actorName,
      meta: {
        previousEmail: currentEmail,
        email: nextEmail,
      },
    });

    res.json({ success: true, email: nextEmail });
  } catch (err) {
    console.error("Edit subscriber failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/subscribers/:email
router.delete("/:email", requireAuth(), async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email || "");
    const normalizedEmail = normalizeEmail(email);
    const { subscribers } = await getCollections();
    const { role, id: userId, name } = req.user;
    
    const subscriber = await subscribers.findOne({ email: normalizedEmail });
    
    if (!subscriber) {
      return res.status(404).json({ error: "Subscriber not found" });
    }
    
    if (role === "superadmin" || role === "dev") {
      // Superadmin and dev can delete any subscriber anytime
      await subscribers.updateOne(
        { email: normalizedEmail },
        { $set: { deleted_by_super: true, deleted_at: new Date() } }
      );
      
      await addLog({
        type: "subscriber.removed",
        actorId: userId,
        actorName: name,
        meta: { email: normalizedEmail, deletedBy: role },
      });
    } else if (role === "admin" || role === "staff") {
      // Check if admin/staff owns this subscriber
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
          meta: { email: normalizedEmail, deletedBy: role, withinTimeLimit: true },
        });
      } else {
        // After 24 hours - lock subscriber (hide from admin/staff)
        await subscribers.updateOne(
          { email: normalizedEmail },
          { $set: { is_locked: true, locked_at: new Date() } }
        );
        
        await addLog({
          type: "subscriber.locked",
          actorId: userId,
          actorName: name,
          meta: { email: normalizedEmail, reason: "attempted_delete_after_24h", role },
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

// GET /api/subscribers/campaigns - Get campaign history
router.get("/campaigns", requireAuth(), async (req, res) => {
  try {
    const { campaigns } = await getCollections();
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;
    
    const campaignList = await campaigns
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await campaigns.countDocuments({});
    
    res.json({ 
      success: true, 
      total,
      items: campaignList 
    });
  } catch (err) {
    console.error("Get campaign history failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/subscribers/campaign - basic campaign send
router.post("/campaign", requireAuth(), async (req, res) => {
  try {
    const { subject, message, recipients, announcement, note, isHtml } = req.body || {};
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

    const { id: userId, name: userName } = req.user;
    
    const campaign = {
      subject,
      message,
      recipients: targetEmails,
      status: "sending",
      isHtml: isHtml || false,
      sentBy: userId,
      sentByName: userName,
      createdAt: new Date(),
    };
    const inserted = await campaigns.insertOne(campaign);

    // Check if message is already a complete HTML document
    const isCompleteHtml = isHtml && (
      message.trim().toLowerCase().startsWith('<!doctype html') || 
      message.trim().toLowerCase().startsWith('<html')
    );

    let results;
    if (isCompleteHtml) {
      // Send raw HTML without template wrapper
      results = await sendBulkEmail(targetEmails, "rawHtml", {
        subject,
        html: message,
      });
    } else {
      // Use the campaign template
      results = await sendBulkEmail(targetEmails, "campaign", {
        subject,
        message,
        announcement: announcement || false,
        note: note || null,
      });
    }

    const sent = results.filter((r) => r.success).length;
    const failed = results.length - sent;
    const sentTo = results.filter((r) => r.success).map((r) => r.recipient);
    const failedTo = results.filter((r) => !r.success).map((r) => r.recipient);

    await campaigns.updateOne(
      { _id: inserted.insertedId },
      { $set: { 
        status: "completed", 
        sent, 
        failed, 
        sentTo, 
        failedTo,
        completedAt: new Date() 
      } }
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
