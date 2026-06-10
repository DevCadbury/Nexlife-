# Requirements Document

## Introduction

This document defines requirements for the **Nexlife Unified System** — a complete integration and alignment of three existing applications:

1. **Frontend Website** (`nexlife-surgical` — Next.js): The public-facing surgical/medical product catalogue site. Currently uses hardcoded static data in `lib/data/products.ts` with no backend API integration.
2. **Admin CRM Panel** (`adminPanel/admin-panel` — Next.js): An authenticated dashboard for managing inquiries, subscribers, campaigns, gallery, and products. Currently connected to the backend but lacks unified product management, dual-website support, featured/starred products, and visibility controls.
3. **Backend API** (`backend` — Node.js/Express): MongoDB-backed REST API with Cloudinary integration. Has separate `homeProducts` and `productsGallery` collections, full inquiry management, staff authentication, and analytics — but these are not fully leveraged by the frontend.

The goal is to connect all three parts into one consistent, scalable, CRM-driven system where the admin controls everything visible on the frontend, including products, categories, pricing visibility, featured sections, and quote requests.

---

## Glossary

- **System**: The Nexlife Unified System comprising the Frontend, CRM, and Backend API.
- **Frontend**: The public Next.js website at `nexlife-surgical/`.
- **CRM**: The admin Next.js panel at `adminPanel/admin-panel/`.
- **Backend_API**: The Node.js/Express server at `backend/`.
- **Product**: A medical/surgical item with a name, category, image, optional price, optional fields, and visibility settings managed through the CRM.
- **Category**: A named grouping for products (e.g., "Disposable Gloves"), managed by the admin from the CRM.
- **Featured_Product**: A product that is administratively marked to appear in prominent sections on the Frontend homepage.
- **Starred_Product**: A product marked with a star designation from any category, stored in a dedicated section and shown in the Frontend's featured/order area.
- **Site_Context**: An enum value of either `surgical` (the surgical/main website) or `general` (the main Nexlife corporate site), used to scope which data the CRM and Frontend display.
- **Visibility_Flag**: A boolean field on a Product or Category that determines whether it appears on the Frontend.
- **Price_Visibility_Flag**: A boolean field on a Product that controls whether the price is shown to frontend visitors.
- **Dynamic_Field**: An admin-defined key-value attribute on a Product (e.g., `{ key: "Material", value: "Latex", hidden: false }`), equivalent to the existing `labels` field in the backend.
- **Quote_Request**: A user-submitted inquiry from the Frontend contact/product pages, stored in the backend `inquiries` collection and managed from the CRM.
- **Cloudinary**: The third-party media storage service used for all product image uploads.
- **JWT**: JSON Web Token used for admin authentication between the CRM and Backend_API.
- **Superadmin**: The highest-privilege admin role with full access to all CRM functions.
- **Staff**: A lower-privilege admin role with limited access as defined by role-based routing.
- **Surgical_Button**: A navbar element on the Frontend that enables the user to switch the active Site_Context between the main Nexlife site and the surgical site view.

---

## Requirements

---

### Requirement 1: Frontend Data Integration with Backend API

**User Story:** As a frontend visitor, I want to see real product data managed by the admin, so that the catalogue is always up-to-date without requiring a code deployment.

#### Acceptance Criteria

1. THE Frontend SHALL fetch all product data exclusively from the Backend_API and SHALL NOT import or reference any hardcoded static data files (such as `lib/data/products.ts`) for products or categories.
2. WHEN the Frontend loads the homepage, products page, or product detail page, THE Frontend SHALL issue an HTTP GET request to the Backend_API within 10 seconds and render the returned payload before showing product content.
3. IF the Backend_API returns an HTTP error status (4xx or 5xx) or the request times out after 10 seconds, THEN THE Frontend SHALL display a non-empty error message visible to the user (e.g., "Unable to load products. Please try again.") and SHALL NOT render a blank page or throw an unhandled exception.
4. THE Frontend SHALL cache API responses client-side with a maximum stale time of 60 seconds, such that a second page load within 60 seconds of a successful response does not issue a new network request for the same resource.
5. WHEN the admin updates a product's name, image, price visibility, or fields in the CRM, THE Frontend SHALL serve the updated data on the next page load or cache revalidation that occurs after the 60-second stale window has elapsed.
6. WHEN the Backend_API returns an empty product list for a valid category or page, THE Frontend SHALL render a visible empty-state message (e.g., "No products found") rather than an unrendered or broken layout.

