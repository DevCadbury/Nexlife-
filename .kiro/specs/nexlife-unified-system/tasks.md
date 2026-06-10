# Implementation Plan: Nexlife Unified System

## Overview

This plan implements the Nexlife Unified System across three applications — `backend` (Node.js/Express), `nexlife-surgical` (Frontend), and `adminPanel/admin-panel` (CRM). Tasks are ordered so schema/migration work comes first, then backend API routes, then frontend integration, then CRM UI, and finally cleanup.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1"] },
    { "wave": 2, "tasks": ["2", "3"] },
    { "wave": 3, "tasks": ["4"] },
    { "wave": 4, "tasks": ["5"] },
    { "wave": 5, "tasks": ["6"] },
    { "wave": 6, "tasks": ["7", "8"] },
    { "wave": 7, "tasks": ["9", "10"] },
    { "wave": 8, "tasks": ["11"] }
  ]
}
```

## Tasks

- [x] 1. Backend: Unified Product Schema and Migration
  - [x] 1.1 Define unified `products` MongoDB collection and update db.js
    - Add `products` and `categories` collections to `backend/db.js` `getCollections()` function so all routes can access them
    - Document the expected product schema in a comment: name (max 255, required), category (string, required), siteContext (enum: surgical|general|both, default 'surgical'), images[] ({secure_url, public_id, format, bytes, width, height}), visible (boolean, default true), hidePrice (boolean, default false), isFeatured (boolean, default false), isStarred (boolean, default false), sequence (number), price (string, optional), priceUnit (string, optional), fields[] ({key, value, hidden}), createdAt, updatedAt
    - Create MongoDB indexes: siteContext, category, visible, isStarred, isFeatured, sequence (to support efficient filtering and sorting)
    - Requirements: #2

  - [x] 1.2 Define `categories` collection and indexes
    - Add categories collection definition to `backend/db.js`
    - Document schema: name (max 100, required), siteContext (enum: surgical|general|both, required), visible (boolean, default true), sequence (number), createdAt, updatedAt
    - Create a unique compound index on (name, siteContext) to enforce no duplicate category names per site context
    - Requirements: #3

  - [x] 1.3 Write product migration script
    - Create `backend/migrate-products.js` as a standalone Node.js script
    - Read all documents from existing `homeProducts` and `productsGallery` collections; count them (N1 and N2) before writing
    - Map `homeProducts` documents: wrap `image` → `images[0]`, map `labels` → `fields`, set `siteContext='surgical'`, set `hidePrice` from `hideLabels` flag (if true, set all fields' `hidden=true`), set all other unified fields
    - Map `productsGallery` documents to unified schema with appropriate siteContext
    - On duplicate `_id` in both collections: use `productsGallery` version and log conflict notice to console identifying the duplicate ID
    - Support `--dry-run` flag: print summary (would insert N, conflicts M) without writing; without flag, execute writes and assert count(products) equals N1+N2-conflicts
    - Requirements: #2

- [x] 2. Backend: Categories API (v2)
  - [x] 2.1 Implement public GET and admin POST categories routes
    - Create `backend/routes/categories.js`
    - `GET /api/v2/categories` — public; accept optional `?site=surgical|general` query param; return categories where visible=true sorted by sequence ascending; if site param invalid → HTTP 400 `{ "error": "Invalid site value" }`
    - `GET /api/v2/categories/admin/all` — requireAuth(superadmin|dev); return all categories including hidden
    - `POST /api/v2/categories` — requireAuth(superadmin|dev); validate name (non-empty, max 100 chars) and siteContext (required, valid enum); duplicate name+siteContext → HTTP 409 `{ "error": "Category already exists" }`; on success return HTTP 201 with created document
    - Mount router in `server.js` at `/api/v2/categories` exactly once
    - Requirements: #3, #9, #13, #15

  - [x] 2.2 Implement category rename, delete, reorder, and visibility routes
    - `PATCH /api/v2/categories/:id` — requireAuth(superadmin|dev); rename category name; cascade-update `category` field on all products in a bulkWrite; on partial failure rollback with updateMany reverting changes and return HTTP 500; duplicate name under same siteContext → HTTP 409
    - `DELETE /api/v2/categories/:id` — requireAuth(superadmin|dev); if products exist → HTTP 409 `{ "error": "...", "count": N }`; if no products → delete and return HTTP 200; accept optional `?moveTo=<id>` to reassign or `?deleteProducts=true` to bulk delete
    - `PATCH /api/v2/categories/:id/visibility` — requireAuth; toggle visible flag; return `{ visible: <newValue> }`
    - `POST /api/v2/categories/reorder` — requireAuth; accept `[{ id, sequence }]`; empty/malformed body → HTTP 400; update each category's sequence field
    - Requirements: #3, #15

- [x] 3. Backend: Products API (v2) — Core CRUD
  - [x] 3.1 Implement public product listing and single-product GET
    - Create `backend/routes/products.js`
    - `GET /api/v2/products` — public; accept `?site=surgical|general` (default: surgical|both), `?category=`, `?page=`, `?limit=50`; filter visible=true and category.visible=true (join with categories collection); strip `price`/`priceUnit` when `hidePrice=true`; strip `fields` items where `hidden=true`; sort by sequence ascending; invalid `site` value → HTTP 400
    - `GET /api/v2/products/:id` — public; return product if visible=true; return HTTP 404 if not found or visible=false for unauthenticated callers
    - Mount router in `server.js` at `/api/v2/products` exactly once; keep existing `/api/home-products` and `/api/products-gallery` routes functional
    - Requirements: #1, #2, #6, #9, #12, #13

  - [x] 3.2 Implement create and update product routes
    - `POST /api/v2/products` — requireAuth(superadmin|dev); validate: name required → HTTP 400 "name is required", category required → HTTP 400 "category is required"; siteContext defaults to 'surgical' if omitted; invalid siteContext → HTTP 400; accept multipart/form-data with image file(s)
    - `PATCH /api/v2/products/:id` — requireAuth; accept partial updates for any combination of fields; non-existent ID → HTTP 404; return updated document on success
    - Requirements: #2, #4, #15

  - [x] 3.3 Implement delete, visibility, and bulk reorder routes
    - `DELETE /api/v2/products/:id` — requireAuth; attempt Cloudinary deletion of all images[] entries (log failures but do not block); remove MongoDB document; non-existent ID → HTTP 404; return HTTP 200 on success
    - `PATCH /api/v2/products/:id/visibility` — requireAuth; toggle visible flag
    - `PATCH /api/v2/products/:id/featured` — requireAuth; toggle isFeatured flag
    - `PATCH /api/v2/products/:id/starred` — requireAuth; toggle isStarred flag
    - `POST /api/v2/products/reorder` — requireAuth; accept `[{ id, sequence }]`; empty/malformed → HTTP 400; bulkWrite sequence updates
    - Requirements: #4, #7, #8, #12, #15

  - [x] 3.4 Implement starred and featured public endpoints
    - `GET /api/v2/products/starred` — public; return products where isStarred=true AND visible=true; apply `?site=` filter (default: surgical|both); sort by sequence ascending
    - `GET /api/v2/products/featured` — public; return products where isFeatured=true AND visible=true; apply `?site=` filter; sort by sequence ascending
    - Both endpoints return `{ items: [], total: 0 }` shape (never null/undefined); empty array is a valid response
    - Requirements: #7, #8, #9

- [x] 4. Backend: Cloudinary Middleware, Auth Hardening, and CORS
  - [x] 4.1 Create Cloudinary upload/delete middleware
    - Create `backend/middleware/cloudinary.js` exporting `uploadImage(fileBuffer, mimetype)` and `deleteImage(publicId)`
    - `uploadImage`: upload to Cloudinary folder `nexlife-products/`; transformation: quality=auto, crop=limit width=800 height=800 (preserves aspect ratio); return `{ secure_url, public_id, format, bytes, width, height }`; if upload fails throw an error (caller returns error response, does NOT create/modify product)
    - `deleteImage`: call `cloudinary.uploader.destroy(publicId)`; return `{ success: true }` or throw error on failure
    - Accept only MIME types: image/jpeg, image/png, image/webp, image/gif; max 10 MB per file; max 10 images per product; reject with HTTP 400 for invalid file type/size
    - Requirements: #5

  - [x] 4.2 Integrate image upload into product routes and harden requireAuth middleware
    - Wire multer + uploadImage middleware into `POST /api/v2/products` and `PATCH /api/v2/products/:id` when files are included
    - When replacing an image (PATCH with new file + existing public_id): call deleteImage first; if deleteImage fails return error response and do NOT upload new image or modify product document
    - Update `requireAuth` middleware in `backend/routes/auth.js` to return explicit messages: missing JWT → HTTP 401 `{ "error": "Authentication required" }`; expired/invalid JWT → HTTP 401 `{ "error": "Token invalid or expired" }`; wrong role → HTTP 403 `{ "error": "Insufficient permissions" }`
    - Move all hardcoded Cloudinary credentials in `server.js` to read exclusively from environment variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
    - Requirements: #4, #5, #14, #15

  - [x] 4.3 Configure CORS and standardize error response format
    - Update `server.js` CORS `allowedOrigins` array to include the surgical frontend production domain (e.g. `https://nexlife-surgical.vercel.app`) alongside the existing entries; keep localhost:3000 and localhost:3001
    - Add a global Express error handler (4 arguments) at the bottom of `server.js` that returns `{ "error": "<message>" }` JSON for all unhandled errors — no plain text or HTML error responses for 4xx/5xx
    - Verify `server.js` mounts `/api/v2/products` and `/api/v2/categories` exactly once each with no duplicate `app.use` registrations
    - Requirements: #13

