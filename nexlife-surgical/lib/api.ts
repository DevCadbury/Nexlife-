import type { Product, ProductsResponse, CategoriesResponse } from './types/product';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BACKEND_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    next: { revalidate: 60 },
  } as RequestInit);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || res.statusText);
  }
  return res.json();
}

export async function getProducts(params?: {
  site?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<ProductsResponse> {
  const query = new URLSearchParams();
  if (params?.site) query.set('site', params.site);
  if (params?.category) query.set('category', params.category);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return apiFetch<ProductsResponse>(`/api/v2/products${qs ? `?${qs}` : ''}`);
}

export async function getProductById(idOrSlug: string): Promise<Product> {
  // If it looks like a MongoDB ObjectId (24 hex chars), fetch by id; otherwise by slug
  const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
  if (isObjectId) {
    return apiFetch<Product>(`/api/v2/products/${idOrSlug}`);
  }
  return apiFetch<Product>(`/api/v2/products/by-slug/${encodeURIComponent(idOrSlug)}`);
}

export async function getFeaturedProducts(site?: string): Promise<ProductsResponse> {
  const qs = site ? `?site=${site}` : '';
  return apiFetch<ProductsResponse>(`/api/v2/products/featured${qs}`);
}

export async function getStarredProducts(site?: string): Promise<ProductsResponse> {
  const qs = site ? `?site=${site}` : '';
  return apiFetch<ProductsResponse>(`/api/v2/products/starred${qs}`);
}

export async function getRecentProducts(site?: string, limit = 8): Promise<ProductsResponse> {
  const query = new URLSearchParams();
  if (site) query.set('site', site);
  query.set('limit', String(limit));
  return apiFetch<ProductsResponse>(`/api/v2/products/recent?${query.toString()}`);
}

export async function getCategories(site?: string): Promise<CategoriesResponse> {
  const qs = site ? `?site=${site}` : '';
  return apiFetch<CategoriesResponse>(`/api/v2/categories${qs}`);
}

export async function submitInquiry(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
  phone?: string;
  productName?: string;
}): Promise<{ success: boolean; message?: string }> {
  return apiFetch('/api/contact', {
    method: 'POST',
    // Tag every submission from this site as 'surgical' so the CRM can label it.
    body: JSON.stringify({ ...data, source: 'surgical' }),
  });
}
