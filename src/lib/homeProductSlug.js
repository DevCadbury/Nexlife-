const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

export function isMongoObjectId(value) {
  return OBJECT_ID_REGEX.test(String(value || ""));
}

export function slugifyProductName(name) {
  const cleaned = String(name || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return cleaned || "product";
}

export function buildProductSlugMap(products = []) {
  const baseUsage = new Map();
  const idToSlug = new Map();
  const slugToId = new Map();

  products.forEach((product) => {
    if (!product?._id) return;

    const baseSlug = slugifyProductName(product.name);
    const count = baseUsage.get(baseSlug) || 0;
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count}`;

    baseUsage.set(baseSlug, count + 1);
    idToSlug.set(product._id, slug);
    slugToId.set(slug, product._id);
  });

  return { idToSlug, slugToId };
}