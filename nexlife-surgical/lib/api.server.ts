/**
 * Server-side data-fetching helpers.
 * These are called from Server Components (no "use client").
 * They use Next.js fetch with `revalidate` so results are cached and shared
 * across concurrent requests — first visit warms the cache, subsequent hits
 * return instantly without touching the backend.
 */

import type { ProductsResponse, CategoriesResponse } from "./types/product";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const REVALIDATE = 60; // seconds — revalidate at most once per minute

async function serverFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BACKEND}${path}`, {
      next: { revalidate: REVALIDATE },
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function serverGetCategories(
  site = "surgical"
): Promise<CategoriesResponse | null> {
  return serverFetch<CategoriesResponse>(`/api/v2/categories?site=${site}`);
}

export async function serverGetFeaturedProducts(
  site = "surgical"
): Promise<ProductsResponse | null> {
  return serverFetch<ProductsResponse>(
    `/api/v2/products/featured?site=${site}`
  );
}

export async function serverGetStarredProducts(
  site = "surgical"
): Promise<ProductsResponse | null> {
  return serverFetch<ProductsResponse>(
    `/api/v2/products/starred?site=${site}`
  );
}

export async function serverGetAllProducts(
  site = "surgical",
  limit = 80
): Promise<ProductsResponse | null> {
  return serverFetch<ProductsResponse>(
    `/api/v2/products?site=${site}&limit=${limit}`
  );
}
