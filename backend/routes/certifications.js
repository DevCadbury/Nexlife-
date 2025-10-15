import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { getCollections } from "../db.js";
import { requireAuth } from "./auth.js";
import { logCommunication, ActivityLevel } from "../config/logger.js";
import { ObjectId } from "mongodb";

// Configure separate Cloudinary instance for certifications
const certificationsCloudinary = cloudinary;
if (process.env.CLOUDINARY_CLOUD_NAME1) {
  certificationsCloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME1,
    api_key: process.env.CLOUDINARY_API_KEY1,
    api_secret: process.env.CLOUDINARY_API_SECRET1,
  });
  console.log("Certifications Cloudinary configured with cloud_name:", process.env.CLOUDINARY_CLOUD_NAME1);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});
const router = express.Router();

// Public: list certifications (only visible items)
router.get("/", async (req, res) => {
  const { certifications } = await getCollections();
  const items = await certifications
    .find({ visible: { $ne: false } })
    .project({ adminNote: 0, uploadedBy: 0 })
    .sort({ sequence: 1, createdAt: -1 })
    .toArray();
  res.json({ total: items.length, items });
});

// Public: get certifications by type
router.get("/type/:type", async (req, res) => {
  const { certifications } = await getCollections();
  const { type } = req.params;
  
  const query = { visible: { $ne: false } };
  if (type && type !== "All") {
    query.type = type;
  }
  
  const items = await certifications
    .find(query)
    .project({ adminNote: 0, uploadedBy: 0 })
    .sort({ sequence: 1, createdAt: -1 })
    .toArray();
  res.json({ total: items.length, items });
});

// Public: get all types
router.get("/types", async (req, res) => {
  const { certifications } = await getCollections();
  const types = await certifications.distinct("type", { visible: { $ne: false } });
  res.json({ types: ["All", ...types.filter(t => t)] });
});

// Admin: list all certifications - SUPERADMIN & DEV ONLY
router.get(
  "/admin",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    const { certifications } = await getCollections();
    const items = await certifications
      .find({})
      .sort({ sequence: 1, createdAt: -1 })
      .toArray();
    res.json({ total: items.length, items });
  }
);