- [x] 5. Backend: Inquiries and Email
  - [x] 5.1 Update inquiry creation to store with status and send emails
    - In `backend/routes/inquiries.js`: on POST (new inquiry submission from frontend), store document with `status: 'new'`, assign a unique reference ID (e.g., `NXL-<timestamp>`), and set `createdAt`
    - Send admin notification email to configured `CONTACT_TO` env var; if email send fails → log failure, still return HTTP 201 with the stored document
    - Send customer confirmation email to submitted email address including: customer name, reference ID, and link to product catalogue page
    - Requirements: #11

  - [x] 5.2 Implement inquiry reply, status update, and delete routes
    - `POST /api/inquiries/:id/reply` — requireAuth(superadmin|dev); send reply email via SMTP to customer's stored email; if SMTP send fails → return error response and do NOT update inquiry status to 'replied'; on success mark status='replied' and store reply in thread array
    - `PATCH /api/inquiries/:id/status` — requireAuth; accept `{ status: 'read' | 'replied' }`; update status on document
    - `DELETE /api/inquiries/:id` — requireAuth(superadmin only); permanently delete document; return HTTP 200
    - `GET /api/inquiries` — requireAuth; return all inquiries sorted by createdAt descending; include status badge data
    - Requirements: #11, #15

- [x] 6. Frontend: Centralized API Client and Site Context
  - [x] 6.1 Create `lib/api.ts` centralized API client
    - Create `nexlife-surgical/lib/api.ts` — construct all Backend_API URLs using `process.env.NEXT_PUBLIC_BACKEND_URL`; no other file may construct the backend base URL directly
    - Export typed async functions: `getProducts(params?)`, `getCategories(site?)`, `getFeaturedProducts(site?)`, `getStarredProducts(site?)`, `getProductById(id)`, `submitInquiry(data)`
    - All fetches use Next.js `{ next: { revalidate: 60 } }` cache option for 60-second stale time on server-rendered calls
    - Export `ApiError` class carrying HTTP status; when status is 401 callers must navigate to an error page and NOT silently discard the response
    - Create `nexlife-surgical/.env.local` with `NEXT_PUBLIC_BACKEND_URL=http://localhost:4000` and `NEXT_PUBLIC_SITE_NAME=surgical`
    - Requirements: #1, #13, #14

  - [x] 6.2 Create SiteContext provider and data-fetching hooks
    - Create `nexlife-surgical/lib/context/SiteContext.tsx` — on mount reads `?site=` from URL; falls back to `NEXT_PUBLIC_SITE_NAME`; defaults to `'surgical'`; exposes `{ site, setSite }`; `setSite` calls `router.push` with updated `?site=` param
    - Wrap `nexlife-surgical/app/layout.tsx` with `SiteContextProvider` so all pages share the context
    - Create hooks in `nexlife-surgical/lib/hooks/`: `useProducts(site)`, `useCategories(site)`, `useFeaturedProducts(site)`, `useStarredProducts(site)` — each calls corresponding `lib/api.ts` function; uses SWR with `refreshInterval: 60000`; returns `{ data, error, isLoading }` shape
    - Each hook's `error` state is non-null (non-empty) when the API returns any error or times out
    - Requirements: #1, #9, #10, #14

