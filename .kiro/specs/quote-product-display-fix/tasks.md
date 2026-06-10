# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Product Name and URL Display
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases: products with slugs that get ID-based URLs, products with ID prefixes in names
  - Test that for a product with slug S and ID I, when added to cart, the cart item's slug equals S (not I)
  - Test that product names in cart do not match pattern `/^[a-f0-9]{24}\s+/`
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., "cart item slug was '6a271c3e080885a608040648' instead of 'sterile-surgical-gloves-latex'")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Cart and Quote Functionality
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Products with existing valid slugs continue to use those slugs for page URLs on website
  - Observe: Cart quantities are preserved correctly when products are added
  - Observe: Quote requests still send reference ID, customer details, and message to backend
  - Observe: PDF generation includes all product details (category, quantity, price information)
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3. Fix for product name and URL display issues

  - [ ] 3.1 Fix slug assignment in cart item creation
    - **File**: `nexlife-surgical/app/product/[slug]/page.tsx`
    - Locate the `handleAddToCart` function (around line 87)
    - Change `slug: product._id` to `slug: product.slug || product._id`
    - This ensures:
      - If product has a slug, use it for SEO-friendly URLs
      - If no slug exists, fall back to ID (acceptable per requirement 2.5)
    - _Bug_Condition: isBugCondition(product) where product is added to cart and slug is incorrectly assigned_
    - _Expected_Behavior: Cart item slug SHALL equal product.slug when available, fallback to product._id when not_
    - _Preservation: Existing cart functionality, quote submission, PDF generation shall remain unchanged_
    - _Requirements: 2.1, 2.4, 2.5_

  - [ ] 3.2 Investigate and fix ID prefix in product names
    - **Files**: `nexlife-surgical/app/product/[slug]/page.tsx`, `nexlife-surgical/app/cart/page.tsx`
    - Investigate where the ID prefix is being added to product names
    - Based on the workaround in `cart/page.tsx` line 258 (`item.name.replace(/^[a-f0-9]{24}/i, "")`), identify the source
    - Fix at the source to ensure `item.name` is stored without any ID prefix
    - Consider removing the workaround regex in cart/page.tsx once source fix is confirmed
    - _Bug_Condition: isBugCondition(product) where product name matches `/^[a-f0-9]{24}\s+/`_
    - _Expected_Behavior: Product names SHALL display without ID prefixes in cart, PDF, and CRM_
    - _Preservation: Product display, pricing, and category information shall remain accurate_
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Product Name and URL Display
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Cart and Quote Functionality
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [ ] 4. Manual verification of complete quote flow
  - Add a product with a slug to cart
  - Verify cart item name shows clean product name (no ID prefix)
  - Generate PDF quote and verify:
    - Product names display without ID prefix
    - Product URLs use slug format: `/product/{slug}`
  - Submit quote and check CRM:
    - Product names display correctly
    - Product links use slug-based URLs
  - Test with product that has no slug (verify fallback to ID for URL only)
  - Ensure all requirements are satisfied
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all exploration tests pass (confirming bug fix)
  - Ensure all preservation tests pass (confirming no regressions)
  - Review manual verification results
  - Ask the user if any questions arise
