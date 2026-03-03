import express from "express";
import { getCollections, addLog } from "../db.js";
import { requireAuth } from "./auth.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// GET /api/subscriber-lists
router.get("/", requireAuth(), async (req, res) => {
  try {
    const { subscriberLists } = await getCollections();
    const { id: userId, role } = req.user;

    const query =
      role === "superadmin" || role === "dev" ? {} : { createdBy: userId };

    const items = await subscriberLists
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ items, total: items.length });
  } catch (err) {
    console.error("Get subscriber lists failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/subscriber-lists
router.post("/", requireAuth(), async (req, res) => {
  try {
    const { name, description, emails } = req.body || {};
    const { id: userId, name: userName } = req.user;

    if (!name?.trim())
      return res.status(400).json({ error: "List name is required" });
    if (!Array.isArray(emails) || emails.length === 0)
      return res
        .status(400)
        .json({ error: "At least one email is required" });

    const { subscriberLists } = await getCollections();

    // Deduplicate and lower-case emails
    const cleanEmails = [
      ...new Set(emails.map((e) => String(e).trim().toLowerCase())),
    ].filter(Boolean);

    const doc = {
      name: name.trim(),
      description: description?.trim() || "",
      emails: cleanEmails,
      createdBy: userId,
      createdByName: userName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await subscriberLists.insertOne(doc);

    await addLog({
      type: "subscriber_list.created",
      actorId: userId,
      actorName: userName,
      meta: { name: name.trim(), emailCount: cleanEmails.length },
    });

    res.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("Create subscriber list failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/subscriber-lists/:id
router.put("/:id", requireAuth(), async (req, res) => {
  try {
    const { name, description, emails } = req.body || {};
    const { id: userId, name: userName, role } = req.user;
    const { subscriberLists } = await getCollections();

    let objId;
    try {
      objId = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ error: "Invalid list ID" });
    }

    const existing = await subscriberLists.findOne({ _id: objId });
    if (!existing) return res.status(404).json({ error: "List not found" });

    if (
      role !== "superadmin" &&
      role !== "dev" &&
      existing.createdBy !== userId
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const cleanEmails = emails
      ? [
          ...new Set(
            emails.map((e) => String(e).trim().toLowerCase())
          ),
        ].filter(Boolean)
      : existing.emails;

    await subscriberLists.updateOne(
      { _id: objId },
      {
        $set: {
          name: name?.trim() || existing.name,
          description:
            description !== undefined
              ? description.trim()
              : existing.description,
          emails: cleanEmails,
          updatedAt: new Date(),
        },
      }
    );

    await addLog({
      type: "subscriber_list.updated",
      actorId: userId,
      actorName: userName,
      meta: { id: req.params.id, name: name?.trim() || existing.name },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Update subscriber list failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/subscriber-lists/:id
router.delete("/:id", requireAuth(), async (req, res) => {
  try {
    const { id: userId, name: userName, role } = req.user;
    const { subscriberLists } = await getCollections();

    let objId;
    try {
      objId = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ error: "Invalid list ID" });
    }

    const existing = await subscriberLists.findOne({ _id: objId });
    if (!existing) return res.status(404).json({ error: "List not found" });

    if (
      role !== "superadmin" &&
      role !== "dev" &&
      existing.createdBy !== userId
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await subscriberLists.deleteOne({ _id: objId });

    await addLog({
      type: "subscriber_list.deleted",
      actorId: userId,
      actorName: userName,
      meta: { id: req.params.id, name: existing.name },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Delete subscriber list failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