---

### Requirement 2: Unified Product Schema

**User Story:** As an admin, I want a single, consistent product data model shared across both websites so that I only manage one catalogue.

#### Acceptance Criteria

1. THE Backend_API SHALL store all products in a single unified MongoDB collection named `products`, replacing the current separate `homeProducts` and `productsGallery` collections.
2. THE Backend_API SHALL enforce that every product document in the `products` collection contains at minimum: `name` (string, max 255 characters), `category` (string), `siteContext` (enum: `surgical` | `general` | `both`), `images` (array of Cloudinary media objects), `visible` (boolean), `hidePrice` (boolean), `isFeatured` (boolean), `isStarred` (boolean), `sequence` (number), `createdAt` (date), `updatedAt` (date); and optionally: `price` (string), `priceUnit` (string), `fields` (array of Dynamic_Fields).
3. THE Backend_API SHALL provide a migration script that, when executed, copies every document from `homeProducts` and `productsGallery` into `products`; after migration, a count query on `products` SHALL equal the sum of pre-migration counts from both source collections, and every field present in a source document SHALL be present with its original value in the corresponding `products` document.
4. IF a document ID exists in both `homeProducts` and `productsGallery`, THEN THE migration script SHALL write the `productsGallery` version to `products` and log a conflict notice identifying the duplicate ID.
5. WHEN a product creation request is received without a `siteContext` field or with a null or empty-string `siteContext`, THE Backend_API SHALL store the product with `siteContext` set to `surgical`.
6. WHEN a product creation or update request is received with a `siteContext` value that is not `surgical`, `general`, or `both`, THE Backend_API SHALL return HTTP 400 with an error message identifying the invalid value.

---

### Requirement 3: Product Category Management

**User Story:** As an admin, I want to create, rename, reorder, show, or hide product categories from the CRM so that the frontend catalogue structure matches my business needs.

#### Acceptance Criteria

1. THE CRM SHALL provide a Category Management interface accessible to users with the `superadmin` or `dev` role, from which they can create, rename, delete, reorder, and toggle the visibility of categories.
2. WHEN an admin creates a new category, THE Backend_API SHALL store a category document with a non-empty `name` (max 100 characters), a `siteContext`, a `visible` flag defaulting to `true`, and a `sequence` number; and THE Frontend SHALL include the new category in the category filter and navigation dropdown on the next data fetch.
3. WHEN a category's `visible` flag is set to `false`, THE Backend_API SHALL exclude all products belonging to that category from the public product listing endpoint response, and THE Frontend SHALL not render those products or the category entry in its navigation.
4. WHEN a category deletion is requested and the category contains one or more products, THE Backend_API SHALL return HTTP 409 with an error message listing the count of affected products; THE CRM SHALL display this message and present the admin with options to reassign the products to another category or delete them before retrying the deletion.
5. WHEN a category deletion is requested and the category contains no products, THE Backend_API SHALL delete the category document and return HTTP 200.
6. THE Backend_API SHALL return categories in ascending order of their `sequence` field on all category listing endpoints, and THE Frontend SHALL render category filters and navigation dropdowns in the order returned.
7. WHEN a category rename request is received, THE Backend_API SHALL update the category document's `name` field and update the `category` field on all product documents belonging to that category within the same database operation; IF any part of that operation fails, THE Backend_API SHALL roll back all changes and return HTTP 500 with an error message.
8. WHEN a category creation request is received with a `name` that duplicates an existing category name under the same `siteContext`, THE Backend_API SHALL return HTTP 409 with an error message indicating the duplicate name.

