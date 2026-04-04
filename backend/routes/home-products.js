import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { getCollections } from "../db.js";
import { requireAuth } from "./auth.js";
import { logCommunication, ActivityLevel } from "../config/logger.js";
import { ObjectId } from "mongodb";

const DEFAULT_FOLDER = "Uncategorized";
const MAX_NOTE_LENGTH = 4000;

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

const normalizeFolderName = (value) => {
  const normalized = String(value ?? "").trim();
  return normalized || DEFAULT_FOLDER;
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "n", "off"].includes(normalized)) return false;
  }
  return Boolean(value);
};

const sanitizeLabels = (labelsInput) => {
  if (!Array.isArray(labelsInput)) return [];

  return labelsInput
    .map((entry) => {
      const key = String(entry?.key ?? "").trim();
      const value = String(entry?.value ?? "").trim();
      if (!key && !value) return null;
      return {
        key,
        value,
        hidden: parseBoolean(entry?.hidden, false),
      };
    })
    .filter(Boolean);
};

const getPublicLabels = (labelsInput, hideAll = false) => {
  if (hideAll) return [];

  return sanitizeLabels(labelsInput)
    .filter((label) => !label.hidden)
    .map((label) => ({ key: label.key, value: label.value }));
};

const parseLabels = (rawLabels, fallback = []) => {
  if (rawLabels === undefined) return fallback;
  if (rawLabels === null || rawLabels === "") return [];

  let parsed = rawLabels;
  if (typeof rawLabels === "string") {
    try {
      parsed = JSON.parse(rawLabels);
    } catch {
      return [];
    }
  }

  return sanitizeLabels(parsed);
};

const folderProductFilter = (folderName) => {
  const normalized = normalizeFolderName(folderName);

  if (normalized === DEFAULT_FOLDER) {
    return {
      $or: [
        { category: DEFAULT_FOLDER },
        { category: "" },
        { category: { $exists: false } },
        { category: null },
      ],
    };
  }

  return { category: normalized };
};

async function ensureFolderDocument(homeProductFolders, folderName) {
  const normalized = normalizeFolderName(folderName);
  const existing = await homeProductFolders.findOne({ name: normalized });
  if (existing) return existing;

  const top = await homeProductFolders.findOne({}, { sort: { sequence: -1 } });
  const now = new Date();
  const sequence = (Number(top?.sequence) || 0) + 1;

  await homeProductFolders.insertOne({
    name: normalized,
    sequence,
    visible: true,
    createdAt: now,
    updatedAt: now,
  });

  return {
    name: normalized,
    sequence,
    visible: true,
    createdAt: now,
    updatedAt: now,
  };
}

async function getFolderMeta() {
  const { homeProducts, homeProductFolders } = await getCollections();

  const [folderDocs, productCats] = await Promise.all([
    homeProductFolders.find({}).sort({ sequence: 1, name: 1 }).toArray(),
    homeProducts.find({}, { projection: { category: 1 } }).toArray(),
  ]);

  const counts = new Map();
  for (const product of productCats) {
    const folderName = normalizeFolderName(product.category);
    counts.set(folderName, (counts.get(folderName) || 0) + 1);
  }

  const docMap = new Map();
  let maxSequence = 0;

  for (const doc of folderDocs) {
    const name = normalizeFolderName(doc.name);
    const sequence = Number.isFinite(Number(doc.sequence))
      ? Number(doc.sequence)
      : 0;

    maxSequence = Math.max(maxSequence, sequence);
    docMap.set(name, {
      name,
      sequence,
      visible: doc.visible !== false,
    });
  }

  const allNames = new Set([...counts.keys(), ...docMap.keys()]);
  const missingNames = [...allNames]
    .filter((name) => !docMap.has(name))
    .sort((a, b) => a.localeCompare(b));

  missingNames.forEach((name, index) => {
    docMap.set(name, {
      name,
      sequence: maxSequence + index + 1,
      visible: true,
    });
  });

  const folders = [...docMap.values()]
    .map((folder) => ({
      ...folder,
      count: counts.get(folder.name) || 0,
    }))
    .sort((a, b) => a.sequence - b.sequence || a.name.localeCompare(b.name));

  const sequenceMap = new Map(folders.map((folder) => [folder.name, folder.sequence]));
  const hiddenSet = new Set(
    folders.filter((folder) => !folder.visible).map((folder) => folder.name)
  );

  return { folders, sequenceMap, hiddenSet };
}

