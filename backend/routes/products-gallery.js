import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { getCollections } from "../db.js";
import { requireAuth } from "./auth.js";
import { logCommunication, ActivityLevel } from "../config/logger.js";
import { ObjectId } from "mongodb";

// Configure separate Cloudinary instance for products
const productsCloudinary = cloudinary;
if (process.env.CLOUDINARY_CLOUD_NAME1) {
  productsCloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME1,
    api_key: process.env.CLOUDINARY_API_KEY1,
    api_secret: process.env.CLOUDINARY_API_SECRET1,
  });
  console.log("Products Cloudinary configured with cloud_name:", process.env.CLOUDINARY_CLOUD_NAME1);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});
const router = express.Router();

// Public: list products (only visible items)
router.get("/", async (req, res) => {
  const { productsGallery } = await getCollections();
  const items = await productsGallery
    .find({ visible: { $ne: false } })
    .project({ adminNote: 0 })
    .sort({ sequence: 1, createdAt: -1 })
    .toArray();
  res.json({ total: items.length, items });
});

// Public: get products by category
router.get("/category/:category", async (req, res) => {
  const { productsGallery } = await getCollections();
  const { category } = req.params;
  
  const query = { visible: { $ne: false } };
  if (category && category !== "All") {
    query.category = category;
  }
  
  const items = await productsGallery
    .find(query)
    .project({ adminNote: 0 })
    .sort({ sequence: 1, createdAt: -1 })
    .toArray();
  res.json({ total: items.length, items });
});

// Public: get all categories
router.get("/categories", async (req, res) => {
  const { productsGallery } = await getCollections();
  const categories = await productsGallery.distinct("category", { visible: { $ne: false } });
  res.json({ categories: ["All", ...categories.filter(c => c)] });
});

// Admin: list all products - SUPERADMIN & DEV ONLY
router.get(
  "/admin",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    const { productsGallery } = await getCollections();
    const items = await productsGallery
      .find({})
      .sort({ sequence: 1, createdAt: -1 })
      .toArray();
    res.json({ total: items.length, items });
  }
);