---

### Requirement 4: Full Product CRUD Management

**User Story:** As an admin, I want to add, update, delete, and control visibility of products from the CRM so that I have complete control over the product catalogue.

#### Acceptance Criteria

1. THE CRM SHALL provide a product creation form that accepts: `name` (required, max 200 characters), `category` (required), `siteContext` (required), one or more image uploads, `price` (optional string), `priceUnit` (optional string), dynamic fields (each a key/value pair with an optional per-field visibility toggle), `isFeatured` (boolean toggle), `isStarred` (boolean toggle), and a `visible` toggle.
2. WHEN an admin submits a product creation form, THE Backend_API SHALL validate that `name` and `category` are present; IF `name` is missing, THEN THE Backend_API SHALL return HTTP 400 with an error message stating "name is required"; IF `category` is missing, THEN THE Backend_API SHALL return HTTP 400 with an error message stating "category is required".
3. WHEN an admin submits a product update request for a product ID that exists, THE Backend_API SHALL accept partial updates to any combination of: `name`, `category`, `images`, `price`, `hidePrice`, `fields`, `isFeatured`, `isStarred`, `sequence`, and `visible`, and SHALL return the updated document.
4. IF a product update request is received for a product ID that does not exist, THEN THE Backend_API SHALL return HTTP 404 with an error message identifying the product ID.
5. WHEN an admin deletes a product that exists, THE Backend_API SHALL permanently remove the product document from MongoDB; deletion of associated Cloudinary images SHALL be attempted using the stored `publicId` values, and if Cloudinary deletion fails for any image, THE Backend_API SHALL log the failure but SHALL still return HTTP 200 and remove the MongoDB document.
6. IF a product deletion request is received for a product ID that does not exist, THEN THE Backend_API SHALL return HTTP 404 with an error message.
7. WHEN a create, update, or delete request is received on a product route without a JWT, THE Backend_API SHALL return HTTP 401 with an error message.
8. WHEN a create, update, or delete request is received on a product route with a valid JWT for a role that is not `superadmin` or `dev`, THE Backend_API SHALL return HTTP 403 with an error message.
9. THE CRM SHALL display all products grouped by category, with per-product inline controls for edit, delete, show/hide toggle, and sequence reorder.
10. WHEN a bulk reorder request is received containing an ordered array of `{ id, sequence }` objects, THE Backend_API SHALL update the `sequence` field on each matching product; IF the array is empty or malformed, THE Backend_API SHALL return HTTP 400 with an error message.

---

### Requirement 5: Cloudinary Image Management

**User Story:** As an admin, I want to upload product images through the CRM with Cloudinary so that images are served reliably via a CDN.

#### Acceptance Criteria

1. THE CRM SHALL provide a file input that accepts only files with MIME types `image/jpeg`, `image/png`, `image/webp`, and `image/gif`, with a maximum size of 10 MB per file, and SHALL reject files outside these constraints before submission with a visible error message.
2. WHEN an admin uploads a product image, THE Backend_API SHALL upload the file to Cloudinary in the `nexlife-products` folder with quality set to `auto` (targeting a minimum perceptual quality score of 60), and SHALL resize the image so that neither dimension exceeds 800 pixels while preserving the original aspect ratio.
3. THE Backend_API SHALL store the Cloudinary `secure_url`, `public_id`, `format`, `bytes`, `width`, and `height` in the product document's `images` array, which SHALL hold a maximum of 10 entries per product.
4. WHEN an admin replaces an existing product image, THE Backend_API SHALL first attempt to delete the old image from Cloudinary using the stored `public_id`; IF the Cloudinary delete call fails, THEN THE Backend_API SHALL return an error response indicating the deletion failure and SHALL NOT proceed with uploading the replacement image or modifying the product document.
5. IF a Cloudinary upload fails for any reason, THEN THE Backend_API SHALL return an error response indicating the upload failure and SHALL NOT create or modify the product document in MongoDB.