// Admin: create/upload certification - SUPERADMIN & DEV ONLY
router.post(
  "/",
  requireAuth(["superadmin", "dev"]),
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, description, issueDate, issuedBy, validUntil, type } = req.body;
      
      if (!title || !type) {
        return res.status(400).json({ error: "Title and type are required" });
      }

      const { certifications } = await getCollections();
      
      // Get current max sequence
      const maxSequenceItem = await certifications.findOne({}, { sort: { sequence: -1 } });
      const nextSequence = (maxSequenceItem?.sequence || 0) + 1;

      let imageData = null;
      
      // If image file is uploaded
      if (req.file) {
        await new Promise((resolve, reject) => {
          const uploadStream = certificationsCloudinary.uploader.upload_stream(
            {
              folder: "nexlife-certifications",
              resource_type: "image",
              transformation: [
                { width: 1200, height: 1200, crop: "limit" },
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
          uploadStream.end(req.file.buffer);
        });
      }

      const doc = {
        title: String(title),
        description: description ? String(description) : "",
        issueDate: issueDate ? String(issueDate) : "",
        issuedBy: issuedBy ? String(issuedBy) : "",
        validUntil: validUntil ? String(validUntil) : "",
        type: String(type),
        image: imageData,
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

      const result = await certifications.insertOne(doc);
      
      await logCommunication(req, {
        level: ActivityLevel.SUCCESS,
        type: "certifications.create",
        message: `Created certification: ${doc.title}`,
        refId: result.insertedId,
        actorId: req.user?.id,
        actorName: req.user?.name,
        meta: { title: doc.title, type: doc.type },
      });

      res.json({ success: true, item: { _id: result.insertedId, ...doc } });
    } catch (error) {
      console.error("Error creating certification:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Admin: update certification - SUPERADMIN & DEV ONLY
router.patch(
  "/:id",
  requireAuth(["superadmin", "dev"]),
  upload.single("image"),
  async (req, res) => {
    try {
      const _id = new ObjectId(req.params.id);
      const { title, description, issueDate, issuedBy, validUntil, type } = req.body;
      const { certifications } = await getCollections();

      const existingCert = await certifications.findOne({ _id });
      if (!existingCert) {
        return res.status(404).json({ error: "Certification not found" });
      }

      const updateData = {
        ...(title && { title: String(title) }),
        ...(description !== undefined && { description: String(description) }),
        ...(issueDate !== undefined && { issueDate: String(issueDate) }),
        ...(issuedBy !== undefined && { issuedBy: String(issuedBy) }),
        ...(validUntil !== undefined && { validUntil: String(validUntil) }),
        ...(type && { type: String(type) }),
        updatedAt: new Date(),
      };

      // If new image is uploaded
      if (req.file) {
        // Delete old image if exists
        if (existingCert.image?.publicId) {
          try {
            await certificationscertificationsCloudinary.uploader.destroy(existingCert.image.publicId);
          } catch (err) {
            console.error("Error deleting old image:", err);
          }
        }

        // Upload new image
        await new Promise((resolve, reject) => {
          const uploadStream = certificationscertificationsCloudinary.uploader.upload_stream(
            {
              folder: "nexlife-certifications",
              resource_type: "image",
              transformation: [
                { width: 1200, height: 1200, crop: "limit" },
                { quality: "auto" },
                { fetch_format: "auto" },
              ],
            },
            (error, uploaded) => {
              if (error) return reject(error);
              updateData.image = {
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
          uploadStream.end(req.file.buffer);
        });
      }

      await certifications.updateOne({ _id }, { $set: updateData });
      
      await logCommunication(req, {
        level: ActivityLevel.INFO,
        type: "certifications.update",
        message: `Updated certification: ${title || existingCert.title}`,
        refId: _id,
        actorId: req.user?.id,
        actorName: req.user?.name,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating certification:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Admin: delete certification - SUPERADMIN & DEV ONLY
router.delete(
  "/:id",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const { certifications } = await getCollections();
      const _id = new ObjectId(req.params.id);
      
      const item = await certifications.findOne({ _id });
      if (!item) return res.status(404).json({ error: "Certification not found" });

      // Delete image from Cloudinary
      if (item.image?.publicId) {
        try {
          await certificationscertificationsCloudinary.uploader.destroy(item.image.publicId);
        } catch (err) {
          console.error("Error deleting image:", err);
        }
      }

      await certifications.deleteOne({ _id });
      
      await logCommunication(req, {
        level: ActivityLevel.WARN,
        type: "certifications.delete",
        message: `Deleted certification: ${item.title}`,
        refId: _id,
        actorId: req.user?.id,
        actorName: req.user?.name,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting certification:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Public: like a certification
router.post("/:id/like", async (req, res) => {
  try {
    const { certifications } = await getCollections();
    const _id = new ObjectId(req.params.id);
    await certifications.updateOne({ _id }, { $inc: { likes: 1 } });
    const item = await certifications.findOne({ _id });
    res.json({ likes: item?.likes || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public: get single certification and increment view count
router.get("/:id", async (req, res) => {
  try {
    const { certifications } = await getCollections();
    const _id = new ObjectId(req.params.id);
    
    const item = await certifications.findOne({ _id }, { projection: { adminNote: 0 } });
    if (!item) {
      return res.status(404).json({ error: "Certification not found" });
    }

    await certifications.updateOne({ _id }, { $inc: { views: 1 } });
    
    res.json({ item: { ...item, views: (item.views || 0) + 1 } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: set visibility - SUPERADMIN & DEV ONLY
router.patch(
  "/:id/visibility",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const { visible } = req.body || {};
      if (typeof visible !== "boolean") {
        return res.status(400).json({ error: "visible boolean required" });
      }
      const { certifications } = await getCollections();
      const _id = new ObjectId(req.params.id);
      await certifications.updateOne({ _id }, { $set: { visible, updatedAt: new Date() } });
      
      await logCommunication(req, {
        level: ActivityLevel.INFO,
        type: "certifications.visibility",
        message: `Set certification visibility to ${visible}`,
        refId: _id,
        actorId: req.user?.id,
        actorName: req.user?.name,
        meta: { visible },
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Admin: set admin note - SUPERADMIN & DEV ONLY
router.patch(
  "/:id/note",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const note = String((req.body?.note || "").slice(0, 2000));
      const { certifications } = await getCollections();
      const _id = new ObjectId(req.params.id);
      await certifications.updateOne({ _id }, { $set: { adminNote: note, updatedAt: new Date() } });
      
      await logCommunication(req, {
        level: ActivityLevel.INFO,
        type: "certifications.note",
        message: `Updated admin note`,
        refId: _id,
        actorId: req.user?.id,
        actorName: req.user?.name,
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Admin: move certification in sequence - SUPERADMIN & DEV ONLY
router.patch(
  "/:id/sequence",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const { direction } = req.body;
      if (!['up', 'down'].includes(direction)) {
        return res.status(400).json({ error: "Direction must be 'up' or 'down'" });
      }

      const { certifications } = await getCollections();
      const _id = new ObjectId(req.params.id);
      
      const currentCert = await certifications.findOne({ _id });
      if (!currentCert) {
        return res.status(404).json({ error: "Certification not found" });
      }

      const allCerts = await certifications.find({}).sort({ sequence: 1 }).toArray();
      const currentIndex = allCerts.findIndex(c => c._id.toString() === _id.toString());
      
      if (currentIndex === -1) {
        return res.status(404).json({ error: "Certification not found in sequence" });
      }

      let targetIndex;
      if (direction === 'up' && currentIndex > 0) {
        targetIndex = currentIndex - 1;
      } else if (direction === 'down' && currentIndex < allCerts.length - 1) {
        targetIndex = currentIndex + 1;
      } else {
        return res.status(400).json({ error: "Cannot move in that direction" });
      }

      const targetCert = allCerts[targetIndex];
      const currentSequence = currentCert.sequence || currentIndex;
      const targetSequence = targetCert.sequence || targetIndex;

      await certifications.updateOne({ _id: currentCert._id }, { $set: { sequence: targetSequence } });
      await certifications.updateOne({ _id: targetCert._id }, { $set: { sequence: currentSequence } });

      await logCommunication(req, {
        level: ActivityLevel.INFO,
        type: "certifications.sequence",
        message: `Moved certification ${direction} in sequence`,
        refId: _id,
        actorId: req.user?.id,
        actorName: req.user?.name,
        meta: { direction, from: currentSequence, to: targetSequence },
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Admin: bulk reorder certifications - SUPERADMIN & DEV ONLY
router.post(
  "/reorder",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const { sequences } = req.body;
      if (!Array.isArray(sequences)) {
        return res.status(400).json({ error: "Sequences must be an array" });
      }

      const { certifications } = await getCollections();
      
      const updatePromises = sequences.map(({ id, sequence }) =>
        certifications.updateOne({ _id: new ObjectId(id) }, { $set: { sequence } })
      );

      await Promise.all(updatePromises);

      await logCommunication(req, {
        level: ActivityLevel.INFO,
        type: "certifications.reorder",
        message: `Bulk reordered ${sequences.length} certifications`,
        actorId: req.user?.id,
        actorName: req.user?.name,
        meta: { count: sequences.length },
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