// Admin: create/upload product - SUPERADMIN & DEV ONLY
router.post(
  "/",
  requireAuth(["superadmin", "dev"]),
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, brandName, components, uses, class: productClass, packing, category } = req.body;
      
      if (!name || !category) {
        return res.status(400).json({ error: "Name and category are required" });
      }

      const { productsGallery } = await getCollections();
      
      // Get current max sequence
      const maxSequenceItem = await productsGallery.findOne({}, { sort: { sequence: -1 } });
      const nextSequence = (maxSequenceItem?.sequence || 0) + 1;

      let imageData = null;
      
      // If image file is uploaded
      if (req.file) {
        await new Promise((resolve, reject) => {
          const uploadStream = productsCloudinary.uploader.upload_stream(
            {
              folder: "nexlife-products",
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
          uploadStream.end(req.file.buffer);
        });
      }

      const doc = {
        name: String(name),
        brandName: brandName ? String(brandName) : "",
        components: components ? (Array.isArray(components) ? components : [components]) : [],
        uses: uses ? String(uses) : "",
        class: productClass ? String(productClass) : "",
        packing: packing ? String(packing) : "",
        category: String(category),
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

      const result = await productsGallery.insertOne(doc);
      
      await logCommunication(req, {
        level: ActivityLevel.SUCCESS,
        type: "products.create",
        message: `Created product: ${doc.name}`,
        refId: result.insertedId,
        actorId: req.user?.id,
        actorName: req.user?.name,
        meta: { name: doc.name, category: doc.category },
      });

      res.json({ success: true, item: { _id: result.insertedId, ...doc } });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Admin: update product - SUPERADMIN & DEV ONLY
router.patch(
  "/:id",
  requireAuth(["superadmin", "dev"]),
  upload.single("image"),
  async (req, res) => {
    try {
      const _id = new ObjectId(req.params.id);
      const { name, brandName, components, uses, class: productClass, packing, category } = req.body;
      const { productsGallery } = await getCollections();

      const existingProduct = await productsGallery.findOne({ _id });
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      const updateData = {
        ...(name && { name: String(name) }),
        ...(brandName !== undefined && { brandName: String(brandName) }),
        ...(components && { components: Array.isArray(components) ? components : [components] }),
        ...(uses !== undefined && { uses: String(uses) }),
        ...(productClass !== undefined && { class: String(productClass) }),
        ...(packing !== undefined && { packing: String(packing) }),
        ...(category && { category: String(category) }),
        updatedAt: new Date(),
      };

      // If new image is uploaded
      if (req.file) {
        // Delete old image if exists
        if (existingProduct.image?.publicId) {
          try {
            await productsCloudinary.uploader.destroy(existingProduct.image.publicId);
          } catch (err) {
            console.error("Error deleting old image:", err);
          }
        }

        // Upload new image
        await new Promise((resolve, reject) => {
          const uploadStream = productsCloudinary.uploader.upload_stream(
            {
              folder: "nexlife-products",
              resource_type: "image",
              transformation: [
                { width: 800, height: 800, crop: "limit" },
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

      await productsGallery.updateOne({ _id }, { $set: updateData });
      
      await logCommunication(req, {
        level: ActivityLevel.INFO,
        type: "products.update",
        message: `Updated product: ${name || existingProduct.name}`,
        refId: _id,
        actorId: req.user?.id,
        actorName: req.user?.name,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Admin: delete product - SUPERADMIN & DEV ONLY
router.delete(
  "/:id",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const { productsGallery } = await getCollections();
      const _id = new ObjectId(req.params.id);
      
      const item = await productsGallery.findOne({ _id });
      if (!item) return res.status(404).json({ error: "Product not found" });

      // Delete image from Cloudinary
      if (item.image?.publicId) {
        try {
          await productsCloudinary.uploader.destroy(item.image.publicId);
        } catch (err) {
          console.error("Error deleting image:", err);
        }
      }

      await productsGallery.deleteOne({ _id });
      
      await logCommunication(req, {
        level: ActivityLevel.WARN,
        type: "products.delete",
        message: `Deleted product: ${item.name}`,
        refId: _id,
        actorId: req.user?.id,
        actorName: req.user?.name,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Public: like a product
router.post("/:id/like", async (req, res) => {
  try {
    const { productsGallery } = await getCollections();
    const _id = new ObjectId(req.params.id);
    await productsGallery.updateOne({ _id }, { $inc: { likes: 1 } });
    const item = await productsGallery.findOne({ _id });
    res.json({ likes: item?.likes || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public: get single product and increment view count
router.get("/:id", async (req, res) => {
  try {
    const { productsGallery } = await getCollections();
    const _id = new ObjectId(req.params.id);
    
    const item = await productsGallery.findOne({ _id }, { projection: { adminNote: 0 } });
    if (!item) {
      return res.status(404).json({ error: "Product not found" });
    }

    await productsGallery.updateOne({ _id }, { $inc: { views: 1 } });
    
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
      const { productsGallery } = await getCollections();
      const _id = new ObjectId(req.params.id);
      await productsGallery.updateOne({ _id }, { $set: { visible, updatedAt: new Date() } });
      
      await logCommunication(req, {
        level: ActivityLevel.INFO,
        type: "products.visibility",
        message: `Set product visibility to ${visible}`,
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
      const { productsGallery } = await getCollections();
      const _id = new ObjectId(req.params.id);
      await productsGallery.updateOne({ _id }, { $set: { adminNote: note, updatedAt: new Date() } });
      
      await logCommunication(req, {
        level: ActivityLevel.INFO,
        type: "products.note",
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

// Admin: move product in sequence - SUPERADMIN & DEV ONLY
router.patch(
  "/:id/sequence",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const { direction } = req.body;
      if (!['up', 'down'].includes(direction)) {
        return res.status(400).json({ error: "Direction must be 'up' or 'down'" });
      }

      const { productsGallery } = await getCollections();
      const _id = new ObjectId(req.params.id);
      
      const currentProduct = await productsGallery.findOne({ _id });
      if (!currentProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      const allProducts = await productsGallery.find({}).sort({ sequence: 1 }).toArray();
      const currentIndex = allProducts.findIndex(p => p._id.toString() === _id.toString());
      
      if (currentIndex === -1) {
        return res.status(404).json({ error: "Product not found in sequence" });
      }

      let targetIndex;
      if (direction === 'up' && currentIndex > 0) {
        targetIndex = currentIndex - 1;
      } else if (direction === 'down' && currentIndex < allProducts.length - 1) {
        targetIndex = currentIndex + 1;
      } else {
        return res.status(400).json({ error: "Cannot move in that direction" });
      }

      const targetProduct = allProducts[targetIndex];
      const currentSequence = currentProduct.sequence || currentIndex;
      const targetSequence = targetProduct.sequence || targetIndex;

      await productsGallery.updateOne({ _id: currentProduct._id }, { $set: { sequence: targetSequence } });
      await productsGallery.updateOne({ _id: targetProduct._id }, { $set: { sequence: currentSequence } });

      await logCommunication(req, {
        level: ActivityLevel.INFO,
        type: "products.sequence",
        message: `Moved product ${direction} in sequence`,
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

// Admin: bulk reorder products - SUPERADMIN & DEV ONLY
router.post(
  "/reorder",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const { sequences } = req.body;
      if (!Array.isArray(sequences)) {
        return res.status(400).json({ error: "Sequences must be an array" });
      }

      const { productsGallery } = await getCollections();
      
      const updatePromises = sequences.map(({ id, sequence }) =>
        productsGallery.updateOne({ _id: new ObjectId(id) }, { $set: { sequence } })
      );

      await Promise.all(updatePromises);

      await logCommunication(req, {
        level: ActivityLevel.INFO,
        type: "products.reorder",
        message: `Bulk reordered ${sequences.length} products`,
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
