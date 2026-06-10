import express from 'express';
import multer from 'multer';
import { ObjectId } from 'mongodb';
import { getCollections } from '../db.js';
import { requireAuth } from './auth.js';
import { uploadImage, deleteImage } from '../middleware/cloudinary.js';

const router = express.Router();

const VALID_SITE_CONTEXTS = ['surgical', 'general', 'both'];

// ─── Multer (memory storage, same as home-products.js) ───────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseObjectId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

/**
 * Generate a URL-friendly slug from a product name.
 * e.g. "Sterile Surgical Gloves – Latex" → "sterile-surgical-gloves-latex"
 */
function generateSlug(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // remove non-alphanumeric except spaces/hyphens
    .trim()
    .replace(/[\s_]+/g, '-')         // spaces/underscores → hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .slice(0, 80);                   // max 80 chars
}

/**
 * Build the siteContext filter from the ?site= query param.
 * Default (omitted) behaves the same as site=surgical.
 * Returns null if site value is invalid.
 */
function buildSiteFilter(site) {
  if (!site || site === 'surgical') {
    return { siteContext: { $in: ['surgical', 'both'] } };
  }
  if (site === 'general') {
    return { siteContext: { $in: ['general', 'both'] } };
  }
  return null; // invalid
}

/**
 * Strip price fields and hidden dynamic fields from a product for public
 * consumption.  Mutates a plain JS object copy — do NOT pass Mongo documents
 * directly if you need them later.
 */
function stripPublicFields(product) {
  const p = { ...product };

  if (p.hidePrice) {
    delete p.price;
    delete p.priceUnit;
  }

  if (Array.isArray(p.fields)) {
    p.fields = p.fields.filter((f) => f.hidden !== true);
  }

  return p;
}

/**
 * Fetch the set of category names whose visible flag is false.
 */
async function getHiddenCategoryNames(categories) {
  const hidden = await categories
    .find({ visible: false }, { projection: { name: 1 } })
    .toArray();
  return new Set(hidden.map((c) => c.name));
}

