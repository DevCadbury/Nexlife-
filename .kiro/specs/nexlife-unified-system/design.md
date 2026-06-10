# Technical Design Document

## Nexlife Unified System

---

## Overview

This document describes the technical architecture for connecting the three existing applications — the Frontend (`nexlife-surgical`), the Admin CRM (`adminPanel/admin-panel`), and the Backend API (`backend`) — into a single CRM-driven system.

The design follows an incremental migration strategy: new unified API routes are registered under `/api/v2/products` alongside the existing routes (which remain untouched during migration). Once migration is verified, the legacy routes and collections are deprecated.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Clients                          │
│                                                                 │
│   ┌─────────────────────┐       ┌──────────────────────────┐   │
│   │  nexlife-surgical   │       │  adminPanel/admin-panel  │   │
│   │  (Next.js, :3000)   │       │  (Next.js, :3001)        │   │
│   │                     │       │                          │   │
│   │  lib/api.ts         │       │  src/lib/api.ts          │   │
│   │  (API client)       │       │  (API client, axios)     │   │
│   └──────────┬──────────┘       └─────────────┬────────────┘   │
│              │  NEXT_PUBLIC_BACKEND_URL         │               │
└──────────────┼──────────────────────────────────┼───────────────┘
               │           HTTP/REST              │
               ▼                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Backend API (Node.js/Express, :4000)          │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  CORS: localhost:3000, :3001, :4000, prod domains       │   │
│   │  Auth: JWT (requireAuth middleware)                     │   │
│   │  File: multer (memory) → Cloudinary                     │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   Existing routes (kept as-is):          New unified routes:   │
│   /api/home-products                     /api/v2/products       │
│   /api/products-gallery                  /api/v2/products/featured│
│   /api/auth, /api/staff                  /api/v2/products/starred │
│   /api/inquiries, /api/analytics         /api/v2/categories     │
│   ...                                                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MongoDB Atlas                            │
│                                                                 │
│   Collections (existing):     Collections (new):               │
│   homeProducts                products          ← unified       │
│   homeProductFolders          categories        ← unified       │
│   productsGallery             (migration script merges above)   │
│   inquiries (keep)                                              │
│   staff, subscribers, ...     Cloudinary: nexlife-products/     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Components and Interfaces

The system is composed of three applications communicating over HTTP REST. The key interfaces between them are:

- **Frontend → Backend API**: `lib/api.ts` (single module, reads `NEXT_PUBLIC_BACKEND_URL`)
- **CRM → Backend API**: `src/lib/api.ts` (axios instance, reads `NEXT_PUBLIC_BACKEND_URL`, attaches JWT)
- **Backend API route modules**: `routes/products.js` (unified CRUD + public endpoints), `routes/categories.js` (category management)
- **Backend → MongoDB**: `db.js` `getCollections()` — exports `products`, `categories`, `inquiries`, `staff`, etc.
- **Backend → Cloudinary**: `middleware/cloudinary.js` — `uploadImage(buffer, mimetype)`, `deleteImage(publicId)`
- **SiteContext (Frontend)**: `lib/context/SiteContext.tsx` — `{ site: 'surgical'|'general', setSite }` shared across all pages
- **Data hooks (Frontend)**: `lib/hooks/` — `useProducts(site)`, `useCategories(site)`, `useFeaturedProducts(site)`, `useStarredProducts(site)` — wrap API calls with 60-second SWR cache

---

## Data Models

### Product Document (`products` collection)