---

### Requirement 6: Show/Hide Price and Dynamic Field Controls

**User Story:** As an admin, I want to control which fields and pricing information appear on the frontend per product so that I can manage competitive or sensitive information.

#### Acceptance Criteria

1. THE CRM SHALL display a "Show Price" toggle on each product's edit view that, when switched off, sets the product's `hidePrice` flag to `true` in the Backend_API; IF the toggle update request fails, THE CRM SHALL display an error message and revert the toggle to its previous state.
2. WHEN a public product API response is generated for a product where `hidePrice` is `true`, THE Backend_API SHALL not include `price` or `priceUnit` fields in the response payload for that product.
3. THE Frontend SHALL not render a price element for any product object in the API response that lacks `price` and `priceUnit` fields.
4. THE CRM SHALL allow admins to add a Dynamic_Field to a product by entering a `key` (string, 1–100 characters) and `value` (string, 1–500 characters), with an optional `hidden` toggle defaulting to `false`.
5. IF a Dynamic_Field add or update request is received with a `key` that is empty or exceeds 100 characters, or a `value` that is empty or exceeds 500 characters, THEN THE Backend_API SHALL return HTTP 400 with an error message identifying the invalid field.
6. WHEN a Dynamic_Field's `hidden` flag is `true`, THE Backend_API SHALL exclude that specific field object from the public product API response for that product.
7. WHEN an admin removes a Dynamic_Field from a product in the CRM, THE CRM SHALL send a product update request to the Backend_API with the field omitted from the `fields` array; THE Backend_API SHALL persist the change and return HTTP 200; IF the request fails, THE CRM SHALL display an error message.
8. THE Frontend SHALL render only the Dynamic_Field objects present in the API response for a given product, in the order they appear in the response array.

---

### Requirement 7: Starred Products (Featured/Order Section)

**User Story:** As an admin, I want to mark any product from any category as "starred" so that it appears in a dedicated featured section on the frontend homepage.

#### Acceptance Criteria

1. THE CRM SHALL render a star icon control on each product card in the product management interface; clicking the icon SHALL toggle the product's `isStarred` flag between `true` and `false` via the Backend_API; IF the toggle request fails, THE CRM SHALL display an error message and revert the icon to its previous state.
2. WHEN a product's `isStarred` flag is set to `true`, THE CRM SHALL include that product in a visible "Starred Products" section within the product management view, in addition to displaying it in its category group.
3. THE Backend_API SHALL expose a public endpoint `GET /api/v2/products/starred` that returns an array of products where `isStarred = true` and `visible = true`, sorted by ascending `sequence`.
4. THE Frontend homepage SHALL include a section labelled "Featured / Order" that issues a request to `GET /api/v2/products/starred` on page load and renders the returned products; WHEN the endpoint returns an empty array, THE Frontend SHALL render a visible empty-state message rather than a broken layout.
5. THE CRM SHALL provide a dedicated "Starred Products" management view from which admins can reorder starred products by dragging or using sequence inputs, unstar individual products, and view all starred products grouped separately from category-based listings.
6. WHEN a product document is deleted, THE Backend_API SHALL remove the document entirely, such that a subsequent request to `GET /api/v2/products/starred` does not include the deleted product.

---

### Requirement 8: Featured Products Section

**User Story:** As an admin, I want to designate specific products as "featured" so that they appear prominently on the frontend homepage's "Featured Products" section.

#### Acceptance Criteria