- [x] 7. Frontend: Pages and Navbar Updates
  - [x] 7.1 Update homepage to use API data for featured and starred sections
    - Update `nexlife-surgical/app/page.tsx`: replace any static data imports with `useFeaturedProducts(site)` and `useStarredProducts(site)` hooks using the active site from `SiteContext`
    - "Featured Products" section: render results from featured endpoint; if empty → hide section or show empty-state message; no broken/empty layout elements
    - "Featured / Order" section: render results from starred endpoint; if empty → show visible empty-state message; if error → show non-empty error message; do NOT throw unhandled exception
    - Requirements: #1, #7, #8

  - [x] 7.2 Update products catalogue page to consume API data
    - Update `nexlife-surgical/app/products/page.tsx`: fetch via `useProducts(site)` using active site context; read `?category=` URL param to pass as filter
    - Remove all imports of `lib/data/products.ts` from this file; replace with API-driven data
    - On empty list: render empty-state message ("No products found"); on API error: render visible error message ("Unable to load products. Please try again."); do NOT render blank page
    - Render only `fields` items present in API response in order returned; do NOT render price section when product lacks `price` and `priceUnit` fields
    - Update `nexlife-surgical/app/product/[slug]/page.tsx` similarly: fetch single product from API by ID or slug; render `notFound()` on 404
    - Requirements: #1, #6, #14

  - [x] 7.3 Update Navbar with dynamic categories and Surgical toggle button
    - Update `nexlife-surgical/components/Navbar.tsx`: remove `import { featuredProducts } from "@/lib/data/products"` and the hardcoded `navLinks` children array for product categories
    - Fetch categories via `useCategories(site)` — populate the Products dropdown with API-returned category list; no hardcoded category arrays
    - Add "Surgical" control button to the desktop nav and mobile drawer; label must be exactly the text "Surgical"
    - When "Surgical" activated: call `setSite('surgical')`, which updates URL to `?site=surgical` and triggers re-fetch of catalogue/categories/featured sections
    - WHILE site=surgical is active: render "Surgical" button in visually distinct state (e.g., filled background color different from inactive state)
    - When re-fetch fails after context switch: display error message and retain previously displayed content
    - Requirements: #10, #14

  - [x] 7.4 Delete static data file and finalize environment config
    - Delete `nexlife-surgical/lib/data/products.ts` after confirming zero imports remain
    - Confirm no other frontend file constructs `NEXT_PUBLIC_BACKEND_URL` base URLs directly — only `lib/api.ts` may do this
    - Ensure `nexlife-surgical/.env.local` has both `NEXT_PUBLIC_BACKEND_URL` and `NEXT_PUBLIC_SITE_NAME`; create `nexlife-surgical/.env.production` with production values placeholder
    - Requirements: #1, #13, #14