```typescript
interface Product {
  _id: ObjectId;
  name: string;                    // max 255 chars, required
  category: string;                // category name, required
  siteContext: 'surgical' | 'general' | 'both';  // default: 'surgical'
  images: ProductImage[];          // max 10 entries
  visible: boolean;                // default: true
  hidePrice: boolean;              // default: false
  price?: string;                  // optional
  priceUnit?: string;              // optional
  fields: DynamicField[];          // admin-defined key/value pairs
  isFeatured: boolean;             // default: false
  isStarred: boolean;              // default: false
  sequence: number;                // sort order within category
  views?: number;                  // optional view counter
  createdAt: Date;
  updatedAt: Date;
}

interface ProductImage {
  secure_url: string;              // Cloudinary CDN URL (renamed from 'url')
  public_id: string;              // Cloudinary public_id for deletion
  format: string;
  bytes: number;
  width: number;
  height: number;
}

interface DynamicField {
  key: string;                     // 1–100 chars
  value: string;                   // 1–500 chars
  hidden: boolean;                 // default: false
}
```

**Notes on migration from existing schemas:**
- `homeProducts` uses `image` (single object) → mapped to `images[0]`
- `homeProducts` uses `labels` array → mapped to `fields`
- `homeProducts` uses `hideLabels` boolean → mapped to field-level `hidden` flags
- `productsGallery` images stored as array → merged into `images`
- `siteContext` defaults to `surgical` for all `homeProducts` documents
- `siteContext` inferred from `productsGallery` tags or defaults to `general`

---

### Category Document (`categories` collection)

```typescript
interface Category {
  _id: ObjectId;
  name: string;                    // max 100 chars, unique per siteContext
  siteContext: 'surgical' | 'general' | 'both';
  visible: boolean;                // default: true
  sequence: number;                // sort order
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Backend API Design

### New Route File: `backend/routes/products.js`

All new unified routes live in this single file, mounted at `/api/v2/products` in `server.js`.

#### Public Endpoints (no auth required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v2/products` | List visible products, supports `?site=`, `?category=`, `?page=`, `?limit=` |
| GET | `/api/v2/products/featured` | Products where `isFeatured=true && visible=true`, sorted by `sequence` |
| GET | `/api/v2/products/starred` | Products where `isStarred=true && visible=true`, sorted by `sequence` |
| GET | `/api/v2/products/:id` | Single product by ID (404 if hidden or not found) |

#### Admin Endpoints (JWT required, `superadmin` or `dev` role)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v2/products/admin/all` | All products including hidden |
| POST | `/api/v2/products` | Create product (multipart/form-data with image) |
| PATCH | `/api/v2/products/:id` | Update product (partial, multipart/form-data) |
| DELETE | `/api/v2/products/:id` | Delete product + Cloudinary images |
| PATCH | `/api/v2/products/:id/visibility` | Toggle `visible` flag |
| PATCH | `/api/v2/products/:id/featured` | Toggle `isFeatured` flag |
| PATCH | `/api/v2/products/:id/starred` | Toggle `isStarred` flag |
| POST | `/api/v2/products/reorder` | Bulk sequence update `[{id, sequence}]` |

#### Query Parameters for Public List

| Param | Values | Default | Description |
|-------|--------|---------|-------------|
| `site` | `surgical` \| `general` | `surgical` | Filter by siteContext |
| `category` | string | (none) | Filter by category name |
| `page` | number | `1` | Pagination |
| `limit` | number | `50` | Results per page |

**Site filtering logic:**
```
site=surgical  → { siteContext: { $in: ['surgical', 'both'] } }
site=general   → { siteContext: { $in: ['general', 'both'] } }
(omitted)      → { siteContext: { $in: ['surgical', 'both'] } }  // default
```

**Visibility filtering (public endpoints):**
- Exclude `visible: false` products
- Exclude products whose category has `visible: false` in `categories` collection

**Price/field filtering (public endpoints):**
- If `hidePrice: true` → omit `price` and `priceUnit` from response
- Filter `fields` array: only include items where `hidden: false`

---

### New Route File: `backend/routes/categories.js`

