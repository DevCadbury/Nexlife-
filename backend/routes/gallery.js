import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { getCollections } from "../db.js";
import { requireAuth } from "./auth.js";
import { logCommunication, ActivityLevel } from "../config/logger.js";

// Cloudinary configuration is handled in server.js

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});
const router = express.Router();

// Public: list gallery (only visible items, hide admin notes)
router.get("/", async (req, res) => {
  const { gallery } = await getCollections();
  const items = await gallery
    .find({ visible: { $ne: false } })
    .project({ adminNote: 0 })
    .sort({ sequence: 1, createdAt: -1 })
    .toArray();
  res.json({ total: items.length, items });
});

// Admin: list all (includes invisible and admin notes)
router.get(
  "/admin",
  requireAuth(["superadmin", "admin", "staff"]),
  async (req, res) => {
    const { gallery } = await getCollections();
    const items = await gallery
      .find({})
      .project({})
      .sort({ sequence: 1, createdAt: -1 })
      .toArray();
    res.json({ total: items.length, items });
  }
);

// Admin: upload image
router.post(
  "/upload",
  requireAuth(["superadmin", "admin"]),
  upload.single("file"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "File required" });
    try {
      const result = await cloudinary.uploader.upload_stream(
        {
          folder: "nexlife-gallery",
          resource_type: "image",
          transformation: [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        },
        async (error, uploaded) => {
          if (error) return res.status(500).json({ error: error.message });
          const { gallery } = await getCollections();
          // Get current max sequence to add new image at the end
          const maxSequenceItem = await gallery.findOne({}, { sort: { sequence: -1 } });
          const nextSequence = (maxSequenceItem?.sequence || 0) + 1;

          const doc = {
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
            alt: req.body.alt || "Gallery image",
            format: uploaded.format,
            bytes: uploaded.bytes,
            width: uploaded.width,
            height: uploaded.height,
            likes: 0,
            views: 0,
            visible: true,
            adminNote: "",
            sequence: nextSequence,
            uploadedBy: {
              id: req.user?.id,
              name: req.user?.name || "Admin",
              email: req.user?.email || "admin@nexlifeinternational.com",
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const r = await gallery.insertOne(doc);
          await logCommunication(req, {
            level: ActivityLevel.SUCCESS,
            type: "gallery.upload",
            message: `Uploaded gallery image ${doc.publicId}`,
            refId: r.insertedId,
            actorId: req.user?.id,
            actorName: req.user?.name,
            meta: { publicId: doc.publicId },
          });
          res.json({ success: true, item: { _id: r.insertedId, ...doc } });
        }
      );
      result.end(req.file.buffer);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

// Admin: delete image (with permission checking)
router.delete(
  "/:id",
  requireAuth(["superadmin", "admin"]),
  async (req, res) => {
    const { gallery } = await getCollections();
    const item = await gallery.findOne({
      _id: new (await import("mongodb")).ObjectId(req.params.id),
    });
    if (!item) return res.status(404).json({ error: "Not found" });

    // Check deletion permissions for admins
    if (req.user?.role === "admin") {
      const uploadedAt = new Date(item.createdAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - uploadedAt.getTime()) / (1000 * 60 * 60);
      
      // Allow deletion within 24 hours or if user uploaded it themselves
      if (hoursDiff > 24 && item.uploadedBy?.id !== req.user?.id) {
        return res.status(403).json({ 
          error: "You can only delete images uploaded within 24 hours or images you uploaded yourself" 
        });
      }
    }

    try {
      if (item.publicId) await cloudinary.uploader.destroy(item.publicId);
    } catch (_) {}
    await gallery.deleteOne({ _id: item._id });
    await logCommunication(req, {
      level: ActivityLevel.WARN,
      type: "gallery.delete",
      message: `Deleted gallery image ${item.publicId || String(item._id)}`,
      refId: item._id,
      actorId: req.user?.id,
      actorName: req.user?.name,
      meta: { publicId: item.publicId || null },
    });
    res.json({ success: true });
  }
);

// Public: like an image
router.post("/:id/like", async (req, res) => {
  const { gallery } = await getCollections();
  const _id = new (await import("mongodb")).ObjectId(req.params.id);
  await gallery.updateOne({ _id }, { $inc: { likes: 1 } });
  const item = await gallery.findOne({ _id });
  res.json({ likes: item?.likes || 0 });
});

// Public: get single image and increment view count (hide admin notes)
router.get("/:id", async (req, res) => {
  try {
    const { gallery } = await getCollections();
    const _id = new (await import("mongodb")).ObjectId(req.params.id);

    const item = await gallery.findOne(
      { _id },
      { projection: { adminNote: 0 } }
    );
    if (!item) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Increment view count
    await gallery.updateOne({ _id }, { $inc: { views: 1 } });

    res.json({
      item: {
        ...item,
        views: (item.views || 0) + 1,
      },
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: set visibility
router.patch(
  "/:id/visibility",
  requireAuth(["superadmin", "admin"]),
  async (req, res) => {
    try {
      const { visible } = req.body || {};
      if (typeof visible !== "boolean") {
        return res.status(400).json({ error: "visible boolean required" });
      }
      const { gallery } = await getCollections();
      const _id = new (await import("mongodb")).ObjectId(req.params.id);
      await gallery.updateOne(
        { _id },
        { $set: { visible, updatedAt: new Date() } }
      );
      await logCommunication(req, {
        level: ActivityLevel.INFO,
        type: "gallery.visibility",
        message: `Set gallery visibility to ${visible}`,
        refId: _id,
        actorId: req.user?.id,
        actorName: req.user?.name,
        meta: { visible },
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Set visibility error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Admin: set admin note (private)
router.patch(
  "/:id/note",
  requireAuth(["superadmin", "admin"]),
  async (req, res) => {
    try {
      const note = String((req.body?.note || "").slice(0, 2000));
      const { gallery } = await getCollections();
      const _id = new (await import("mongodb")).ObjectId(req.params.id);
      await gallery.updateOne(
        { _id },
        { $set: { adminNote: note, updatedAt: new Date() } }
      );
      await logCommunication(req, {
        level: ActivityLevel.INFO,
        type: "gallery.note",
        message: `Updated admin note`,
        refId: _id,
        actorId: req.user?.id,
        actorName: req.user?.name,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Set note error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Admin: move image in sequence
router.patch(
  "/:id/sequence",
  requireAuth(["superadmin", "admin"]),
  async (req, res) => {
    try {
      const { direction } = req.body;
      if (!['up', 'down'].includes(direction)) {
        return res.status(400).json({ error: "Direction must be 'up' or 'down'" });
      }

      const { gallery } = await getCollections();
      const _id = new (await import("mongodb")).ObjectId(req.params.id);
      
      // Get current image
      const currentImage = await gallery.findOne({ _id });
      if (!currentImage) {
        return res.status(404).json({ error: "Image not found" });
      }

      // Get all images sorted by sequence
      const allImages = await gallery.find({}).sort({ sequence: 1 }).toArray();
      const currentIndex = allImages.findIndex(img => img._id.toString() === _id.toString());
      
      if (currentIndex === -1) {
        return res.status(404).json({ error: "Image not found in sequence" });
      }

      let targetIndex;
      if (direction === 'up' && currentIndex > 0) {
        targetIndex = currentIndex - 1;
      } else if (direction === 'down' && currentIndex < allImages.length - 1) {
        targetIndex = currentIndex + 1;
      } else {
        return res.status(400).json({ error: "Cannot move in that direction" });
      }

      // Swap sequences
      const targetImage = allImages[targetIndex];
      const currentSequence = currentImage.sequence || currentIndex;
      const targetSequence = targetImage.sequence || targetIndex;

      await gallery.updateOne(
        { _id: currentImage._id },
        { $set: { sequence: targetSequence } }
      );
      
      await gallery.updateOne(
        { _id: targetImage._id },
        { $set: { sequence: currentSequence } }
      );

      await logCommunication(req, {
        level: ActivityLevel.INFO,
        type: "gallery.sequence",
        message: `Moved image ${direction} in sequence`,
        refId: _id,
        actorId: req.user?.id,
        actorName: req.user?.name,
        meta: { direction, from: currentSequence, to: targetSequence },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating sequence:", error);
      res.status(500).json({ error: "Failed to update sequence" });
    }
  }
);

// Admin: bulk reorder images
router.patch(
  "/reorder",
  requireAuth(["superadmin", "admin"]),
  async (req, res) => {
    try {
      const { sequences } = req.body;
      if (!Array.isArray(sequences)) {
        return res.status(400).json({ error: "Sequences must be an array" });
      }

      const { gallery } = await getCollections();
      const ObjectId = (await import("mongodb")).ObjectId;
      
      // Update all sequences
      const updatePromises = sequences.map(({ id, sequence }) =>
        gallery.updateOne(
          { _id: new ObjectId(id) },
          { $set: { sequence: sequence } }
        )
      );

      await Promise.all(updatePromises);

      await logCommunication(req, {
        level: ActivityLevel.INFO,
        type: "gallery.reorder",
        message: `Bulk reordered ${sequences.length} images`,
        actorId: req.user?.id,
        actorName: req.user?.name,
        meta: { count: sequences.length },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering images:", error);
      res.status(500).json({ error: "Failed to reorder images" });
    }
  }
);

// Admin: migrate existing gallery images to include uploader info and sequences
router.post(
  "/migrate-uploaders",
  requireAuth(["superadmin"]),
  async (req, res) => {
    try {
      const { gallery } = await getCollections();

      // Find all images without uploadedBy field
      const imagesWithoutUploader = await gallery
        .find({
          uploadedBy: { $exists: false },
        })
        .toArray();

      console.log(
        `Found ${imagesWithoutUploader.length} images without uploader info`
      );

      // Update each image with default uploader info
      const updatePromises = imagesWithoutUploader.map((image) =>
        gallery.updateOne(
          { _id: image._id },
          {
            $set: {
              uploadedBy: {
                id: "unknown",
                name: "System",
                email: "system@nexlifeinternational.com",
              },
            },
          }
        )
      );

      await Promise.all(updatePromises);

      // Add sequence numbers to images that don't have them
      const imagesWithoutSequence = await gallery
        .find({ sequence: { $exists: false } })
        .sort({ createdAt: 1 })
        .toArray();

      console.log(
        `Found ${imagesWithoutSequence.length} images without sequence numbers`
      );

      const sequencePromises = imagesWithoutSequence.map((image, index) =>
        gallery.updateOne(
          { _id: image._id },
          { $set: { sequence: index + 1 } }
        )
      );

      await Promise.all(sequencePromises);

      res.json({
        success: true,
        message: `Updated ${imagesWithoutUploader.length} images with uploader info and ${imagesWithoutSequence.length} images with sequence numbers`,
      });
    } catch (error) {
      console.error("Error migrating uploaders:", error);
      res.status(500).json({ error: "Migration failed" });
    }
  }
);

export default router;
