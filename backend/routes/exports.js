import express from "express";
import { getCollections } from "../db.js";
import { requireAuth } from "./auth.js";

const router = express.Router();

function toCsv(rows) {
  if (!rows || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return s.includes(",") || s.includes("\n") ? `"${s}"` : s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

// GET /api/export/contacts.csv
router.get("/contacts.csv", requireAuth(), async (req, res) => {
  try {
    const { subscribers, staff } = await getCollections();
    const { role, id: userId } = req.user;
    
    console.log('[EXPORT] User role:', role, 'User ID:', userId);
    
    let query = {};
    
    if (role === "superadmin" || role === "dev") {
      // Superadmin and dev get all subscribers (not deleted by super)
      query = { deleted_by_super: { $ne: true } };
      console.log('[EXPORT] Superadmin/dev query:', query);
    } else if (role === "admin") {
      // Admin gets only their own subscribers added within 24 hours and not deleted
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      query = {
        added_by: String(userId),
        added_at: { $gte: twentyFourHoursAgo },
        is_locked: { $ne: true },
        deleted_by_admin: { $ne: true },
        deleted_by_super: { $ne: true }
      };
      console.log('[EXPORT] Admin query:', query);
    } else {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    
    // Get subscribers with added_by user info
    const items = await subscribers.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "staff",
          let: { addedBy: { $toObjectId: "$added_by" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$addedBy"] } } },
            { $project: { name: 1, email: 1 } }
          ],
          as: "addedByUser"
        }
      },
      {
        $addFields: {
          added_by_name: { $arrayElemAt: ["$addedByUser.name", 0] },
          added_by_email: { $arrayElemAt: ["$addedByUser.email", 0] }
        }
      },
      {
        $project: {
          _id: 0,
          email: 1,
          createdAt: 1,
          added_at: 1,
          added_by_name: 1,
          added_by_email: 1,
          is_locked: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();
    
    const csv = toCsv(items);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=contacts.csv");
    res.send(csv);
  } catch (error) {
    console.error("Export contacts failed:", error);
    res.status(500).json({ error: "Export failed" });
  }
});

// GET /api/export/logs.csv - Superadmin and dev only
router.get("/logs.csv", requireAuth(["superadmin", "dev"]), async (req, res) => {
  try {
    const { logs } = await getCollections();
    const items = await logs
      .find({})
      .project({ _id: 0 })
      .sort({ createdAt: -1 })
      .limit(5000)
      .toArray();
    const withTimestamp = items.map((i) => ({ timestamp: i.createdAt, ...i }));
    const csv = toCsv(withTimestamp);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=logs.csv");
    res.send(csv);
  } catch (error) {
    console.error("Export logs failed:", error);
    res.status(500).json({ error: "Export failed" });
  }
});

export default router;