Mounted at `/api/v2/categories` in `server.js`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v2/categories` | Public | List visible categories, `?site=` filter |
| GET | `/api/v2/categories/admin/all` | Admin | All categories including hidden |
| POST | `/api/v2/categories` | Admin | Create category |
| PATCH | `/api/v2/categories/:id` | Admin | Rename category (cascades to products) |
| DELETE | `/api/v2/categories/:id` | Admin | Delete (409 if has products, unless moveTo or deleteProducts) |
| PATCH | `/api/v2/categories/:id/visibility` | Admin | Toggle `visible` |
| POST | `/api/v2/categories/reorder` | Admin | Bulk sequence update |

**Cascade rename:** When a category is renamed, update `category` field on all products in a single bulkWrite operation. If the write fails, return HTTP 500 — MongoDB does not support multi-document transactions in all Atlas tiers, so the implementation uses a compensating update on failure.

---

### Migration Script: `backend/migrate-products.js`

```
node backend/migrate-products.js
```

1. Count `homeProducts` (N1) and `productsGallery` (N2)
2. For each `homeProducts` document:
   - Map to unified schema (`siteContext: 'surgical'`, `images: [image]`, `fields: labels`)
   - Upsert into `products` by `_id`
3. For each `productsGallery` document:
   - Map to unified schema
   - If `_id` already exists in `products` (conflict): log conflict, overwrite with gallery version
4. Assert count(`products`) === N1 + N2 - conflicts
5. Log summary

---

### CORS Update in `server.js`

Add the surgical frontend production domain to the existing `allowedOrigins` array:

```javascript
const allowedOrigins = [
  'https://nexlife-admin.vercel.app',
  'https://www.nexlifeinternational.com',
  'https://nexlifeinternational.com',
  'https://nexlife-surgical.vercel.app',   // ← add surgical frontend domain
  'https://nexlife.vercel.app',
  'https://nexlife-api.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:4000',
  'http://localhost:4001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
```

Remove hardcoded Cloudinary credentials — move to environment variables only.

---

### Consistent Error Responses

All error responses must conform to:
```json
{ "error": "<message>", "code": "<optional string>" }
```

No route may return a plain-text or HTML error for 4xx/5xx. Implement a global error handler in `server.js`:

```javascript
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});
```

---

## Frontend Design (`nexlife-surgical`)

### New Files to Create

```
nexlife-surgical/
  lib/
    api.ts                    ← NEW: centralized API client
    hooks/
      useProducts.ts          ← NEW: SWR hook for products
      useCategories.ts        ← NEW: SWR hook for categories
      useFeaturedProducts.ts  ← NEW: SWR hook for featured products
      useStarredProducts.ts   ← NEW: SWR hook for starred products
    types/
      product.ts              ← NEW: shared TypeScript types
  context/
    SiteContext.tsx           ← NEW: site context provider (surgical/general)
```

### `lib/api.ts` — Centralized API Client

```typescript
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BACKEND_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    next: { revalidate: 60 },  // 60-second stale time (Next.js cache)
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || res.statusText);
  }
  return res.json();
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
```

No other file constructs `BACKEND_URL` directly — this is the single source of truth.

### `context/SiteContext.tsx` — Site Context Provider

Reads `?site=` from the URL on mount. Provides `site` (`'surgical' | 'general'`), `setSite`, and persists the value in the URL query parameter.

```typescript
type Site = 'surgical' | 'general';

interface SiteContextValue {
  site: Site;
  setSite: (site: Site) => void;
}
```

- On mount: reads `new URLSearchParams(window.location.search).get('site')` — defaults to `process.env.NEXT_PUBLIC_SITE_NAME || 'surgical'`
- On `setSite`: calls `router.push` with `?site=<value>`, triggering a URL update and re-render
- Wrapped in `app/layout.tsx` so all pages share the same context

### Updated `components/Navbar.tsx`

Changes from current implementation:
1. Remove `import { featuredProducts } from "@/lib/data/products"` 
2. Remove hardcoded `navLinks` children array for product categories
3. Add `useSiteContext()` hook to read active site
4. Fetch categories dynamically: `useCategories(site)` → renders category links in dropdown
5. Fetch featured products: `useFeaturedProducts(site)` → renders Popular column in dropdown
6. Add "Surgical" button:
   - When `site === 'surgical'`: render with active highlight (filled background, distinct color)
   - When `site === 'general'`: render as outlined/muted button
   - On click: call `setSite('surgical')` or `setSite('general')` to toggle

```tsx
// Surgical toggle button in Navbar desktop section
<button
  onClick={() => setSite(site === 'surgical' ? 'general' : 'surgical')}
  className={`px-4 py-2 text-sm rounded border transition-colors ${
    site === 'surgical'
      ? 'bg-[#0A8A78] text-white border-[#0A8A78]'
      : 'text-slate-600 border-slate-300 hover:border-[#0A8A78]'
  }`}
