# Bugfix Requirements Document

## Introduction

This bugfix addresses two related issues in the quote/PDF system:
1. Product IDs are being displayed alongside product names in quotes and PDFs, making the output confusing for end users
2. Product URLs in PDF documents and CRM quote pages use raw product IDs instead of SEO-friendly slug-based URLs

The root causes are:
- Products are being stored in the cart with their ID prepended to the name field (e.g., "6a271c3e080885a608040648 Test Product Name")
- Product URLs fall back to using IDs when the slug field is not properly populated or utilized

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a product is added to the cart from the product detail page THEN the product name is stored with the product ID prepended (e.g., "6a271c3e080885a608040648 Test Product Name")

1.2 WHEN a quote request is submitted from the cart THEN the product name displayed in the CRM and PDF includes the ID prefix

1.3 WHEN a quote PDF is generated from the cart page THEN product names are displayed with the ID prefix visible (e.g., "6a271c3e080885a608040648 Contact for pricing")

1.4 WHEN a product URL is generated for the PDF or CRM THEN the URL uses the product ID (e.g., `/product/6a271c3e080885a608040648`) instead of the slug

1.5 WHEN products are displayed in the CRM quote detail modal THEN the product ID is shown separately in the "Product ID / SKU" field, creating redundant information

### Expected Behavior (Correct)

2.1 WHEN a product is added to the cart THEN the product name SHALL be stored without any ID prefix

2.2 WHEN a quote request is submitted from the cart THEN the product name displayed in the CRM and PDF SHALL show only the clean product name

2.3 WHEN a quote PDF is generated from the cart page THEN product names SHALL be displayed without any ID prefix (e.g., "Test Product Name" instead of "6a271c3e080885a608040648 Test Product Name")

2.4 WHEN a product URL is generated for the PDF or CRM THEN the URL SHALL use the product slug (e.g., `/product/sterile-surgical-gloves-latex`) instead of the ID

2.5 WHEN a product does not have a slug THEN the URL SHALL fall back to the product ID, but this fallback SHALL only affect the URL, not the display name

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a product has a valid slug stored in the database THEN the system SHALL CONTINUE TO use that slug for product page URLs on the website

3.2 WHEN a product is added to the cart with quantity greater than one THEN the system SHALL CONTINUE TO correctly track the quantity

3.3 WHEN a quote request is submitted THEN the system SHALL CONTINUE TO send the reference ID, customer details, and message to the backend

3.4 WHEN a quote PDF is generated THEN the system SHALL CONTINUE TO include all product details (category, quantity, price information)

3.5 WHEN products are stored in the database THEN the system SHALL CONTINUE TO maintain the separate `slug` and `_id` fields independently


## Correctness Properties

### P1: Product Name Display Invariant
THE product name displayed to users in ANY context (cart, quote, PDF, CRM) SHALL NOT contain the product ID as a prefix.

**Property check**: For any product display location L and any product P, the displayed name N = P.name SHALL satisfy: N does not match pattern `/^[a-f0-9]{24}\s+/`

### P2: Slug URL Generation
THE product URL SHALL be constructed using the product slug when available, falling back to ID only when slug is null/empty.

**Property check**: For any product P, IF P.slug is not null and not empty THEN URL = `/product/${P.slug}` ELSE URL = `/product/${P._id}`

### P3: Cart Item Integrity
WHEN a product is added to the cart THEN the cart item SHALL store the correct slug field value (not the ID) for URL generation.

**Property check**: For any cart item C created from product P, C.slug SHALL equal P.slug (not P._id)
