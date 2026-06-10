import type { MetadataRoute } from "next";
import { getProducts, getCategories } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nexlifeinternational.in";

export const revalidate = 3600; // regenerate at most once an hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/quote`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Dynamic product + category routes (fail-safe: never break the build)
  let productRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];

  try {
    const productsRes = await getProducts({ site: "surgical", limit: 200 });
    productRoutes = (productsRes.items ?? []).map((p) => ({
      url: `${SITE_URL}/product/${p.slug ?? p._id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // backend unreachable at build time — ship static routes only
  }

  try {
    const catsRes = await getCategories("surgical");
    categoryRoutes = (catsRes.items ?? [])
      .filter((c) => !/^[a-f0-9]{24}$/i.test(c.name))
      .map((c) => ({
        url: `${SITE_URL}/products?category=${encodeURIComponent(c.name)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch {
    // ignore
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