>
  Surgical
</button>
```

### Page Updates

Each page that currently imports from `lib/data/products.ts` is updated to use the API client:

**`app/page.tsx` (Homepage):**
- Fetch `GET /api/v2/products/featured?site=<site>` → Featured Products section
- Fetch `GET /api/v2/products/starred?site=<site>` → "Featured / Order" section
- Both fetches use `useFeaturedProducts(site)` and `useStarredProducts(site)` hooks
- Error state: show "Unable to load products. Please try again." banner
- Empty state: hide section heading if array is empty

**`app/products/page.tsx`:**
- Fetch `GET /api/v2/products?site=<site>&category=<cat>` (client-side with SWR)
- Category filter reads from URL `?category=` param
- Error state: render error card with retry button
- Loading state: skeleton cards

**`app/product/[slug]/page.tsx`:**
- Slug is the MongoDB `_id` (or a generated slug stored on the document — see below)
- Fetch `GET /api/v2/products/<id>`
- If API returns 404, render Next.js `notFound()`
- Render `fields` array (visible only), conditionally render price section

**`app/contact/page.tsx`:**
- Submit to `POST /api/contact` (existing endpoint — no change)

### Environment Variables

**`nexlife-surgical/.env.local`:**
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_SITE_NAME=surgical
```

**`nexlife-surgical/.env.production`:**
```
NEXT_PUBLIC_BACKEND_URL=https://nexlife-api.vercel.app
NEXT_PUBLIC_SITE_NAME=surgical
```

---

## CRM Design (`adminPanel/admin-panel`)

### New Pages / Sections

The CRM gains a new top-level section: **Product Manager** (`/admin/products`), which contains:

```
/admin/products                  → Product list (all, grouped by category, filterable by site)
/admin/products/new              → Create product form
/admin/products/[id]/edit        → Edit product form
/admin/products/categories       → Category management
/admin/products/featured         → Featured products management
/admin/products/starred          → Starred products management
```

These are added to the existing sidebar navigation in `src/app/admin/layout.tsx`.

### Site Context Selector in CRM

A persistent selector (tabs or dropdown) appears in the Product Manager header:

```tsx
// Tabs: Surgical | General | Both | All
<Tabs value={siteFilter} onValueChange={setSiteFilter}>
  <TabsList>
    <TabsTrigger value="surgical">Surgical</TabsTrigger>
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="both">Both</TabsTrigger>
    <TabsTrigger value="all">All</TabsTrigger>
  </TabsList>
</Tabs>
```

This filters the product list displayed in CRM and scopes product counts.

### Product List View (`/admin/products`)

- Grouped by category (accordion or section headers)
- Per-product row controls:
  - **Edit** → `/admin/products/[id]/edit`
  - **Delete** → Confirm dialog → `DELETE /api/v2/products/:id`
  - **Live/Hidden badge** → Toggle `PATCH /api/v2/products/:id/visibility`
  - **Star icon** → Toggle `PATCH /api/v2/products/:id/starred`
  - **Featured toggle** → Toggle `PATCH /api/v2/products/:id/featured`
  - **Drag handle** → Reorder via `POST /api/v2/products/reorder`
- "Live" badge: green, "Hidden" badge: grey/red
- Badge updates within same render cycle (optimistic update then API confirm)

