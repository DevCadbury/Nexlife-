import express from 'express';
import { ObjectId } from 'mongodb';
import { getCollections } from '../db.js';
import { requireAuth } from './auth.js';

const router = express.Router();

const VALID_SITE_CONTEXTS = ['surgical', 'general', 'both'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseObjectId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

// ─── GET /api/v2/categories  (public) ─────────────────────────────────────────
// Returns all visible categories; optional ?site=surgical|general filter.
router.get('/', async (req, res) => {
  try {
    const { site } = req.query;

    if (site !== undefined && !['surgical', 'general'].includes(site)) {
      return res.status(400).json({
        error: 'Invalid site parameter. Use surgical or general.',
      });
    }

    const filter = { visible: true };
    if (site) {
      filter.siteContext = { $in: [site, 'both'] };
    }

    const { categories } = await getCollections();
    const items = await categories.find(filter).sort({ sequence: 1 }).toArray();

    return res.json({ total: items.length, items });
  } catch (err) {
    console.error('[categories] GET /', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/v2/categories/admin/all  (admin) ────────────────────────────────
// Returns all categories including hidden, sorted by sequence.
router.get(
  '/admin/all',
  requireAuth(['superadmin', 'dev']),
  async (req, res) => {
    try {
      const { categories } = await getCollections();
      const items = await categories.find({}).sort({ sequence: 1 }).toArray();
      return res.json({ total: items.length, items });
    } catch (err) {
      console.error('[categories] GET /admin/all', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// ─── POST /api/v2/categories  (admin) ─────────────────────────────────────────
// Create a new category.
router.post('/', requireAuth(['superadmin', 'dev']), async (req, res) => {
  try {
    const { name, siteContext } = req.body || {};

    // Validate name
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required.' });
    }
    if (name.trim().length > 100) {
      return res
        .status(400)
        .json({ error: 'name must be 100 characters or fewer.' });
    }

    // Validate siteContext
    if (!VALID_SITE_CONTEXTS.includes(siteContext)) {
      return res.status(400).json({
        error: "siteContext must be 'surgical', 'general', or 'both'.",
      });
    }

    const trimmedName = name.trim();
    const { categories } = await getCollections();

    // Check for duplicate (case-insensitive) within same siteContext
    const duplicate = await categories.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(trimmedName)}$`, 'i') },
      siteContext,
    });
    if (duplicate) {
      return res.status(409).json({ error: 'Category already exists.' });
    }

    // Assign sequence = max existing + 1
    const top = await categories.findOne({}, { sort: { sequence: -1 } });
    const sequence = (Number(top?.sequence) || 0) + 1;

    const now = new Date();
    const doc = {
      name: trimmedName,
      siteContext,
      visible: true,
      sequence,
      createdAt: now,
      updatedAt: now,
    };

    const result = await categories.insertOne(doc);
    return res.status(201).json({ success: true, item: { _id: result.insertedId, ...doc } });
  } catch (err) {
    console.error('[categories] POST /', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/v2/categories/reorder  (admin) ────────────────────────────────
// Must be declared BEFORE /:id to avoid Express treating 'reorder' as an id.
router.post(
  '/reorder',
  requireAuth(['superadmin', 'dev']),
  async (req, res) => {
    try {
      const body = req.body;

      if (!Array.isArray(body) || body.length === 0) {
        return res.status(400).json({
          error:
            'Request body must be a non-empty array of { id, sequence }.',
        });
      }

      const { categories } = await getCollections();
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

      if (ops.length) await categories.bulkWrite(ops);
      return res.json({ success: true });
    } catch (err) {
      console.error('[categories] POST /reorder', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// ─── PATCH /api/v2/categories/:id  (admin) — rename ──────────────────────────
router.patch('/:id', requireAuth(['superadmin', 'dev']), async (req, res) => {
  try {
    const _id = parseObjectId(req.params.id);
    if (!_id) return res.status(400).json({ error: 'Invalid category id.' });

    const { name } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required.' });
    }
    if (name.trim().length > 100) {
      return res
        .status(400)
        .json({ error: 'name must be 100 characters or fewer.' });
    }

    const newName = name.trim();
    const { categories, products } = await getCollections();

    const category = await categories.findOne({ _id });
    if (!category) return res.status(404).json({ error: 'Category not found.' });

    // Check duplicate under same siteContext (excluding self)
    const duplicate = await categories.findOne({
      _id: { $ne: _id },
      name: { $regex: new RegExp(`^${escapeRegex(newName)}$`, 'i') },
      siteContext: category.siteContext,
    });
    if (duplicate) {
      return res.status(409).json({
        error: `Category "${newName}" already exists under siteContext "${category.siteContext}".`,
      });
    }

    const oldName = category.name;
    if (oldName === newName) return res.json({ success: true });

    // Update category name
    await categories.updateOne(
      { _id },
      { $set: { name: newName, updatedAt: new Date() } }
    );

    // Cascade: update all products referencing old category name
    try {
      await products.updateMany(
        { category: oldName },
        { $set: { category: newName, updatedAt: new Date() } }
      );
    } catch (cascadeErr) {
      // Roll back category rename
      try {
        await categories.updateOne(
          { _id },
          { $set: { name: oldName, updatedAt: new Date() } }
        );
      } catch (rollbackErr) {
        console.error('[categories] PATCH rollback failed', rollbackErr);
      }
      return res.status(500).json({
        error: 'Rename failed and was rolled back.',
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('[categories] PATCH /:id', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/v2/categories/:id  (admin) ──────────────────────────────────
router.delete('/:id', requireAuth(['superadmin', 'dev']), async (req, res) => {
  try {
    const _id = parseObjectId(req.params.id);
    if (!_id) return res.status(400).json({ error: 'Invalid category id.' });

    const { categories, products } = await getCollections();

    const category = await categories.findOne({ _id });
    if (!category) return res.status(404).json({ error: 'Category not found.' });

    // Count products in this category
    const count = await products.countDocuments({ category: category.name });

    if (count > 0) {
      const { moveTo, deleteProducts } = req.body || {};

      if (!moveTo && !deleteProducts) {
        return res.status(409).json({
          error: `Category has ${count} products. Provide moveTo or deleteProducts.`,
          count,
        });
      }

      let moved = 0;
      let deleted = 0;

      if (moveTo) {
        // Find target category by _id
        const targetId = parseObjectId(moveTo);
        if (!targetId) return res.status(400).json({ error: 'Invalid moveTo id.' });

        const targetCategory = await categories.findOne({ _id: targetId });
        if (!targetCategory) {
          return res.status(404).json({ error: 'Target category not found.' });
        }

        const moveResult = await products.updateMany(
          { category: category.name },
          { $set: { category: targetCategory.name, updatedAt: new Date() } }
        );
        moved = moveResult.modifiedCount || 0;
      } else if (deleteProducts) {
        const deleteResult = await products.deleteMany({ category: category.name });
        deleted = deleteResult.deletedCount || 0;
      }

      await categories.deleteOne({ _id });
      return res.json({ success: true, moved, deleted });
    }

    // No products — delete directly
    await categories.deleteOne({ _id });
    return res.json({ success: true, moved: 0, deleted: 0 });
  } catch (err) {
    console.error('[categories] DELETE /:id', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/v2/categories/:id/visibility  (admin) ────────────────────────
router.patch(
  '/:id/visibility',
  requireAuth(['superadmin', 'dev']),
  async (req, res) => {
    try {
      const _id = parseObjectId(req.params.id);
      if (!_id) return res.status(400).json({ error: 'Invalid category id.' });

      const { categories } = await getCollections();
      const category = await categories.findOne({ _id });
      if (!category) return res.status(404).json({ error: 'Category not found.' });

      // Accept explicit { visible: boolean } or toggle
      let newVisible;
      if (req.body?.visible !== undefined) {
        newVisible = Boolean(req.body.visible);
      } else {
        newVisible = !category.visible;
      }

      await categories.updateOne(
        { _id },
        { $set: { visible: newVisible, updatedAt: new Date() } }
      );

      return res.json({ success: true, visible: newVisible });
    } catch (err) {
      console.error('[categories] PATCH /:id/visibility', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

export default router;