- [x] 8. CRM: Product and Category Management Pages
  - [x] 8.1 Build Category Management page
    - Create `adminPanel/admin-panel/src/app/admin/products/categories/page.tsx`
    - Restrict page to superadmin and dev roles; redirect unauthorized users
    - Render list of categories sorted by sequence; each row shows: name, siteContext, product count, visible toggle, sequence number, rename button, delete button
    - Create category form: name input (max 100 chars) + siteContext selector (required) → POST /api/v2/categories; HTTP 409 duplicate → display error message
    - Rename inline: on submit → PATCH /api/v2/categories/:id; on rollback failure → show error
    - Delete: if HTTP 409 with count → show confirmation dialog with options: "Reassign to category" (dropdown) or "Delete all products" checkbox → retry DELETE with moveTo or deleteProducts param
    - Reorder: drag handles or sequence number inputs → POST /api/v2/categories/reorder
    - Requirements: #3, #12, #15

  - [x] 8.2 Build Product List page with inline controls
    - Create `adminPanel/admin-panel/src/app/admin/products/page.tsx`
    - Display all products grouped by category; each product row includes: name, siteContext badge, "Live" (green) / "Hidden" (grey/red) visibility badge, isFeatured toggle, isStarred toggle, hidePrice toggle, edit link, delete button
    - Visibility badge updates within one render cycle of toggle action completing (optimistic update then confirm/revert on API response)
    - When any toggle fails: show error toast and revert the toggle to previous state
    - Site context selector (tabs: Surgical / General / Both / All) at page top; filters displayed product list; shows scoped product count per selected context
    - Drag-to-reorder within category groups → POST /api/v2/products/reorder
    - Add "Product Manager" link to CRM admin sidebar in `src/app/admin/layout.tsx`
    - Requirements: #4, #6, #7, #8, #9, #12

  - [x] 8.3 Build Product Create and Edit forms
    - Create `adminPanel/admin-panel/src/app/admin/products/new/page.tsx` and `src/app/admin/products/[id]/edit/page.tsx`
    - Form fields: name (required, max 200), category (dropdown populated from GET /api/v2/categories/admin/all), siteContext (required select — Surgical/General/Both; block submission if empty), price, priceUnit, isFeatured toggle, isStarred toggle, visible toggle
    - Image upload: file input accepting JPEG/PNG/WEBP/GIF only, max 10 MB per file, max 10 files; reject invalid file type/size with visible error message before submission
    - Dynamic Fields section: list of key/value rows with per-row hidden toggle; "Add Field" button appends a new row; "Remove" button removes a row; client-side validation: key 1–100 chars, value 1–500 chars
    - On successful create → redirect to product list; on error → display inline error message
    - Requirements: #4, #5, #6

  - [x] 8.4 Build Starred and Featured Products management views
    - Create `adminPanel/admin-panel/src/app/admin/products/starred/page.tsx` — list all isStarred=true products as cards; per card: name, image thumbnail, unstar button, reorder handle; unstar → PATCH /api/v2/products/:id/starred; reorder → POST /api/v2/products/reorder
    - Create `adminPanel/admin-panel/src/app/admin/products/featured/page.tsx` — list all isFeatured=true products; per card: name, image, unfeature button, reorder handle; reorder → POST /api/v2/products/reorder
    - Add "Starred Products" and "Featured Products" links to CRM sidebar under Product Manager
    - Requirements: #7, #8

