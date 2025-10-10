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
  const { subscribers } = await getCollections();
  const items = await subscribers
    .find({})
    .project({ _id: 0, email: 1, createdAt: 1, lastSeenAt: 1 })
    .sort({ createdAt: -1 })
    .toArray();
  const csv = toCsv(items);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=contacts.csv");
  res.send(csv);
});

// GET /api/export/logs.csv
router.get("/logs.csv", requireAuth(), async (req, res) => {
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
});

export default router;
