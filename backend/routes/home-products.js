import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { getCollections } from "../db.js";
import { requireAuth } from "./auth.js";
import { logCommunication, ActivityLevel } from "../config/logger.js";
import { ObjectId } from "mongodb";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files allowed."));
  },
});

const router = express.Router();

/* ─── Public: list visible home products ─── */
router.get("/", async (req, res) => {
  try {
    const { homeProducts } = await getCollections();
    const items = await homeProducts
      .find({ visible: { $ne: false } })
      .project({ adminNote: 0, uploadedBy: 0 })
      .sort({ sequence: 1, createdAt: -1 })
      .toArray();
    res.json({ total: items.length, items });
  } catch (err) {
    console.error("Error listing home products:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ─── Public: get single product by id ─── */
router.get("/:id", async (req, res) => {
  try {
    const { homeProducts } = await getCollections();
    const _id = new ObjectId(req.params.id);
    const item = await homeProducts.findOne({ _id });
    if (!item) return res.status(404).json({ error: "Product not found" });
    // increment views
    await homeProducts.updateOne({ _id }, { $inc: { views: 1 } });
    res.json(item);
  } catch (err) {
    console.error("Error fetching home product:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ─── Admin: list all (including hidden) ─── */
router.get(
  "/admin/all",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const { homeProducts } = await getCollections();
      const items = await homeProducts
        .find({})
        .sort({ sequence: 1, createdAt: -1 })
        .toArray();
      res.json({ total: items.length, items });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ─── Admin: create product ─── */
router.post(
  "/",
  requireAuth(["superadmin", "dev"]),
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, category } = req.body;
      if (!name) return res.status(400).json({ error: "Name is required" });

      const { homeProducts } = await getCollections();

      // Next sequence
      const top = await homeProducts.findOne({}, { sort: { sequence: -1 } });
      const nextSeq = (top?.sequence || 0) + 1;

      // Parse labels from req.body (sent as JSON string or key-value pairs)
      let labels = [];
      if (req.body.labels) {
        try {
          labels = JSON.parse(req.body.labels);
        } catch {
          labels = [];
        }
      }

      let imageData = null;
      if (req.file) {
        await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "nexlife-home-products",
              resource_type: "image",
              transformation: [
                { width: 800, height: 800, crop: "limit" },
                { quality: "auto" },
                { fetch_format: "auto" },
              ],
            },
            (error, uploaded) => {
              if (error) return reject(error);
              imageData = {
                url: uploaded.secure_url,
                publicId: uploaded.public_id,
                format: uploaded.format,
                bytes: uploaded.bytes,
                width: uploaded.width,
                height: uploaded.height,
              };
              resolve();
            }
          );
          stream.end(req.file.buffer);
        });
      }

      const doc = {
        name: String(name),
        category: category ? String(category) : "",
        labels, // array of { key, value } pairs — admin can add unlimited
        image: imageData,
        views: 0,
        visible: true,
        adminNote: "",
        sequence: nextSeq,
        uploadedBy: {
          id: req.user?.id,
          name: req.user?.name || "Admin",
          email: req.user?.email || "admin@nexlifeinternational.com",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await homeProducts.insertOne(doc);

      await logCommunication(req, {
        level: ActivityLevel.SUCCESS,
        type: "home-products.create",
        message: `Created home product: ${doc.name}`,
        refId: result.insertedId,
        actorId: req.user?.id,
        actorName: req.user?.name,
        meta: { name: doc.name },
      });

      res.json({ success: true, item: { _id: result.insertedId, ...doc } });
    } catch (err) {
      console.error("Error creating home product:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/* ─── Admin: update product ─── */
router.patch(
  "/:id",
  requireAuth(["superadmin", "dev"]),
  upload.single("image"),
  async (req, res) => {
    try {
      const { homeProducts } = await getCollections();
      const _id = new ObjectId(req.params.id);
      const existing = await homeProducts.findOne({ _id });
      if (!existing) return res.status(404).json({ error: "Not found" });

      const updates = { updatedAt: new Date() };

      if (req.body.name !== undefined) updates.name = String(req.body.name);
      if (req.body.category !== undefined) updates.category = String(req.body.category);
      if (req.body.labels !== undefined) {
        try {
          updates.labels = JSON.parse(req.body.labels);
        } catch {
          updates.labels = [];
        }
      }

      // Replace image if new file uploaded
      if (req.file) {
        // Destroy old from cloudinary
        if (existing.image?.publicId) {
          try {
            await cloudinary.uploader.destroy(existing.image.publicId);
          } catch (e) {
            console.warn("Could not destroy old image:", e.message);
          }
        }
        await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "nexlife-home-products",
              resource_type: "image",
              transformation: [
                { width: 800, height: 800, crop: "limit" },
                { quality: "auto" },
                { fetch_format: "auto" },
              ],
            },
            (error, uploaded) => {
              if (error) return reject(error);
              updates.image = {
                url: uploaded.secure_url,
                publicId: uploaded.public_id,
                format: uploaded.format,
                bytes: uploaded.bytes,
                width: uploaded.width,
                height: uploaded.height,
              };
              resolve();
            }
          );
          stream.end(req.file.buffer);
        });
      }

      await homeProducts.updateOne({ _id }, { $set: updates });

      await logCommunication(req, {
        level: ActivityLevel.SUCCESS,
        type: "home-products.update",
        message: `Updated home product: ${existing.name}`,
        refId: _id,
        actorId: req.user?.id,
        actorName: req.user?.name,
      });

      res.json({ success: true });
    } catch (err) {
      console.error("Error updating home product:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/* ─── Admin: delete product ─── */
router.delete(
  "/:id",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const { homeProducts } = await getCollections();
      const _id = new ObjectId(req.params.id);
      const existing = await homeProducts.findOne({ _id });
      if (!existing) return res.status(404).json({ error: "Not found" });

      // Destroy from cloudinary
      if (existing.image?.publicId) {
        try {
          await cloudinary.uploader.destroy(existing.image.publicId);
        } catch (e) {
          console.warn("Could not destroy image:", e.message);
        }
      }

      await homeProducts.deleteOne({ _id });

      await logCommunication(req, {
        level: ActivityLevel.SUCCESS,
        type: "home-products.delete",
        message: `Deleted home product: ${existing.name}`,
        refId: _id,
        actorId: req.user?.id,
        actorName: req.user?.name,
      });

      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting home product:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/* ─── Admin: toggle visibility ─── */
router.patch(
  "/:id/visibility",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const { homeProducts } = await getCollections();
      const _id = new ObjectId(req.params.id);
      const item = await homeProducts.findOne({ _id });
      if (!item) return res.status(404).json({ error: "Not found" });
      await homeProducts.updateOne(
        { _id },
        { $set: { visible: !item.visible, updatedAt: new Date() } }
      );
      res.json({ success: true, visible: !item.visible });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ─── Admin: reorder ─── */
router.post(
  "/reorder",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const { order } = req.body; // [{ id, sequence }]
      if (!Array.isArray(order))
        return res.status(400).json({ error: "order array required" });

      const { homeProducts } = await getCollections();
      const ops = order.map(({ id, sequence }) => ({
        updateOne: {
          filter: { _id: new ObjectId(id) },
          update: { $set: { sequence: Number(sequence), updatedAt: new Date() } },
        },
      }));
      if (ops.length) await homeProducts.bulkWrite(ops);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