- [x] 9. CRM: Inquiries Module
  - [x] 9.1 Build Inquiries list with polling and status badges
    - Update `adminPanel/admin-panel/src/app/admin/inquiries/page.tsx`
    - Display all inquiries sorted by createdAt descending; show status badge per inquiry: "new" (amber), "read" (slate), "replied" (green)
    - Unread count badge on sidebar inquiries nav item; poll GET /api/inquiries every ≤15 seconds using setInterval while CRM is open; clear interval on component unmount
    - Requirements: #11

  - [x] 9.2 Build Inquiry detail view with reply and delete
    - When inquiry is opened: show full message thread with ISO-8601 formatted timestamps (author + time per message)
    - Reply text area + Send button: on submit → POST /api/inquiries/:id/reply; if SMTP fails → show error toast and do NOT update local status to 'replied'; on success → update status display
    - Delete button visible only to superadmin role; on click → confirm dialog → DELETE /api/inquiries/:id → return to list on success
    - Requirements: #11, #15

- [x] 10. CRM: Role-Based Access Control and Session Management
  - [x] 10.1 Enforce role-based sidebar rendering and route guards
    - Update CRM sidebar in `src/app/admin/layout.tsx`: render only tabs permitted for authenticated user's role; tabs restricted to superadmin/dev (e.g., Staff Management, Category Management) must not be present in the DOM for staff-role sessions
    - Display authenticated user's full name, email, and role label in sidebar user card and header profile menu (sourced from decoded JWT payload)
    - Add route-level guards to `/admin/products/categories`, `/admin/staff`, and other superadmin/dev-only routes; redirect unauthorized roles to dashboard
    - Requirements: #3, #15

  - [x] 10.2 Handle JWT session expiry and CRM code hygiene
    - Add a global Axios response interceptor in `src/lib/api.ts`: when any API call returns HTTP 401 during active session → clear JWT from localStorage, stop the current request chain, redirect to login page
    - Confirm `adminPanel/admin-panel/.env` contains `NEXT_PUBLIC_BACKEND_URL`; no hardcoded backend URLs or secret values in any source file
    - Remove all files matching `*-old.tsx` or `*page-old.tsx` from the CRM source tree; remove any components not referenced by any page, layout, or other component
    - Requirements: #13, #14, #15

