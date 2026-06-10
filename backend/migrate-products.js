/**
 * migrate-products.js
 *
 * One-time migration script: copies documents from homeProducts (N1) and
 * productsGallery (N2) into the unified `products` collection.
 *
 * Usage:
 *   node backend/migrate-products.js           # real run
 *   node backend/migrate-products.js --dry-run # print summary only, no writes
 */

import { getDb, getCollections } from "./db.js";

const isDryRun = process.argv.includes("--dry-run");

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Map a homeProducts document to the unified schema.
 * siteContext is always 'surgical' for homeProducts documents.
 */
function mapHomeProduct(doc) {
  // Wrap single image object → images array
  let images = [];
  if (doc.image && typeof doc.image === "object") {
    images = [
      {
        secure_url: doc.image.url || doc.image.secure_url || "",
        public_id: doc.image.publicId || doc.image.public_id || "",
        format: doc.image.format || "",
        bytes: doc.image.bytes || 0,
        width: doc.image.width || 0,
        height: doc.image.height || 0,
      },
    ];
  }

  // Map labels → fields; if hideLabels is set, mark all fields as hidden
  const hideAll = doc.hideLabels === true;
  const fields = Array.isArray(doc.labels)
    ? doc.labels
        .map((l) => ({
          key: String(l?.key ?? "").trim(),
          value: String(l?.value ?? "").trim(),
          hidden: hideAll || l?.hidden === true,
        }))
        .filter((f) => f.key || f.value)
    : [];

  return {
    _id: doc._id,
    name: doc.name || "",
    category: doc.category || "Uncategorized",
    siteContext: "surgical",
    images,
    visible: doc.visible !== false,
    hidePrice: false,
    price: undefined,
    priceUnit: undefined,
    fields,
    isFeatured: false,
    isStarred: false,
    sequence: typeof doc.sequence === "number" ? doc.sequence : 0,
    views: doc.views || 0,
    createdAt: doc.createdAt || new Date(),
    updatedAt: doc.updatedAt || new Date(),
  };
}

/**
 * Map a productsGallery document to the unified schema.
 * siteContext defaults to 'general' for productsGallery documents.
 */
function mapGalleryProduct(doc) {
  // productsGallery stores a single media object (doc.media or doc.image)
  let images = [];
  const media = doc.media || doc.image;
  if (media && typeof media === "object") {
    images = [
      {
        secure_url: media.url || media.secure_url || "",
        public_id: media.publicId || media.public_id || "",
        format: media.format || "",
        bytes: media.bytes || 0,
        width: media.width || 0,
        height: media.height || 0,
      },
    ];
  }

  // productsGallery has no labels/fields concept — use empty array
  const fields = [];

  return {
    _id: doc._id,
    name: doc.name || "",
    category: doc.category || "Uncategorized",
    siteContext: "general",
    images,
    visible: doc.visible !== false,
    hidePrice: false,
    price: undefined,
    priceUnit: undefined,
    fields,
    isFeatured: false,
    isStarred: false,
    sequence: typeof doc.sequence === "number" ? doc.sequence : 0,
    views: doc.views || 0,
    createdAt: doc.createdAt || new Date(),
    updatedAt: doc.updatedAt || new Date(),
  };
}

// ─── main ────────────────────────────────────────────────────────────────────

async function migrate() {
  console.log(`\n🚀  Starting product migration${isDryRun ? " (DRY RUN — no writes)" : ""}...\n`);

  // Connect to MongoDB
  await getDb();
  const { homeProducts, productsGallery, products } = await getCollections();

  // 1. Count source documents
  const [N1, N2] = await Promise.all([
    homeProducts.countDocuments(),
    productsGallery.countDocuments(),
  ]);

  console.log(`📦  homeProducts   (N1): ${N1} documents`);
  console.log(`📦  productsGallery (N2): ${N2} documents`);
  console.log(`📦  Total source        : ${N1 + N2} documents\n`);

  // 2. Load all documents
  const [homeDocs, galleryDocs] = await Promise.all([
    homeProducts.find({}).toArray(),
    productsGallery.find({}).toArray(),
  ]);

  // 3. Map homeProducts → unified schema, keyed by _id string
  const unified = new Map();
  for (const doc of homeDocs) {
    unified.set(doc._id.toString(), mapHomeProduct(doc));
  }

  // 4. Map productsGallery → unified schema; detect _id conflicts
  const conflicts = [];
  for (const doc of galleryDocs) {
    const key = doc._id.toString();
    if (unified.has(key)) {
      conflicts.push(key);
      console.warn(`⚠️   Conflict on _id ${key} — using productsGallery version`);
    }
    // Always write gallery version (overwrites homeProducts if conflict)
    unified.set(key, mapGalleryProduct(doc));
  }

  const totalToWrite = unified.size; // N1 + N2 - conflicts
  const expectedAfter = N1 + N2 - conflicts.length;

  console.log(`\n📊  Summary:`);
  console.log(`    Documents to write : ${totalToWrite}`);
  console.log(`    Conflicts detected : ${conflicts.length}`);
  console.log(`    Expected products  : ${expectedAfter}`);

  if (isDryRun) {
    console.log(`\n✅  Dry run complete. No data was written.\n`);
    process.exit(0);
  }

  // 5. Upsert each mapped document into products collection
  let inserted = 0;
  let skipped = 0;
  const errors = [];

  for (const [, doc] of unified) {
    // Remove undefined fields so MongoDB doesn't store them as null
    const cleanDoc = Object.fromEntries(
      Object.entries(doc).filter(([, v]) => v !== undefined)
    );

    try {
      await products.replaceOne({ _id: cleanDoc._id }, cleanDoc, { upsert: true });
      inserted++;
    } catch (err) {
      console.error(`❌  Failed to upsert _id ${cleanDoc._id}: ${err.message}`);
      errors.push(cleanDoc._id.toString());
      skipped++;
    }
  }

  // 6. Assert final count
  const finalCount = await products.countDocuments();
  const assertPass = finalCount >= expectedAfter;

  console.log(`\n📊  Final summary:`);
  console.log(`    Inserted / upserted : ${inserted}`);
  console.log(`    Skipped (errors)    : ${skipped}`);
  console.log(`    Conflicts           : ${conflicts.length}`);
  console.log(`    products count      : ${finalCount}`);
  console.log(`    Expected (≥)        : ${expectedAfter}`);
  console.log(`    Assertion           : ${assertPass ? "✅ PASS" : "❌ FAIL"}`);

  if (!assertPass) {
    console.error(
      `\n❌  Count assertion failed: products=${finalCount} but expected≥${expectedAfter}`
    );
    process.exit(1);
  }

  console.log(
    `\n✅  Migration complete: ${inserted} inserted, ${skipped} skipped, ${conflicts.length} conflicts\n`
  );
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Fatal migration error:", err);
  process.exit(1);
});