1. THE CRM SHALL render an `isFeatured` toggle on each product's edit view and on each product card in the product management interface; the toggle SHALL operate independently of the `isStarred` flag so that a product may be both, either, or neither.
2. THE Backend_API SHALL expose a public endpoint `GET /api/v2/products/featured` that returns an array of products where `isFeatured = true` and `visible = true`, sorted by ascending `sequence`.
3. THE Frontend homepage "Featured Products" section SHALL issue a request to `GET /api/v2/products/featured` on each page load and render the returned products dynamically.
4. THE CRM SHALL allow an admin to set or clear the `isFeatured` flag from both the main product list view and a dedicated "Featured Products" management view.
5. WHEN `GET /api/v2/products/featured` returns an empty array, THE Frontend SHALL not render the "Featured Products" section heading or container, OR SHALL render a visible empty-state message; in either case, no broken or empty layout elements SHALL be present.

---

### Requirement 9: Dual-Website Support via Site Context

**User Story:** As an admin, I want the CRM to manage two separate website experiences (Surgical and General) so that each site shows only the relevant products and content.

#### Acceptance Criteria

1. THE Backend_API SHALL enforce that every product document carries a `siteContext` field with a value of exactly `surgical`, `general`, or `both` as defined in Requirement 2.
2. WHEN a public product listing or filtering request includes the query parameter `site=surgical`, THE Backend_API SHALL return only products whose `siteContext` is `surgical` or `both`; WHEN the parameter is `site=general`, THE Backend_API SHALL return only products whose `siteContext` is `general` or `both`.
3. WHEN the `site` query parameter is omitted from a public product request, THE Backend_API SHALL return products whose `siteContext` is `surgical` or `both` as the default.
4. WHEN the `site` query parameter is present with a value that is not `surgical` or `general`, THE Backend_API SHALL return HTTP 400 with an error message identifying the invalid value.
5. THE CRM SHALL display a site context selector (dropdown or tab labelled "Surgical", "General", "Both") in the product management interface; selecting a value SHALL filter the displayed product list to show only products matching that `siteContext`.
6. WHEN an admin creates or edits a product in the CRM, THE CRM SHALL include a required "Site" field with options "Surgical", "General", and "Both", and SHALL NOT allow form submission without a selected value.
7. WHILE a site context is selected in the CRM dashboard, THE CRM SHALL display product counts scoped to that site context, where the count equals the number of documents in `products` whose `siteContext` matches the selected value or is `both`.

---

### Requirement 10: Surgical Navbar Button and Site Switching

**User Story:** As a frontend visitor, I want a "Surgical" navbar button so that I can switch between the main Nexlife website and the surgical website view.

#### Acceptance Criteria

1. THE Frontend Navbar SHALL include a control whose visible label is the text "Surgical" that, when activated, sets the active Site_Context to `surgical`.
2. WHEN the "Surgical" control is activated, THE Frontend SHALL update the URL query parameter to `?site=surgical` and re-fetch the product catalogue, categories, and featured sections from the Backend_API using `site=surgical`, then re-render those sections with the returned data.
3. WHILE the surgical Site_Context is active, THE Frontend Navbar SHALL render the "Surgical" control in a visually distinct state (such as a highlighted background or underline) that is different from its non-active state.
4. WHEN the active site context changes and the subsequent Backend_API data fetch fails, THE Frontend SHALL display an error message (e.g., "Failed to load products. Please try again.") and SHALL retain the previously displayed content rather than showing a blank section.
5. THE Frontend SHALL read the `site` query parameter from the URL on initial page load and apply it as the active Site_Context, so that navigating directly to a URL containing `?site=surgical` renders the surgical view without requiring the user to click the button.
6. THE Frontend Navbar's category dropdown SHALL fetch its category list from the Backend_API using the active `site` query parameter and SHALL NOT use any hardcoded category arrays or static imports for category navigation.

---

### Requirement 11: Quote Management in CRM

**User Story:** As an admin, I want to manage all quote requests and inquiries from the CRM so that I can respond promptly and track customer communication.