### Product Create/Edit Form

Fields:
| Field | Input Type | Notes |
|-------|-----------|-------|
| Name | text | required, max 200 |
| Category | select | populated from `GET /api/v2/categories/admin/all` |
| Site | select | Surgical / General / Both, required |
| Images | file input | JPEG/PNG/WEBP/GIF, max 10 MB each, max 10 files |
| Price | text | optional |
| Price Unit | text | optional |
| Show Price | toggle | inverts `hidePrice` |
| Fields | dynamic list | key/value rows, each with `hidden` toggle, add/remove buttons |
| Featured | toggle | |
| Starred | toggle | |
| Visible | toggle | default on |

**Image upload flow:**
1. Admin selects file(s) in the `<FileUpload>` component (already exists in CRM)
2. On form submit: `POST /api/v2/products` with `multipart/form-data`
3. Backend uploads to Cloudinary `nexlife-products/` folder and stores metadata
4. On edit with new image: `PATCH /api/v2/products/:id` — backend deletes old Cloudinary image first

**Dynamic fields UI:**
```tsx
// Fields array managed with useState
const [fields, setFields] = useState<DynamicField[]>([]);

// Add row
<Button onClick={() => setFields([...fields, { key: '', value: '', hidden: false }])}>
  + Add Field
</Button>

// Row
{fields.map((field, i) => (
  <div key={i} className="flex gap-2 items-center">
    <Input placeholder="Key" value={field.key} onChange={...} />
    <Input placeholder="Value" value={field.value} onChange={...} />
    <Toggle checked={!field.hidden} label="Visible" onChange={...} />
    <Button onClick={() => removeField(i)}>Remove</Button>
  </div>
))}
```

### Category Management View (`/admin/products/categories`)

- List of categories with: name, siteContext, product count, visible toggle, sequence, edit/delete controls
- **Create**: name + siteContext select → `POST /api/v2/categories`
- **Rename**: inline edit → `PATCH /api/v2/categories/:id`
- **Delete**: if products exist → confirm dialog with "Reassign to" dropdown or "Delete all products" checkbox → `DELETE /api/v2/categories/:id` with `{ moveTo }` or `{ deleteProducts: true }`
- **Reorder**: drag-and-drop or number inputs → `POST /api/v2/categories/reorder`
- **Visibility toggle**: → `PATCH /api/v2/categories/:id/visibility`

### Featured Products View (`/admin/products/featured`)

- Grid of cards showing all `isFeatured=true` products
- Per-card: unstar featured toggle, reorder handle, link to edit
- Reorder: `POST /api/v2/products/reorder`

### Starred Products View (`/admin/products/starred`)

- Grid of cards showing all `isStarred=true` products
- Per-card: unstar toggle, reorder handle, link to edit

### Unread Badge Polling

The existing unread badge polling in the CRM sidebar (already polls `/api/inquiries`) continues at ≤15 second interval. No change needed — the backend `inquiries` route is unchanged.

### CRM `lib/api.ts` — No Change Required

The existing `api.ts` in the CRM already reads `NEXT_PUBLIC_BACKEND_URL` and attaches JWT from localStorage. New product/category endpoints are called through this same client.

---

## File Changes Summary

### Backend (`backend/`)

| File | Action |
|------|--------|
| `routes/products.js` | **CREATE** — unified product CRUD + public endpoints |
| `routes/categories.js` | **CREATE** — unified category CRUD |
| `migrate-products.js` | **CREATE** — one-time migration script |
| `server.js` | **MODIFY** — mount new routers, fix hardcoded Cloudinary secrets, add global error handler |
| `db.js` | **MODIFY** — add `products` and `categories` to `getCollections()` |
| `routes/home-products.js` | **KEEP** (deprecated after migration verified) |
| `routes/products-gallery.js` | **KEEP** (deprecated after migration verified) |

### Frontend (`nexlife-surgical/`)

