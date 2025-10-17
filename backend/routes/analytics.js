import express from "express";
import { getCollections } from "../db.js";
import { requireAuth } from "./auth.js";

const router = express.Router();

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

// GET /api/analytics/overview
router.get("/overview", requireAuth(), async (req, res) => {
  const { inquiries, logs, campaigns, gallery } = await getCollections();
  const [submissions, replies, totalCampaigns, totalImages] = await Promise.all(
    [
      inquiries.countDocuments({}),
      inquiries.countDocuments({ replyCount: { $gt: 0 } }),
      campaigns.countDocuments({}),
      gallery.countDocuments({}),
    ]
  );
  const totalLikesAgg = await gallery
    .aggregate([
      { $group: { _id: null, likes: { $sum: { $ifNull: ["$likes", 0] } } } },
    ])
    .toArray();
  const totalLikes = totalLikesAgg[0]?.likes || 0;
  res.json({ submissions, replies, totalCampaigns, totalImages, totalLikes });
});

// GET /api/analytics/submissions?range=7
router.get("/submissions", requireAuth(), async (req, res) => {
  const range = req.query.range === 'all' ? null : Math.min(Number(req.query.range) || 30, 365);
  const { inquiries } = await getCollections();

  let matchStage = {};
  if (range !== null) {
    const since = addDays(startOfDay(), -range + 1);
    matchStage = { createdAt: { $gte: since } };
  }

  const agg = await inquiries
    .aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          new: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
          read: { $sum: { $cond: [{ $eq: ["$status", "read"] }, 1, 0] } },
          replied: { $sum: { $cond: [{ $eq: ["$status", "replied"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray();

  // Remove duplicates by date (in case there are any)
  const uniqueSeries = agg.reduce((acc, curr) => {
    const existing = acc.find(item => item._id === curr._id);
    if (existing) {
      existing.count += curr.count;
      existing.new += curr.new;
      existing.read += curr.read;
      existing.replied += curr.replied;
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);

  res.json({ range: range || 'all', series: uniqueSeries });
});

// GET /api/analytics/replies
router.get("/replies", requireAuth(), async (req, res) => {
  const { inquiries } = await getCollections();
  const avg = await inquiries
    .aggregate([
      { $match: { replyCount: { $gt: 0 }, lastReplyAt: { $ne: null } } },
      {
        $project: {
          responseMs: { $subtract: ["$lastReplyAt", "$createdAt"] },
        },
      },
      { $group: { _id: null, avgMs: { $avg: "$responseMs" } } },
    ])
    .toArray();
  res.json({ averageResponseMs: Math.round(avg[0]?.avgMs || 0) });
});

// GET /api/analytics/status?range=30 - distribution of inquiry statuses with optional date filter
router.get("/status", requireAuth(), async (req, res) => {
  const range = req.query.range === 'all' ? null : (req.query.range ? Math.min(Number(req.query.range), 365) : null);
  const { inquiries } = await getCollections();

  let pipeline = [];
  if (range !== null) {
    const since = addDays(startOfDay(), -range + 1);
    pipeline.push({ $match: { createdAt: { $gte: since } } });
  }

  pipeline.push({ $group: { _id: "$status", count: { $sum: 1 } } });

  const agg = await inquiries.aggregate(pipeline).toArray();
  const map = agg.reduce((acc, r) => {
    acc[r._id || "unknown"] = r.count;
    return acc;
  }, {});
  res.json({
    range: range || 'all',
    new: map.new || 0,
    read: map.read || 0,
    replied: map.replied || 0,
    total: (map.new || 0) + (map.read || 0) + (map.replied || 0),
  });
});

// GET /api/analytics/unique-customers?days=30 - distinct emails in recent window
router.get("/unique-customers", requireAuth(), async (req, res) => {
  const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
  const { inquiries } = await getCollections();
  const since = addDays(startOfDay(), -days + 1);
  const recent = await inquiries
    .aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$email" } },
      { $count: "count" },
    ])
    .toArray();
  const prevSince = addDays(since, -days);
  const prev = await inquiries
    .aggregate([
      { $match: { createdAt: { $gte: prevSince, $lt: since } } },
      { $group: { _id: "$email" } },
      { $count: "count" },
    ])
    .toArray();
  const count = recent[0]?.count || 0;
  const prevCount = prev[0]?.count || 0;
  const delta = count - prevCount;
  res.json({ days, count, delta });
});

// GET /api/analytics/customers?limit=10 - latest inquiries simplified
router.get("/customers", requireAuth(), async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const { inquiries } = await getCollections();
  const items = await inquiries
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  const rows = items.map((i) => ({
    id: String(i._id),
    name: i.name || "",
    email: i.email || "",
    subject: i.subject || "",
    status: i.status || "new",
    createdAt: i.createdAt || i.updatedAt || new Date(),
  }));
  res.json({ items: rows });
});

// GET /api/analytics/visitors/countries?range=30
router.get("/visitors/countries", requireAuth(), async (req, res) => {
  try {
    const range = Math.min(Number(req.query.range) || 30, 365);
    const { visitors } = await getCollections();
    const since = addDays(startOfDay(), -range + 1);
    const items = await visitors
      .find(
        { createdAt: { $gte: since } },
        { projection: { country: 1 } }
      )
      .toArray();
    const map = new Map();
    for (const it of items) {
      let c = (it.country || "").trim();
      if (!c) c = "Unknown";
      map.set(c, (map.get(c) || 0) + 1);
    }
    const series = Array.from(map.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    res.json({ range, series });
  } catch (e) {
    res.json({ range: 0, series: [] });
  }
});

// GET /api/analytics/visitors/trends?range=30 - visitor time series by date
router.get("/visitors/trends", requireAuth(), async (req, res) => {
  try {
    const range = req.query.range === 'all' ? null : Math.min(Number(req.query.range) || 30, 365);
    const { visitors } = await getCollections();
    
    let matchStage = {};
    if (range !== null) {
      const since = addDays(startOfDay(), -range + 1);
      matchStage = { createdAt: { $gte: since } };
    }

    const agg = await visitors
      .aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
      .toArray();

    const series = agg.map(item => ({
      _id: item._id,
      count: item.count
    }));

    res.json({ range: range || 'all', series });
  } catch (e) {
    console.error("Error getting visitor trends:", e);
    res.status(500).json({ error: "Failed to get visitor trends" });
  }
});

// POST /api/analytics/visitors/track - track a page visit (NO AUTH REQUIRED - public endpoint)
router.post("/visitors/track", async (req, res) => {
  try {
    const { visitors } = await getCollections();
    const { page, country, visitorId, ip, userAgent, referrer, timestamp } = req.body;

    // Basic validation
    if (!page) {
      return res.status(400).json({ error: "Page is required" });
    }

    const visit = {
      page,
      country: country || "Unknown",
      visitorId: visitorId || null,
      ip: ip || req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: userAgent || req.get('User-Agent') || '',
      referrer: referrer || req.get('Referrer') || '',
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date(),
    };

    await visitors.insertOne(visit);
    res.json({ success: true });
  } catch (e) {
    console.error("Error tracking visit:", e);
    res.status(500).json({ error: "Failed to track visit" });
  }
});

// GET /api/analytics/visitors/pages?range=30 - page visit statistics
router.get("/visitors/pages", requireAuth(), async (req, res) => {
  try {
    const range = Math.min(Number(req.query.range) || 30, 365);
    const { visitors } = await getCollections();
    const since = addDays(startOfDay(), -range + 1);

    const agg = await visitors
      .aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: "$page",
            count: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$ip" }
          }
        },
        {
          $project: {
            page: "$_id",
            visits: "$count",
            uniqueVisitors: { $size: "$uniqueVisitors" }
          }
        },
        { $sort: { visits: -1 } },
        { $limit: 20 }
      ])
      .toArray();

    res.json({ range, pages: agg });
  } catch (e) {
    console.error("Error getting page stats:", e);
    res.status(500).json({ error: "Failed to get page statistics" });
  }
});

// GET /api/analytics/visitors/overview?range=30 - visitor overview stats
router.get("/visitors/overview", requireAuth(), async (req, res) => {
  try {
    const range = Math.min(Number(req.query.range) || 30, 365);
    const { visitors } = await getCollections();
    const since = addDays(startOfDay(), -range + 1);

    const [totalVisits, uniqueVisitors, topPages, countryStats] = await Promise.all([
      visitors.countDocuments({ createdAt: { $gte: since } }),
      visitors.distinct("ip", { createdAt: { $gte: since } }),
      visitors
        .aggregate([
          { $match: { createdAt: { $gte: since } } },
          { $group: { _id: "$page", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ])
        .toArray(),
      visitors
        .aggregate([
          { $match: { createdAt: { $gte: since } } },
          { $group: { _id: "$country", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ])
        .toArray()
    ]);

    res.json({
      range,
      totalVisits,
      uniqueVisitors: uniqueVisitors.length,
      topPages: topPages.map(p => ({ page: p._id, visits: p.count })),
      topCountries: countryStats.map(c => ({ country: c._id, visits: c.count }))
    });
  } catch (e) {
    console.error("Error getting visitor overview:", e);
    res.status(500).json({ error: "Failed to get visitor overview" });
  }
});

// GET /api/analytics/visitors/pages-by-country?range=30 - detailed page visits by country
router.get("/visitors/pages-by-country", requireAuth(), async (req, res) => {
  try {
    const range = req.query.range === 'all' ? null : Math.min(Number(req.query.range) || 30, 365);
    const { visitors } = await getCollections();
    
    let matchStage = {};
    if (range !== null) {
      const since = addDays(startOfDay(), -range + 1);
      matchStage = { createdAt: { $gte: since } };
    }

    const agg = await visitors
      .aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              page: "$page",
              country: "$country"
            },
            visits: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$ip" }
          }
        },
        {
          $project: {
            page: "$_id.page",
            country: "$_id.country",
            visits: 1,
            uniqueVisitors: { $size: "$uniqueVisitors" }
          }
        },
        {
          $group: {
            _id: "$page",
            totalVisits: { $sum: "$visits" },
            uniqueVisitors: { $addToSet: "$uniqueVisitors" },
            countries: {
              $push: {
                country: "$country",
                visits: "$visits",
                uniqueVisitors: "$uniqueVisitors"
              }
            }
          }
        },
        {
          $project: {
            page: "$_id",
            totalVisits: 1,
            uniqueVisitors: {
              $size: {
                $reduce: {
                  input: "$uniqueVisitors",
                  initialValue: [],
                  in: { $setUnion: ["$$value", "$$this"] }
                }
              }
            },
            countries: {
              $sortArray: {
                input: "$countries",
                sortBy: { visits: -1 }
              }
            }
          }
        },
        { $sort: { totalVisits: -1 } },
        { $limit: 20 }
      ])
      .toArray();

    res.json({ range: range || 'all', pages: agg });
  } catch (e) {
    console.error("Error getting page-by-country stats:", e);
    res.status(500).json({ error: "Failed to get page-by-country statistics" });
  }
});

export default router;
