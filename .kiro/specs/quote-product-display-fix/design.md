# Technical Design: Quote Product Display Fix

## Overview

This bugfix addresses two root causes in the quote/PDF system:
1. **Cart item creation** incorrectly sets `slug: product._id` instead of the actual product slug
2. **Product names** may be stored with ID prefixes due to workarounds in the data flow

## Bug Details

This bugfix addresses two related issues in the quote/PDF system:
1. Product IDs are being displayed alongside product names in quotes and PDFs
2. Product URLs in PDF documents and CRM quote pages use raw product IDs instead of SEO-friendly slug-based URLs

### Evidence
User report shows product names appearing as:
```
TEST 6a271c3e080885a608040648 Contact for pricing
6a271c3e080885a608040648 $888.00
```

## Expected Behavior

1. Product names shall display without ID prefixes
2. Product URLs shall use slug-based format (e.g., `/product/sterile-surgical-gloves-latex`)
3. When slug is unavailable, fall back to ID for URLs only (not display names)

## Hypothesized Root Cause

### Issue 1: Incorrect Slug Assignment
**Location**: `nexlife-surgical/app/product/[slug]/page.tsx` line 87

```typescript
const cartItem = {
  id: product._id,
  name: product.name,
  // ...
  slug: product._id,  // ❌ BUG: Should be product.slug
  // ...
};
```

The cart item is created with `slug: product._id` instead of `slug: product.slug`. This causes:
- URLs in PDFs to use `/product/{id}` instead of `/product/{slug}`
- CRM links to use IDs instead of slugs

### Issue 2: Name Prefix Workaround
**Location**: `nexlife-surgical/app/cart/page.tsx` line 258

```typescript
const rawName = item.name.replace(/^[a-f0-9]{24}/i, "").trim() || item.name;
```

A workaround exists to strip the ID prefix from names, indicating the ID is being prepended somewhere in the data flow. The fix should prevent this prefixing at the source.


## Fix Implementation

### Fix 1: Correct Slug Assignment in Cart Item Creation

**File**: `nexlife-surgical/app/product/[slug]/page.tsx`

Change line 87 from:
```typescript
slug: product._id,
```

To:
```typescript
slug: product.slug || product._id,
```

This ensures:
- If product has a slug, use it for SEO-friendly URLs
- If no slug exists, fall back to ID (acceptable fallback per requirements 2.5)

### Fix 2: Remove ID Prefix from Product Names (if applicable)

Investigate where the ID prefix is being added to product names. Based on the workaround in `cart/page.tsx`, the name might be receiving an ID prefix. The fix should ensure:

- `item.name` is stored without any ID prefix
- Remove the workaround regex once the source fix is confirmed

### Fix 3: Ensure URL Generation Uses Correct Slug

**File**: `nexlife-surgical/app/cart/page.tsx`

The cart page already correctly uses:
```typescript
const productUrl = `${frontendBase}/product/${slug ?? productId}`;
```

Once Fix 1 is applied, `slug` will contain the correct value, so URLs will automatically use slugs.



## Impact Analysis

### Files Modified

| File | Change | Risk |
|------|--------|------|
| `nexlife-surgical/app/product/[slug]/page.tsx` | Fix slug assignment in `handleAddToCart` | Low |
| `nexlife-surgical/app/cart/page.tsx` | Verify name handling, remove workaround if applicable | Low |

### Affected Flows

1. **Add to Cart Flow**: When user adds product to cart, the cart item will have correct slug
2. **PDF Generation**: Product URLs in PDF will use slug-based URLs
3. **CRM Quote Display**: Product links in CRM will use slug-based URLs
4. **Email Notifications**: Product links in emails will use slug-based URLs

### Regression Risks

- **Products without slugs**: These will correctly fall back to ID-based URLs
- **Existing cart items**: Items already in localStorage will have incorrect slugs until cart is cleared or updated
- **Backward compatibility**: The `slug ?? productId` fallback pattern is already in use across the codebase



## Testing Strategy

### Manual Testing

1. Add a product with a slug to cart
2. Verify cart item name shows clean product name (no ID prefix)
3. Generate PDF quote and verify:
   - Product names display without ID prefix
   - Product URLs use slug format: `/product/{slug}`
4. Submit quote and check CRM:
   - Product names display correctly
   - Product links use slug-based URLs

### Property-Based Testing

**P1: Product Name Display Invariant**
- Test that for any product added to cart, the displayed name does not match `/^[a-f0-9]{24}\s+/`

**P2: Slug URL Generation**
- Test that for any product with a non-null, non-empty slug, the generated URL uses the slug
- Test that for products with null/empty slug, the URL falls back to ID

**P3: Cart Item Integrity**
- Test that when a product P is added to cart, the cart item's slug equals P.slug



## Implementation Tasks

### Task 1: Fix Slug Assignment
- **File**: `nexlife-surgical/app/product/[slug]/page.tsx`
- **Change**: Update `slug: product._id` to `slug: product.slug || product._id` in `handleAddToCart`
- **Verification**: Add product to cart, verify slug is correct in localStorage

### Task 2: Investigate Name Prefix Source
- **Files**: Search data flow from API to cart
- **Change**: Identify where ID prefix is added to name and fix at source
- **Verification**: Verify product names in cart don't have ID prefixes

### Task 3: Write Property Tests
- **File**: Create test file for property-based testing
- **Tests**:
  - P1: Product name invariant test
  - P2: Slug URL generation test
  - P3: Cart item integrity test

### Task 4: Manual Verification
- Test full quote flow from cart to PDF to CRM
- Verify all requirements are satisfied


## Correctness Properties

### Property 1: Product Name Display Invariant
For any product added to cart, the displayed name SHALL NOT match pattern `/^[a-f0-9]{24}\s+/`.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 2: Slug URL Generation
For any product P:
- IF P.slug is not null and not empty THEN URL = `/product/${P.slug}`
- ELSE URL = `/product/${P._id}`

**Validates: Requirements 2.4, 2.5**

### Property 3: Cart Item Integrity
For any cart item C created from product P, C.slug SHALL equal P.slug (not P._id).

**Validates: Requirements 2.1, 2.4**

## Glossary

- **Slug**: A URL-friendly identifier derived from the product name (e.g., "sterile-surgical-gloves-latex")
- **Product ID**: MongoDB ObjectId (24-character hex string, e.g., "6a271c3e080885a608040648")
- **Cart Item**: A product added to the shopping cart with quantity information