#### Acceptance Criteria

1. THE CRM inquiries module SHALL display all quote requests retrieved from the Backend_API, sorted by `createdAt` descending, with a visible status badge for each inquiry showing one of the values: `new`, `read`, or `replied`.
2. WHEN an admin opens an inquiry, THE CRM SHALL display the full message thread including all inbound messages and all admin replies, each showing the author identifier and an ISO-8601 timestamp.
3. THE CRM SHALL provide a reply input within the inquiry detail view; WHEN an admin submits a reply, THE CRM SHALL send the reply content to the Backend_API, which SHALL dispatch the reply as an email to the customer's stored email address via SMTP; IF the SMTP send fails, THE Backend_API SHALL return an error response and THE CRM SHALL display an error message without marking the inquiry as `replied`.
4. WHEN a visitor submits the Frontend contact or product page form, THE Backend_API SHALL store the submission as an inquiry document with status `new` and SHALL send a notification email to the admin email address configured in the backend environment; IF the notification email fails to send, THE Backend_API SHALL still return HTTP 201 and store the inquiry document, and SHALL log the email failure.
5. THE Backend_API SHALL send a confirmation email to the customer's submitted email address upon inquiry creation, including the customer's name, a unique inquiry reference identifier, and a link to the product catalogue page.
6. THE CRM SHALL provide a delete control on each inquiry visible only to users with the `superadmin` role; WHEN activated, THE Backend_API SHALL permanently delete the inquiry document and return HTTP 200.
7. THE CRM SHALL display the count of inquiries with status `new` as a numeric badge on the inquiries navigation item; THE CRM SHALL re-fetch the unread count from the Backend_API at an interval not exceeding 15 seconds while the CRM is open in the browser.

---

### Requirement 12: Admin Visibility Control Over Frontend Content

**User Story:** As a superadmin, I want to control everything visible on the frontend including prices, product fields, categories, and featured sections from one place in the CRM.

#### Acceptance Criteria

1. THE CRM SHALL provide a single interface (labelled "Product Manager" or "Content Visibility") from which an authenticated admin can toggle: product `visible` flag, product `hidePrice` flag, individual Dynamic_Field `hidden` flags, category `visible` flag, `isFeatured` flag, and `isStarred` flag — all without navigating away from that interface.
2. WHEN a product's `visible` flag is set to `false` via the CRM, THE Backend_API SHALL exclude that product from the response of all public product listing and detail endpoints; a subsequent GET request for that product by a non-authenticated client SHALL return HTTP 404.
3. WHEN a category's `visible` flag is set to `false`, THE Backend_API SHALL exclude all products in that category from public product listing responses, and THE Frontend SHALL not render the category entry in navigation or filter controls on the next data fetch.
4. WHEN a visibility toggle request is received on a product or category route without a JWT, THE Backend_API SHALL return HTTP 401; WHEN received with a JWT for a role other than `superadmin` or `dev`, THE Backend_API SHALL return HTTP 403 with an error message.
5. THE CRM SHALL display a badge labelled "Live" in green for products where `visible = true` and a badge labelled "Hidden" in a visually distinct colour (e.g., grey or red) for products where `visible = false`; the badge SHALL update in the UI within one render cycle of the toggle action completing.

---

### Requirement 13: Consistent API Communication and CORS Alignment

**User Story:** As a developer, I want all three parts of the system to communicate over a well-defined, consistent API contract so that the system is maintainable and debuggable.

#### Acceptance Criteria