| File | Action |
|------|--------|
| `lib/api.ts` | **CREATE** — centralized API client |
| `lib/types/product.ts` | **CREATE** — TypeScript interfaces |
| `lib/hooks/useProducts.ts` | **CREATE** — SWR hook |
| `lib/hooks/useCategories.ts` | **CREATE** — SWR hook |
| `lib/hooks/useFeaturedProducts.ts` | **CREATE** — SWR hook |
| `lib/hooks/useStarredProducts.ts` | **CREATE** — SWR hook |
| `lib/context/SiteContext.tsx` | **CREATE** — site context provider |
| `components/Navbar.tsx` | **MODIFY** — remove static data imports, add Surgical button, dynamic categories |
| `app/layout.tsx` | **MODIFY** — wrap with `SiteContextProvider` |
| `app/page.tsx` | **MODIFY** — fetch featured + starred from API |
| `app/products/page.tsx` | **MODIFY** — fetch products from API with site/category filter |
| `app/product/[slug]/page.tsx` | **MODIFY** — fetch single product from API |
| `lib/data/products.ts` | **DELETE** after all page migrations are complete |
| `.env.local` | **CREATE** — `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_SITE_NAME` |
| `.env.production` | **CREATE** — production values |

### CRM (`adminPanel/admin-panel/`)

| File | Action |
|------|--------|
| `src/app/admin/products/page.tsx` | **CREATE** — product list |
| `src/app/admin/products/new/page.tsx` | **CREATE** — create form |
| `src/app/admin/products/[id]/edit/page.tsx` | **CREATE** — edit form |
| `src/app/admin/products/categories/page.tsx` | **CREATE** — category management |
| `src/app/admin/products/featured/page.tsx` | **CREATE** — featured management |
| `src/app/admin/products/starred/page.tsx` | **CREATE** — starred management |
| `src/app/admin/layout.tsx` | **MODIFY** — add Product Manager nav item |
| `src/app/admin/home-products/` | **KEEP** during migration, remove after |
| `src/app/admin/products-gallery/` | **KEEP** during migration, remove after |

---

## Component Interactions

### Site Context Flow

```
URL: ?site=surgical
        │
        ▼
SiteContextProvider (app/layout.tsx)
  reads URL param → sets site='surgical'
        │
        ├── Navbar reads site → highlights "Surgical" button
        │                     → fetches categories?site=surgical
        │
        ├── app/page.tsx reads site
        │     → useStarredProducts('surgical') → GET /api/v2/products/starred?site=surgical
        │     → useFeaturedProducts('surgical') → GET /api/v2/products/featured?site=surgical
        │
        └── app/products/page.tsx reads site
              → useProducts({ site: 'surgical', category }) → GET /api/v2/products?site=surgical
```

### Product Creation Flow

```
CRM Admin
  fills form → POST /api/v2/products (multipart/form-data)
        │
        ▼
Backend (routes/products.js)
  validates name + category
  uploads image → Cloudinary (nexlife-products/ folder)
  stores { secure_url, public_id, ... } in images[]
  inserts product document into products collection
        │
        ▼
MongoDB products collection
        │
        ▼ (next frontend fetch after 60s stale)
Frontend
  re-fetches → renders updated product data
```

### Visibility Toggle Flow

```
CRM Admin clicks "Hidden" badge on product
        │
        ▼
PATCH /api/v2/products/:id/visibility
  → Backend flips visible flag
  → Returns { visible: false }
        │
        ▼
CRM optimistic update → badge changes to "Hidden" immediately
        │
        ▼ (within 60s)
Frontend
  next fetch → product excluded from public API → product disappears from site
```

---

## Key Implementation Notes

### Slug vs ObjectId

The current static products use slugs (e.g., `sterile-surgical-gloves-latex`). The unified schema uses MongoDB `_id` as the primary key. To preserve clean URLs, the product document stores a `slug` field generated from the name on creation (`slugify(name)`). The frontend `app/product/[slug]/page.tsx` fetches `GET /api/v2/products?slug=<slug>` or we store `slug` on the document and query by it. If no slug exists, fall back to `_id`.

