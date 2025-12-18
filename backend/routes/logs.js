import express from "express";
import { getCollections } from "../db.js";
import { requireAuth } from "./auth.js";
import { logActivity } from "../config/logger.js";

const router = express.Router();

// GET /api/logs - Get all logs (superadmin and dev only)
router.get("/", requireAuth(["superadmin", "dev"]), async (req, res) => {
  try {
    const { logs } = await getCollections();

    // Get query parameters for pagination and filtering
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.level) {
      filter.level = req.query.level;
    }
    if (req.query.type) {
      filter.type = { $regex: req.query.type, $options: "i" };
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.actorId) {
      filter.actorId = req.query.actorId;
    }
    if (req.query.customerId) {
      filter.customerId = req.query.customerId;
    }
    if (req.query.search) {
      filter.$or = [
        { message: { $regex: req.query.search, $options: "i" } },
        { type: { $regex: req.query.search, $options: "i" } },
        { actorName: { $regex: req.query.search, $options: "i" } },
        { customerName: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Date filtering
    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {};
      if (req.query.dateFrom) {
        filter.createdAt.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        filter.createdAt.$lte = new Date(req.query.dateTo);
      }
    }

    // Get total count for pagination
    const total = await logs.countDocuments(filter);

    // Get logs with pagination
    let items = await logs
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Add timestamp alias expected by frontend
    items = items.map((i) => ({ ...i, timestamp: i.createdAt }));

    res.json({
      logs: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/logs/stats - Get log statistics (superadmin and dev only)
router.get("/stats", requireAuth(["superadmin", "dev"]), async (req, res) => {
  try {
    const { logs } = await getCollections();

    // Get stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalLogs,
      errorLogs,
      warningLogs,
      infoLogs,
      successLogs,
      recentLogs,
      topTypes,
      topActors,
      topCategories,
    ] = await Promise.all([
      logs.countDocuments({}),
      logs.countDocuments({ level: "error" }),
      logs.countDocuments({ level: "warn" }),
      logs.countDocuments({ level: "info" }),
      logs.countDocuments({ level: "success" }),
      logs.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      logs
        .aggregate([
          { $group: { _id: "$type", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ])
        .toArray(),
      logs
        .aggregate([
          { $match: { actorName: { $exists: true, $ne: null } } },
          { $group: { _id: "$actorName", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ])
        .toArray(),
      logs
        .aggregate([
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ])
        .toArray(),
    ]);

    res.json({
      total: totalLogs,
      byLevel: {
        error: errorLogs,
        warn: warningLogs,
        info: infoLogs,
        success: successLogs,
      },
      recent: recentLogs,
      topTypes,
      topActors,
      topCategories,
    });
  } catch (error) {
    console.error("Error fetching log stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/logs - Create a new log entry (superadmin and dev only)
router.post("/", requireAuth(["superadmin", "dev"]), async (req, res) => {
  try {
    const body = req.body || {};
    const saved = await logActivity({ req, ...body });
    res.json({ success: true, log: saved });
  } catch (error) {
    console.error("Error creating log:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/logs/all - Clear all logs (dev only)
router.delete("/all", requireAuth(["dev"]), async (req, res) => {
  try {
    const { logs } = await getCollections();
    const result = await logs.deleteMany({});
    
    // Log this critical action
    await logActivity({
      req,
      level: "warn",
      type: "logs.delete_all",
      message: `DEV user ${req.user?.name || req.user?.email} deleted all ${result.deletedCount} log entries`,
      category: "system",
    });

    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} log entries`,
    });
  } catch (error) {
    console.error("Error deleting all logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/logs - Clear logs with options (superadmin and dev only)
router.delete("/", requireAuth(["superadmin", "dev"]), async (req, res) => {
  try {
    const { logs } = await getCollections();

    // Optional: Keep last 1000 logs
    const keepRecent = req.query.keepRecent === "true";

    if (keepRecent) {
      // Keep only the most recent 1000 logs
      const recentLogs = await logs
        .find({})
        .sort({ createdAt: -1 })
        .limit(1000)
        .toArray();

      await logs.deleteMany({});
      if (recentLogs.length > 0) {
        await logs.insertMany(recentLogs);
      }

      res.json({
        success: true,
        message: `Cleared logs, kept ${recentLogs.length} most recent entries`,
      });
    } else {
      const result = await logs.deleteMany({});
      res.json({
        success: true,
        message: `Cleared ${result.deletedCount} log entries`,
      });
    }
  } catch (error) {
    console.error("Error clearing logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/logs/:id - Delete a specific log entry (superadmin and dev only)
router.delete("/:id", requireAuth(["superadmin", "dev"]), async (req, res) => {
  try {
    const { logs } = await getCollections();
    const { ObjectId } = await import('mongodb');
    const { id } = req.params;

    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({ error: "Invalid log ID format" });
    }

    const result = await logs.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Log entry not found" });
    }

    res.json({
      success: true,
      message: "Log entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting log:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