1. THE Backend_API CORS configuration SHALL explicitly list the Frontend production domain, the CRM production domain, `http://localhost:3000`, and `http://localhost:3001` as allowed origins, and SHALL reject preflight requests from origins not in this list with HTTP 403.
2. THE Frontend SHALL contain a single API client module (e.g., `lib/api.ts`) that constructs all Backend_API request URLs by reading the `NEXT_PUBLIC_BACKEND_URL` environment variable; no other Frontend file SHALL construct Backend_API base URLs directly.
3. THE Frontend SHALL include a `NEXT_PUBLIC_BACKEND_URL` entry in its `.env` file (and `.env.production` for production builds) whose value is the deployed Backend_API base URL.
4. THE Backend_API SHALL return a JSON object conforming to `{ "error": "<message>", "code": "<optional string>" }` for all responses with HTTP status 4xx or 5xx; no 4xx or 5xx response SHALL return plain text or an HTML error page.
5. THE Backend_API SHALL register all new unified product routes under the path prefix `/api/v2/products`; existing routes under `/api/products` SHALL remain functional and unmodified during the migration period.
6. WHEN the Frontend API client receives an HTTP 401 response, THE Frontend SHALL navigate the user to an error page or display a session-expired message, and SHALL NOT silently discard the response or continue rendering product data.

---

### Requirement 14: Code Cleanup and Scalable Architecture

**User Story:** As a developer, I want the existing code cleaned up and organized so that the system is scalable, maintainable, and consistent across both websites.

#### Acceptance Criteria

1. THE Frontend source tree SHALL contain no file at `lib/data/products.ts` after migration, and no Frontend source file SHALL import from that path; all product data consumption SHALL go through the centralized API client module defined in Requirement 13.
2. THE Frontend Navbar component SHALL fetch the category list from the Backend_API using the API client module and SHALL NOT contain any hardcoded array literals for category names or slugs.
3. THE Backend_API SHALL register all product-related route handlers in a single router file (e.g., `routes/products.js`); `server.js` SHALL mount that router once and SHALL NOT contain duplicate `app.use` registrations for the same product path prefix.
4. THE CRM source tree SHALL contain no files matching the pattern `*page-old.tsx` or `*-old.tsx`; components that are unreferenced by any page, layout, or other component SHALL be removed.
5. ALL three applications SHALL read sensitive configuration values (database URIs, API keys, JWT secrets, SMTP credentials, Cloudinary keys) exclusively from environment variables defined in `.env` files; no such values SHALL appear as string literals in any source file committed to version control.
6. THE Backend_API `routes/home-products.js` and `routes/products-gallery.js` files SHALL be removed or renamed with a `.deprecated` suffix after the `products` collection migration is verified; `server.js` SHALL not register those routes after removal.
7. THE Frontend SHALL read the initial Site_Context from the `NEXT_PUBLIC_SITE_NAME` environment variable on first load; IF the variable is absent or empty, THE Frontend SHALL default the Site_Context to `surgical`.

---

### Requirement 15: Role-Based Access Control

**User Story:** As a superadmin, I want the CRM to enforce role-based access so that staff members only see and modify what they are permitted to.

#### Acceptance Criteria

1. THE Backend_API `requireAuth` middleware SHALL validate the JWT signature and expiry on every protected route; IF the JWT is absent, THE Backend_API SHALL return HTTP 401 with the message "Authentication required"; IF the JWT is present but expired or has an invalid signature, THE Backend_API SHALL return HTTP 401 with the message "Token invalid or expired".
2. WHEN a request is received on a route restricted to `superadmin` or `dev` roles and the decoded JWT contains a role of `staff`, THE Backend_API SHALL return HTTP 403 with the message "Insufficient permissions".
3. THE CRM navigation sidebar SHALL render only the tabs and menu items that are permitted for the authenticated user's role; tabs restricted to `superadmin` or `dev` (such as staff management and category management) SHALL not be present in the DOM for `staff` role sessions.
4. THE CRM SHALL display the authenticated user's full name, email address, and role label in the sidebar user card and in the header profile menu, sourced from the decoded JWT payload.
5. WHEN the CRM receives an HTTP 401 response from any Backend_API call during an active session, THE CRM SHALL clear the stored JWT, cease further API requests for the current operation, and redirect the user to the login page.