### Image Array vs Single Image

The existing `homeProducts` documents store a single `image` object. The unified schema uses an `images` array (max 10). On migration, `image` is wrapped in `[image]`. The frontend renders `images[0]` as the primary image and the rest as a carousel.

### Price Field Handling

The existing `homeProducts` schema has no `price` field. For migrated documents, `price` and `priceUnit` are undefined. The frontend already conditionally renders price sections — this remains correct.

### `swr` Package for Frontend Caching

The frontend uses `swr` (already a common Next.js dependency) for client-side data fetching with the 60-second stale time:

```typescript
import useSWR from 'swr';
import { apiFetch } from '@/lib/api';

export function useFeaturedProducts(site: string) {
  return useSWR(
    `/api/v2/products/featured?site=${site}`,
    (url) => apiFetch(url),
    { refreshInterval: 60_000, revalidateOnFocus: false }
  );
}
```

For server-rendered pages (homepage), Next.js `fetch` with `{ next: { revalidate: 60 } }` is used instead of SWR, providing ISR-level caching.

### JWT Storage

The CRM stores JWT in `localStorage` (existing pattern in `src/lib/api.ts`). No change. The frontend does not require authentication — it only calls public endpoints.

### Role Enforcement

The existing `requireAuth` middleware in `routes/auth.js` is reused as-is. The new product routes call:
```javascript
router.post('/', requireAuth(['superadmin', 'dev']), ...)
router.patch('/:id', requireAuth(['superadmin', 'dev']), ...)
router.delete('/:id', requireAuth(['superadmin', 'dev']), ...)
```

Public GET routes do not call `requireAuth`.

---

## Migration Execution Order

1. **Deploy updated backend** with new routes + `products`/`categories` collections (existing collections untouched)
2. **Run migration script** `node migrate-products.js` — verifies counts before and after
3. **Deploy updated CRM** pointing to `/api/v2/products`
4. **Deploy updated frontend** with `lib/api.ts` and new pages
5. **Verify** all data flows correctly in staging
6. **Deprecate** `home-products.js` and `products-gallery.js` routes
7. **Remove** `lib/data/products.ts` from frontend
8. **Remove** legacy CRM pages (`home-products/`, `products-gallery/`)


---

## Error Handling

| Layer | Scenario | Behaviour |
|-------|----------|-----------|
| Backend API | Missing JWT | HTTP 401 `{ "error": "Authentication required" }` |
| Backend API | Expired/invalid JWT | HTTP 401 `{ "error": "Token invalid or expired" }` |
| Backend API | Insufficient role | HTTP 403 `{ "error": "Insufficient permissions" }` |
| Backend API | Missing required field | HTTP 400 `{ "error": "name is required" }` (or similar) |
| Backend API | Invalid siteContext value | HTTP 400 `{ "error": "Invalid siteContext value" }` |
| Backend API | Duplicate category name | HTTP 409 `{ "error": "Category already exists" }` |
| Backend API | Delete category with products | HTTP 409 `{ "error": "...", "count": N }` |
| Backend API | Resource not found | HTTP 404 `{ "error": "Not found" }` |
| Backend API | Cloudinary upload fails | Return error response; do NOT create/modify product document |
| Backend API | Cloudinary delete fails on replace | Return error response; do NOT upload replacement |
| Backend API | SMTP send fails on reply | Return error response; do NOT mark inquiry as 'replied' |
| Backend API | Admin notification email fails | Log failure; still return HTTP 201 and store inquiry |
| Backend API | Category rename DB failure | Roll back product category updates; return HTTP 500 |
| Frontend | API request times out (>10s) | Show visible error message; do not render blank page |
| Frontend | API returns 4xx/5xx | Show non-empty user-facing error message |
| Frontend | API returns HTTP 401 | Navigate to error page; clear any stored session state |
| Frontend | Site context re-fetch fails | Show error message; retain previously displayed content |
| Frontend | Empty product list | Render empty-state message ("No products found") |
| CRM | Toggle request fails | Show error toast; revert toggle to previous state in same render cycle |
| CRM | JWT expires during session | Clear JWT from localStorage; redirect to login page |