/* ─── Public: list visible home products ─── */
router.get("/", async (req, res) => {
  try {
    const { homeProducts } = await getCollections();
    const { sequenceMap, hiddenSet } = await getFolderMeta();

    const rawItems = await homeProducts
      .find(
        { visible: { $ne: false } },
        { projection: { adminNote: 0, uploadedBy: 0 } }
      )
      .toArray();

    const items = rawItems
      .map((item) => ({
        ...item,
        category: normalizeFolderName(item.category),
        hideLabels: item.hideLabels === true,
        labels: getPublicLabels(item.labels, item.hideLabels === true),
      }))
      .filter((item) => !hiddenSet.has(item.category))
      .sort((a, b) => {
        const folderA = sequenceMap.get(a.category) ?? Number.MAX_SAFE_INTEGER;
        const folderB = sequenceMap.get(b.category) ?? Number.MAX_SAFE_INTEGER;
        if (folderA !== folderB) return folderA - folderB;

        const seqA = Number(a.sequence) || 0;
        const seqB = Number(b.sequence) || 0;
        if (seqA !== seqB) return seqA - seqB;

        const createdA = new Date(a.createdAt || 0).getTime();
        const createdB = new Date(b.createdAt || 0).getTime();
        return createdB - createdA;
      });

    res.json({ total: items.length, items });
  } catch (err) {
    console.error("Error listing home products:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ─── Public: get single product by id ─── */
router.get("/:id", async (req, res) => {
  try {
    const { homeProducts, homeProductFolders } = await getCollections();
    const _id = new ObjectId(req.params.id);

    const item = await homeProducts.findOne(
      { _id },
      { projection: { adminNote: 0, uploadedBy: 0 } }
    );

    if (!item) return res.status(404).json({ error: "Product not found" });

    const category = normalizeFolderName(item.category);
    const folderDoc = await homeProductFolders.findOne({ name: category });
    const folderVisible = folderDoc ? folderDoc.visible !== false : true;

    if (item.visible === false || !folderVisible) {
      return res.status(404).json({ error: "Product not found" });
    }

    await homeProducts.updateOne({ _id }, { $inc: { views: 1 } });

    res.json({
      ...item,
      category,
      hideLabels: item.hideLabels === true,
      labels: getPublicLabels(item.labels, item.hideLabels === true),
    });
  } catch (err) {
    console.error("Error fetching home product:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ─── Admin: list all products (including hidden) ─── */
router.get(
  "/admin/all",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const { homeProducts } = await getCollections();
      const items = await homeProducts
        .find({})
        .sort({ category: 1, sequence: 1, createdAt: -1 })
        .toArray();

      const normalizedItems = items.map((item) => ({
        ...item,
        category: normalizeFolderName(item.category),
        adminNote: String(item.adminNote || ""),
        hideLabels: item.hideLabels === true,
        labels: sanitizeLabels(item.labels),
      }));

      res.json({ total: normalizedItems.length, items: normalizedItems });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ─── Admin: folders list ─── */
router.get(
  "/admin/folders",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const { folders } = await getFolderMeta();
      res.json({ folders });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ─── Admin: create folder ─── */
router.post(
  "/admin/folders",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const rawName = String(req.body?.name || "").trim();
      if (!rawName) return res.status(400).json({ error: "Folder name is required" });

      const name = normalizeFolderName(rawName);

      const { homeProducts, homeProductFolders } = await getCollections();

      const nameRegex = new RegExp(`^${escapeRegex(name)}$`, "i");
      const [existingFolder, existingProductFolder] = await Promise.all([
        homeProductFolders.findOne({ name: nameRegex }),
        homeProducts.findOne({ category: nameRegex }),
      ]);

      if (existingFolder || existingProductFolder) {
        return res.status(409).json({
          error: `Folder "${name}" already exists. Choose a different name.`,
          code: "FOLDER_EXISTS",
        });
      }

      const top = await homeProductFolders.findOne({}, { sort: { sequence: -1 } });
      const now = new Date();
      const sequence = (Number(top?.sequence) || 0) + 1;

      await homeProductFolders.insertOne({
        name,
        sequence,
        visible: true,
        createdAt: now,
        updatedAt: now,
      });

      res.json({
        success: true,
        folder: { name, sequence, visible: true, count: 0 },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ─── Admin: rename folder ─── */
router.patch(
  "/admin/folders/:name",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const oldName = normalizeFolderName(decodeURIComponent(req.params.name));
      const rawNewName = String(req.body?.newName || "").trim();
      if (!rawNewName) {
        return res.status(400).json({ error: "New folder name is required" });
      }

      const newName = normalizeFolderName(rawNewName);
      if (oldName === newName) return res.json({ success: true });

      const { homeProducts, homeProductFolders } = await getCollections();

      const newNameRegex = new RegExp(`^${escapeRegex(newName)}$`, "i");
      const existingNewDoc = await homeProductFolders.findOne({ name: newNameRegex });
      if (existingNewDoc) {
        return res.status(400).json({ error: "Target folder already exists" });
      }

      const existingTargetProducts = await homeProducts.countDocuments(
        folderProductFilter(newName)
      );
      if (existingTargetProducts > 0) {
        return res.status(400).json({
          error:
            "Target folder already has products. Move products instead of renaming into this folder.",
        });
      }

      const oldDoc = await homeProductFolders.findOne({ name: oldName });
      const productFilter = folderProductFilter(oldName);

      if (oldDoc) {
        await homeProductFolders.updateOne(
          { _id: oldDoc._id },
          { $set: { name: newName, updatedAt: new Date() } }
        );
      } else {
        const top = await homeProductFolders.findOne({}, { sort: { sequence: -1 } });
        await homeProductFolders.insertOne({
          name: newName,
          sequence: (Number(top?.sequence) || 0) + 1,
          visible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      await homeProducts.updateMany(productFilter, {
        $set: { category: newName, updatedAt: new Date() },
      });

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ─── Admin: delete folder ─── */
router.delete(
  "/admin/folders/:name",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const folderName = normalizeFolderName(decodeURIComponent(req.params.name));
      const moveToRaw = req.body?.moveTo;
      const moveTo = moveToRaw ? normalizeFolderName(moveToRaw) : "";
      const deleteProducts = parseBoolean(req.body?.deleteProducts, false);
      const confirmName = String(req.body?.confirmName || "").trim();

      if (moveTo && moveTo === folderName) {
        return res
          .status(400)
          .json({ error: "Target folder must be different from source folder" });
      }

      const { homeProducts, homeProductFolders } = await getCollections();
      const productFilter = folderProductFilter(folderName);
      const productsInFolder = await homeProducts.countDocuments(productFilter);

      let moved = 0;
      let deletedProducts = 0;
      if (productsInFolder > 0) {
        if (deleteProducts) {
          if (confirmName !== folderName) {
            return res.status(400).json({
              error: "Type the exact folder name to confirm permanent product deletion.",
              needsTypedConfirmation: true,
              folderName,
            });
          }

          const products = await homeProducts
            .find(productFilter, { projection: { _id: 1, image: 1 } })
            .toArray();

          await Promise.allSettled(
            products
              .map((product) => product?.image?.publicId)
              .filter(Boolean)
              .map((publicId) => cloudinary.uploader.destroy(publicId))
          );

          const delRes = await homeProducts.deleteMany(productFilter);
          deletedProducts = delRes.deletedCount || 0;
        } else {
          if (!moveTo) {
            return res.status(400).json({
              error: "Folder contains products. Move them to another folder or delete them permanently.",
              needsMoveTo: true,
              count: productsInFolder,
            });
          }

          await ensureFolderDocument(homeProductFolders, moveTo);

          const moveRes = await homeProducts.updateMany(productFilter, {
            $set: { category: moveTo, updatedAt: new Date() },
          });
          moved = moveRes.modifiedCount || 0;
        }
      }

      await homeProductFolders.deleteOne({ name: folderName });

      res.json({ success: true, moved, deletedProducts });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ─── Admin: reorder folders ─── */
router.post(
  "/admin/folders/reorder",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const inputFolders = Array.isArray(req.body?.folders) ? req.body.folders : null;
      if (!inputFolders) {
        return res.status(400).json({ error: "folders array required" });
      }

      const { homeProductFolders } = await getCollections();

      const seen = new Set();
      const ops = [];

      inputFolders.forEach((folder, index) => {
        const name = normalizeFolderName(folder?.name);
        if (!name || seen.has(name)) return;

        seen.add(name);

        const sequence = Number.isFinite(Number(folder?.sequence))
          ? Number(folder.sequence)
          : index + 1;
        const visible = folder?.visible !== false;

        ops.push({
          updateOne: {
            filter: { name },
            update: {
              $set: {
                sequence,
                visible,
                updatedAt: new Date(),
              },
              $setOnInsert: {
                createdAt: new Date(),
              },
            },
            upsert: true,
          },
        });
      });

      if (ops.length) {
        await homeProductFolders.bulkWrite(ops);
      }

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ─── Admin: toggle folder visibility ─── */
router.patch(
  "/admin/folders/:name/visibility",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const name = normalizeFolderName(decodeURIComponent(req.params.name));
      const { homeProductFolders } = await getCollections();

      const existing = await homeProductFolders.findOne({ name });
      const currentVisible = existing ? existing.visible !== false : true;
      const nextVisible =
        req.body?.visible === undefined
          ? !currentVisible
          : parseBoolean(req.body.visible, currentVisible);

      await homeProductFolders.updateOne(
        { name },
        {
          $set: {
            visible: nextVisible,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            sequence: Number(existing?.sequence) || 9999,
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      res.json({ success: true, visible: nextVisible });
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

      const { homeProducts, homeProductFolders } = await getCollections();
      const normalizedCategory = normalizeFolderName(category);

      const topInFolder = await homeProducts.findOne(folderProductFilter(normalizedCategory), {
        sort: { sequence: -1 },
      });
      const nextSeq = (Number(topInFolder?.sequence) || 0) + 1;

      const labels = parseLabels(req.body.labels, []);
      const hideLabels = parseBoolean(req.body.hideLabels, false);
      const adminNote = String(req.body.adminNote || "")
        .trim()
        .slice(0, MAX_NOTE_LENGTH);

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

      await ensureFolderDocument(homeProductFolders, normalizedCategory);

      const doc = {
        name: String(name),
        category: normalizedCategory,
        labels,
        image: imageData,
        views: 0,
        visible: true,
        hideLabels,
        adminNote,
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
      const { homeProducts, homeProductFolders } = await getCollections();
      const _id = new ObjectId(req.params.id);
      const existing = await homeProducts.findOne({ _id });
      if (!existing) return res.status(404).json({ error: "Not found" });

      const updates = { updatedAt: new Date() };

      if (req.body.name !== undefined) updates.name = String(req.body.name);

      if (req.body.category !== undefined) {
        const nextCategory = normalizeFolderName(req.body.category);
        const currentCategory = normalizeFolderName(existing.category);

        updates.category = nextCategory;

        if (nextCategory !== currentCategory) {
          const topInFolder = await homeProducts.findOne(folderProductFilter(nextCategory), {
            sort: { sequence: -1 },
          });
          updates.sequence = (Number(topInFolder?.sequence) || 0) + 1;
        }

        await ensureFolderDocument(homeProductFolders, nextCategory);
      }

      if (req.body.labels !== undefined) {
        updates.labels = parseLabels(req.body.labels, []);
      }

      if (req.body.adminNote !== undefined) {
        updates.adminNote = String(req.body.adminNote || "")
          .trim()
          .slice(0, MAX_NOTE_LENGTH);
      }

      if (req.body.hideLabels !== undefined) {
        updates.hideLabels = parseBoolean(req.body.hideLabels, false);
      }

      // Replace image if new file uploaded
      if (req.file) {
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

/* ─── Admin: reorder products ─── */
router.post(
  "/reorder",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const order = Array.isArray(req.body?.order) ? req.body.order : null;
      if (!order) return res.status(400).json({ error: "order array required" });

      const { homeProducts } = await getCollections();
      const ops = order
        .filter((entry) => entry?.id && Number.isFinite(Number(entry?.sequence)))
        .map((entry) => ({
          updateOne: {
            filter: { _id: new ObjectId(entry.id) },
            update: {
              $set: {
                sequence: Number(entry.sequence),
                updatedAt: new Date(),
              },
            },
          },
        }));

      if (ops.length) await homeProducts.bulkWrite(ops);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ─── Admin: get removed tag suggestions ─── */
router.get(
  "/admin/tag-suggestions",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const { homeProductSettings } = await getCollections();
      const doc = await homeProductSettings.findOne({ _id: "tag-suggestions" });
      res.json({ removed: doc?.removed || [] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ─── Admin: permanently remove a tag suggestion ─── */
router.delete(
  "/admin/tag-suggestions/:tag",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    try {
      const tag = decodeURIComponent(req.params.tag);
      const { homeProductSettings } = await getCollections();
      await homeProductSettings.updateOne(
        { _id: "tag-suggestions" },
        { $addToSet: { removed: tag }, $set: { updatedAt: new Date() } },
        { upsert: true }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