// ─── GET /api/v2/products  (public) ───────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { site, category } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 50));

    const siteFilter = buildSiteFilter(site);
    if (!siteFilter) {
      return res.status(400).json({ error: 'Invalid site parameter.' });
    }

    const { products, categories } = await getCollections();

    // Get hidden category names to exclude
    const hiddenCategories = await getHiddenCategoryNames(categories);

    const filter = {
      visible: true,
      ...siteFilter,
    };

    if (category) {
      // Products may have their category stored as the category name OR as a legacy ObjectId string.
      // Build a filter that matches either.
      let categoryIdString = null;
      try {
        const { ObjectId } = await import('mongodb');
        if (/^[a-f0-9]{24}$/i.test(category)) {
          // Param is an ObjectId — find the category name
          const catDoc = await categories.findOne({ _id: new ObjectId(category) });
          if (catDoc) {
            filter.$or = [{ category: catDoc.name }, { category: category }];
          } else {
            filter.category = category;
          }
        } else {
          // Param is a category name — also try to match by the category's _id stored as string
          const catDoc = await categories.findOne({ name: category });
          if (catDoc) {
            filter.$or = [
              { category: category },
              { category: catDoc._id.toString() },
            ];
          } else {
            filter.category = category;
          }
        }
      } catch {
        filter.category = category;
      }
    }

    const skip = (page - 1) * limit;
    const [total, rawItems] = await Promise.all([
      products.countDocuments(filter),
      products.find(filter).sort({ sequence: 1 }).skip(skip).limit(limit).toArray(),
    ]);

    const items = rawItems
      .filter((p) => !hiddenCategories.has(p.category))
      .map(stripPublicFields);

    return res.json({ total, page, limit, items });
  } catch (err) {
    console.error('[products] GET /', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/v2/products/featured  (public) ─────────────────────────────────
router.get('/featured', async (req, res) => {
  try {
    const { site } = req.query;

    const siteFilter = buildSiteFilter(site);
    if (!siteFilter) {
      return res.status(400).json({ error: 'Invalid site parameter.' });
    }

    const { products, categories } = await getCollections();
    const hiddenCategories = await getHiddenCategoryNames(categories);

    const filter = { isFeatured: true, visible: true, ...siteFilter };
    const rawItems = await products.find(filter).sort({ sequence: 1 }).toArray();

    const items = rawItems
      .filter((p) => !hiddenCategories.has(p.category))
      .map(stripPublicFields);

    return res.json({ total: items.length, items });
  } catch (err) {
    console.error('[products] GET /featured', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/v2/products/starred  (public) ───────────────────────────────────
router.get('/starred', async (req, res) => {
  try {
    const { site } = req.query;

    const siteFilter = buildSiteFilter(site);
    if (!siteFilter) {
      return res.status(400).json({ error: 'Invalid site parameter.' });
    }

    const { products, categories } = await getCollections();
    const hiddenCategories = await getHiddenCategoryNames(categories);

    const filter = { isStarred: true, visible: true, ...siteFilter };
    const rawItems = await products.find(filter).sort({ sequence: 1 }).toArray();

    const items = rawItems
      .filter((p) => !hiddenCategories.has(p.category))
      .map(stripPublicFields);

    return res.json({ total: items.length, items });
  } catch (err) {
    console.error('[products] GET /starred', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/v2/products/admin/all  (admin) ──────────────────────────────────
router.get(
  '/admin/all',
  requireAuth(['superadmin', 'dev']),
  async (req, res) => {
    try {
      const { site } = req.query;
      const { products } = await getCollections();

      const filter = {};
      if (site) {
        const siteFilter = buildSiteFilter(site);
        if (!siteFilter) {
          return res.status(400).json({ error: 'Invalid site parameter.' });
        }
        Object.assign(filter, siteFilter);
      }

      const items = await products.find(filter).toArray();
      return res.json({ total: items.length, items });
    } catch (err) {
      console.error('[products] GET /admin/all', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// ─── POST /api/v2/products/reorder  (admin) ───────────────────────────────────
// Declared before /:id to prevent 'reorder' being treated as an ObjectId.
router.post(
  '/reorder',
  requireAuth(['superadmin', 'dev']),
  async (req, res) => {
    try {
      const body = req.body;

      if (!Array.isArray(body) || body.length === 0) {
        return res.status(400).json({
          error: 'Request body must be a non-empty array of { id, sequence }.',
        });
      }

      const { products } = await getCollections();
      const ops = body
        .filter((entry) => entry?.id && entry?.sequence !== undefined)
        .map((entry) => {
          const _id = parseObjectId(entry.id);
          if (!_id) return null;
          return {
            updateOne: {
              filter: { _id },
              update: { $set: { sequence: Number(entry.sequence), updatedAt: new Date() } },
            },
          };
        })
        .filter(Boolean);

      if (ops.length) await products.bulkWrite(ops);
      return res.json({ success: true });
    } catch (err) {
      console.error('[products] POST /reorder', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// ─── GET /api/v2/products/by-slug/:slug  (public) ───────────────────────────
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const { products } = await getCollections();
    const product = await products.findOne({ slug: req.params.slug });

    if (!product || !product.visible) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    return res.json(stripPublicFields(product));
  } catch (err) {
    console.error('[products] GET /by-slug/:slug', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/v2/products/:id  (public) ───────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { products } = await getCollections();
    const _id = parseObjectId(req.params.id);

    // Try by ObjectId first, fall back to slug
    const product = _id
      ? await products.findOne({ _id })
      : await products.findOne({ slug: req.params.id });

    if (!product || !product.visible) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    return res.json(stripPublicFields(product));
  } catch (err) {
    console.error('[products] GET /:id', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/v2/products  (admin) ───────────────────────────────────────────
router.post(
  '/',
  requireAuth(['superadmin', 'dev']),
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, category } = req.body || {};

      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'name is required' });
      }
      if (!category || !String(category).trim()) {
        return res.status(400).json({ error: 'category is required' });
      }

      // siteContext — default 'surgical' if not provided
      const siteContext =
        req.body.siteContext && req.body.siteContext.trim()
          ? req.body.siteContext.trim()
          : 'surgical';

      if (!VALID_SITE_CONTEXTS.includes(siteContext)) {
        return res.status(400).json({
          error: "siteContext must be 'surgical', 'general', or 'both'.",
        });
      }

      // Parse optional fields array (sent as JSON string or array)
      let fields = [];
      if (req.body.fields !== undefined) {
        try {
          fields = typeof req.body.fields === 'string'
            ? JSON.parse(req.body.fields)
            : req.body.fields;
          if (!Array.isArray(fields)) fields = [];
        } catch {
          fields = [];
        }
      }

      // Upload image if provided
      let images = [];
      if (req.file) {
        try {
          const imgData = await uploadImage(req.file.buffer, req.file.mimetype);
          images = [imgData];
        } catch (uploadErr) {
          console.error('[products] Cloudinary upload error:', uploadErr);
          return res.status(500).json({ error: 'Image upload failed.' });
        }
      }

      const { products } = await getCollections();

      // Generate unique slug from product name
      const now = new Date();
      const nameStr = String(name).trim();
      const baseSlug = generateSlug(nameStr);
      let slug = baseSlug;
      let slugSuffix = 0;
      while (await products.findOne({ slug })) {
        slugSuffix++;
        slug = `${baseSlug}-${slugSuffix}`;
      }

      // Sequence = max in same category + 1
      const top = await products.findOne(
        { category: String(category).trim() },
        { sort: { sequence: -1 } }
      );
      const sequence = (Number(top?.sequence) || 0) + 1;

      const doc = {
        name: nameStr,
        slug,
        category: String(category).trim(),
        siteContext,
        images,
        visible: req.body.visible !== undefined ? Boolean(JSON.parse(String(req.body.visible))) : true,
        hidePrice: req.body.hidePrice !== undefined ? Boolean(JSON.parse(String(req.body.hidePrice))) : false,
        price: req.body.price !== undefined ? String(req.body.price) : undefined,
        priceUnit: req.body.priceUnit !== undefined ? String(req.body.priceUnit) : undefined,
        fields,
        isFeatured: req.body.isFeatured !== undefined ? Boolean(JSON.parse(String(req.body.isFeatured))) : false,
        isStarred: req.body.isStarred !== undefined ? Boolean(JSON.parse(String(req.body.isStarred))) : false,
        sequence,
        createdAt: now,
        updatedAt: now,
      };

      // Remove undefined values
      for (const key of Object.keys(doc)) {
        if (doc[key] === undefined) delete doc[key];
      }

      const result = await products.insertOne(doc);
      return res.status(201).json({ success: true, item: { _id: result.insertedId, ...doc } });
    } catch (err) {
      console.error('[products] POST /', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// ─── PATCH /api/v2/products/:id/visibility  (admin) ───────────────────────────
router.patch(
  '/:id/visibility',
  requireAuth(['superadmin', 'dev']),
  async (req, res) => {
    try {
      const _id = parseObjectId(req.params.id);
      if (!_id) return res.status(404).json({ error: 'Product not found.' });

      const { products } = await getCollections();
      const product = await products.findOne({ _id });
      if (!product) return res.status(404).json({ error: 'Product not found.' });

      const newVisible = !product.visible;
      await products.updateOne({ _id }, { $set: { visible: newVisible, updatedAt: new Date() } });
      return res.json({ success: true, visible: newVisible });
    } catch (err) {
      console.error('[products] PATCH /:id/visibility', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// ─── PATCH /api/v2/products/:id/featured  (admin) ─────────────────────────────
router.patch(
  '/:id/featured',
  requireAuth(['superadmin', 'dev']),
  async (req, res) => {
    try {
      const _id = parseObjectId(req.params.id);
      if (!_id) return res.status(404).json({ error: 'Product not found.' });

      const { products } = await getCollections();
      const product = await products.findOne({ _id });
      if (!product) return res.status(404).json({ error: 'Product not found.' });

      const newFeatured = !product.isFeatured;
      await products.updateOne({ _id }, { $set: { isFeatured: newFeatured, updatedAt: new Date() } });
      return res.json({ success: true, isFeatured: newFeatured });
    } catch (err) {
      console.error('[products] PATCH /:id/featured', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// ─── PATCH /api/v2/products/:id/starred  (admin) ──────────────────────────────
router.patch(
  '/:id/starred',
  requireAuth(['superadmin', 'dev']),
  async (req, res) => {
    try {
      const _id = parseObjectId(req.params.id);
      if (!_id) return res.status(404).json({ error: 'Product not found.' });

      const { products } = await getCollections();
      const product = await products.findOne({ _id });
      if (!product) return res.status(404).json({ error: 'Product not found.' });

      const newStarred = !product.isStarred;
      await products.updateOne({ _id }, { $set: { isStarred: newStarred, updatedAt: new Date() } });
      return res.json({ success: true, isStarred: newStarred });
    } catch (err) {
      console.error('[products] PATCH /:id/starred', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// ─── PATCH /api/v2/products/:id  (admin) ──────────────────────────────────────
router.patch(
  '/:id',
  requireAuth(['superadmin', 'dev']),
  upload.single('image'),
  async (req, res) => {
    try {
      const _id = parseObjectId(req.params.id);
      if (!_id) return res.status(404).json({ error: 'Product not found.' });

      const { products } = await getCollections();
      const existing = await products.findOne({ _id });
      if (!existing) return res.status(404).json({ error: 'Product not found.' });

      const updates = { updatedAt: new Date() };
      const body = req.body || {};

      if (body.name !== undefined) updates.name = String(body.name).trim();
      if (body.category !== undefined) updates.category = String(body.category).trim();
      if (body.price !== undefined) updates.price = String(body.price);
      if (body.priceUnit !== undefined) updates.priceUnit = String(body.priceUnit);
      if (body.hidePrice !== undefined) {
        updates.hidePrice = Boolean(JSON.parse(String(body.hidePrice)));
      }
      if (body.isFeatured !== undefined) {
        updates.isFeatured = Boolean(JSON.parse(String(body.isFeatured)));
      }
      if (body.isStarred !== undefined) {
        updates.isStarred = Boolean(JSON.parse(String(body.isStarred)));
      }
      if (body.visible !== undefined) {
        updates.visible = Boolean(JSON.parse(String(body.visible)));
      }
      if (body.sequence !== undefined) updates.sequence = Number(body.sequence);
      if (body.siteContext !== undefined) {
        if (!VALID_SITE_CONTEXTS.includes(body.siteContext)) {
          return res.status(400).json({
            error: "siteContext must be 'surgical', 'general', or 'both'.",
          });
        }
        updates.siteContext = body.siteContext;
      }
      if (body.fields !== undefined) {
        try {
          updates.fields = typeof body.fields === 'string'
            ? JSON.parse(body.fields)
            : body.fields;
          if (!Array.isArray(updates.fields)) updates.fields = [];
        } catch {
          updates.fields = [];
        }
      }

      // Handle image replacement
      if (req.file) {
        const oldPublicId = existing.images?.[0]?.public_id;
        if (oldPublicId) {
          try {
            await deleteImage(oldPublicId);
          } catch (deleteErr) {
            console.error('[products] Failed to delete old Cloudinary image:', deleteErr);
            return res.status(500).json({
              error: 'Failed to delete existing image. Upload aborted.',
            });
          }
        }

        try {
          const imgData = await uploadImage(req.file.buffer, req.file.mimetype);
          // Build updated images array replacing index 0
          const existingImages = Array.isArray(existing.images) ? [...existing.images] : [];
          existingImages[0] = imgData;
          updates.images = existingImages;
        } catch (uploadErr) {
          console.error('[products] Cloudinary upload error:', uploadErr);
          return res.status(500).json({ error: 'Image upload failed.' });
        }
      }

      await products.updateOne({ _id }, { $set: updates });
      const updatedDoc = await products.findOne({ _id });
      return res.json({ success: true, item: updatedDoc });
    } catch (err) {
      console.error('[products] PATCH /:id', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// ─── DELETE /api/v2/products/:id  (admin) ─────────────────────────────────────
router.delete(
  '/:id',
  requireAuth(['superadmin', 'dev']),
  async (req, res) => {
    try {
      const _id = parseObjectId(req.params.id);
      if (!_id) return res.status(404).json({ error: 'Product not found.' });

      const { products } = await getCollections();
      const product = await products.findOne({ _id });
      if (!product) return res.status(404).json({ error: 'Product not found.' });

      // Attempt Cloudinary cleanup — log failures, do NOT block delete
      if (Array.isArray(product.images)) {
        await Promise.allSettled(
          product.images
            .filter((img) => img?.public_id)
            .map((img) =>
              deleteImage(img.public_id).catch((err) =>
                console.warn('[products] DELETE Cloudinary cleanup failed:', err.message)
              )
            )
        );
      }

      await products.deleteOne({ _id });
      return res.json({ success: true });
    } catch (err) {
      console.error('[products] DELETE /:id', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

export default router;