All Backend API error responses conform to `{ "error": "<message>", "code": "<optional>" }`. No 4xx/5xx response returns plain text or HTML.

---

## Correctness Properties

### Property 1: Visibility consistency
A product with `visible=false` must never appear in any public API response. A category with `visible=false` must cause all its products to be excluded from public responses even if those products have `visible=true`.

**Validates: Requirements 12.2, 12.3**

### Property 2: Price field isolation
When `hidePrice=true`, the fields `price` and `priceUnit` must be absent from the API response object — not null or empty string, but truly absent. The frontend checks for field presence, not falsy values.

**Validates: Requirements 6.2, 6.3**

### Property 3: Dynamic field isolation
Hidden dynamic fields (`hidden=true`) must be absent from public API responses. The frontend renders only what the API returns — it does not filter client-side.

**Validates: Requirements 6.6, 6.8**

### Property 4: siteContext filtering correctness
`site=surgical` returns documents with `siteContext IN ['surgical', 'both']`. `site=general` returns `siteContext IN ['general', 'both']`. Omitting `site` defaults to the same as `site=surgical`. A product with `siteContext='general'` must not appear in a `site=surgical` response.

**Validates: Requirements 9.2, 9.3**

### Property 5: Image replacement atomicity
Replacing a product image must follow the order: (1) delete old from Cloudinary, (2) upload new to Cloudinary, (3) update MongoDB document. If step 1 fails, steps 2 and 3 must not execute. If step 2 fails, step 3 must not execute.

**Validates: Requirements 5.4, 5.5**

### Property 6: Category rename cascade
After a successful rename, every product previously in the old category must have its `category` field set to the new name. No product should remain referencing the old category name.

**Validates: Requirements 3.7**

### Property 7: 60-second cache contract
A frontend page load that occurs within 60 seconds of a previous successful response for the same endpoint must not issue a new network request. A load occurring after the 60-second window must re-fetch.

**Validates: Requirements 1.4, 1.5**

### Property 8: Starred and featured deletion consistency
After a product is deleted, it must not appear in `GET /api/v2/products/starred` or `GET /api/v2/products/featured` responses.

**Validates: Requirements 7.6**

---

## Testing Strategy

- **Backend route tests**: Use a test MongoDB instance (e.g., `mongodb-memory-server`) to test each route handler in isolation. Cover: validation (missing fields, invalid enum), authentication (missing JWT, wrong role), Cloudinary mock (success, upload failure, delete failure), and correct filtering (siteContext, visibility, hidePrice, hidden fields).

- **Migration script tests**: Run against a seeded in-memory database with known document counts; assert output count equals sum of inputs minus conflicts; assert all source fields are present with original values in output.

- **Frontend hook tests**: Mock `lib/api.ts` with `jest.mock`; test that each hook exposes `data`, `error`, and `isLoading`; test that a 60-second SWR stale time is configured; test that a 401 response triggers the error handler.

- **SiteContext tests**: Test that `setSite('surgical')` updates `router.push` call with `?site=surgical`; test that initial site is read from URL param; test fallback to `NEXT_PUBLIC_SITE_NAME`, then to `'surgical'`.

- **CRM toggle optimism tests**: Test that a toggle UI element updates immediately on click (before API response) and reverts on API error.

- **End-to-end smoke tests**: After deployment, hit each public endpoint (`/api/v2/products`, `/api/v2/products/starred`, `/api/v2/products/featured`, `/api/v2/categories`) with and without `?site=` param; verify CORS headers; verify error response shape for a known-bad request.