- [x] 11. Backend: Legacy Cleanup and End-to-End Validation
  - [x] 11.1 Deprecate legacy route files after migration verification
    - After confirming all CRM and frontend traffic routes through `/api/v2/` endpoints, add a `// DEPRECATED` comment header to `backend/routes/home-products.js` and `backend/routes/products-gallery.js`
    - Remove those legacy route registrations from `backend/server.js` if confirmed no active path calls them; confirm no duplicate `app.use` registrations for any path prefix remain
    - Verify all sensitive configuration values (MongoDB URI, JWT secret, Cloudinary keys, SMTP credentials) are read exclusively from environment variables — run `grep -r "UjVH\|159867665417568\|dqnhpmoej" backend/` to confirm no secrets remain hardcoded in source
    - Requirements: #14

  - [x] 11.2 End-to-end environment and smoke validation
    - Verify `nexlife-surgical/.env.local` contains `NEXT_PUBLIC_BACKEND_URL` and `NEXT_PUBLIC_SITE_NAME`
    - Verify `backend/.env` contains all required vars: `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and all `SMTP_*` vars
    - Run migration script in `--dry-run` mode against the local database; confirm summary output shows correct inserted/skipped/conflict counts with zero data loss
    - Manually smoke-test all new `/api/v2/` endpoints: products list with `?site=surgical`, single product, categories, starred, featured; verify CORS headers are present for all allowed origins; verify all error responses follow `{ "error": "..." }` JSON shape
    - Requirements: #2, #13, #14

## Notes

- All new backend routes are under `/api/v2/`; existing `/api/` routes must remain functional throughout migration
- Frontend cache max stale time is 60 seconds — admin updates will be visible on the next fetch after the cache expires
- The migration script must be run once against production after the new schema is deployed; keep the dry-run output for audit
- CRM file uploads are validated client-side (type + size) before hitting the backend; backend also rejects invalid files
- Dynamic Fields are stored in `fields[]` on the product document; hidden fields are stripped server-side before public API responses
- The "Surgical" button on the frontend navbar toggles site context via URL query param (`?site=surgical`)
- Legacy `homeProducts` and `productsGallery` collections remain intact until migration is verified; both source routes stay functional during the transition period
