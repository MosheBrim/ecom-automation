# AI Bugs and Corrections

This document tracks mistakes made by AI tools during development and how they were corrected.

---

## Bug #1: `selectionStrategy` Stripped by Zod Validation

**AI Tool:** Claude Code (Claude Opus 4)
**Date:** 2026-02-12
**Severity:** High
**Category:** TypeScript / Validation

**What AI Suggested:**
The AI created a Zod `SearchRequestSchema` that did not include `selectionStrategy`:
```typescript
export const SearchRequestSchema = z.object({
  query: z.string().min(1),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'rating']).default('relevance'),
  limit: z.number().int().positive().default(20),
  maxPrice: z.number().positive().optional(),
  minPrice: z.number().positive().optional(),
});
```
But `searchRoutes.ts` passed the validated body (which strips unknown fields) to `SearchService.search()`, which expected a `selectionStrategy` field.

**Why It Was Wrong:**
- Zod strips fields not defined in the schema during validation
- `selectionStrategy` was silently removed from the request body
- `SearchService.search()` received `undefined` for `selectionStrategy`, causing TypeScript error TS2345
- Backend `tsc --noEmit` failed with multiple compile errors

**Correct Solution:**
Added `selectionStrategy` to the schema:
```typescript
export const SearchRequestSchema = z.object({
  query: z.string().min(1),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'rating']).default('relevance'),
  limit: z.number().int().positive().default(20),
  selectionStrategy: z.enum(['cheapest', 'first', 'highest_rated', 'best_value']).default('first'),
  maxPrice: z.number().positive().optional(),
  minPrice: z.number().positive().optional(),
});
```

**Lesson Learned:**
When using Zod for request validation, always verify that ALL fields used by downstream services are included in the schema. Zod silently strips unknown fields — no runtime error, just missing data.

---

## Bug #2: Login Stuck on Toolshop's Custom Password Component

**AI Tool:** Claude Code (Claude Opus 4)
**Date:** 2026-02-12
**Severity:** High
**Category:** Automation

**What AI Suggested:**
```typescript
await page.fill('[data-test="email"]', email);
await page.fill('#password', password);
await page.click('[data-test="login-submit"]');
```

**Why It Was Wrong:**
- The Toolshop site uses a custom Angular component `<app-password-input>` that wraps the actual `<input>` element
- Playwright's `fill()` sets the value directly on the DOM element, bypassing Angular's change detection
- The Angular form validator never detected the password input, so the login button remained disabled
- The automation got stuck indefinitely at the login step with no error — just a frozen page

**Correct Solution:**
```typescript
const emailInput = page.locator('[data-test="email"]');
await emailInput.click();
await emailInput.pressSequentially(email, { delay: 10 });

const passwordInput = page.locator('#password');
await passwordInput.click();
await passwordInput.pressSequentially(password, { delay: 10 });

await page.click('[data-test="login-submit"]');
```
Using `pressSequentially()` with a small delay simulates real keystrokes, which properly triggers Angular's `(input)` event listeners and form validation.

**Lesson Learned:**
When automating Angular/React sites with custom form components, `fill()` may bypass framework change detection. Use `pressSequentially()` with a delay for form fields that rely on input event listeners.

---

## Bug #3: Address Schema Mismatch After Site Migration

**AI Tool:** Claude Code (Claude Opus 4)
**Date:** 2026-02-12
**Severity:** High
**Category:** TypeScript / Architecture

**What AI Suggested:**
After migrating from Amazon to Toolshop, the AI updated the automation flows but left the old `AddressSchema` with Amazon's field structure:
```typescript
export const AddressSchema = z.object({
  fullName: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().default('US'),
  phone: z.string().optional(),
});
```

**Why It Was Wrong:**
- Toolshop's checkout form uses different field names: `street`, `city`, `state`, `country`, `postalCode`
- The mismatch caused TypeScript errors across 8+ files: CheckoutService, checkoutFlow, Order.test.ts, CheckoutService.test.ts, frontend types
- The `fillShippingAddress` function referenced `address.street` but the type defined `address.addressLine1`

**Correct Solution:**
Updated the schema to match Toolshop's actual form fields:
```typescript
export const AddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().default('US'),
  postalCode: z.string().min(1),
});
```
Updated all dependent files: CheckoutService (default address), Order.test.ts (mock address), CheckoutService.test.ts, and frontend type definitions.

**Lesson Learned:**
When migrating to a new target site, update domain schemas FIRST — they propagate type changes to all dependent layers. Running `tsc --noEmit` immediately after schema changes reveals all files that need updating.

---

## Bug #4: Amazon Selectors Left in Code After Migration

**AI Tool:** Claude Code (Claude Opus 4)
**Date:** 2026-02-12
**Severity:** Medium
**Category:** Automation / Migration

**What AI Suggested:**
After creating `toolshop.selectors.ts`, the AI updated most flow files but left the old `amazon.selectors.ts` file in place. Several files still imported from it:
```typescript
import { AMAZON_SELECTORS } from '../selectors/amazon.selectors';
```
Additionally, mock data in test files still used Amazon-specific values:
```typescript
const mockProduct = {
  source: 'amazon',
  productUrl: 'https://amazon.com/dp/B001',
};
```

**Why It Was Wrong:**
- Old imports caused build failures once `amazon.selectors.ts` was deleted
- Mock data with `source: 'amazon'` didn't match the updated Zod schema (`source: 'toolshop'`)
- Test assertions failed because expected values didn't match the new site structure

**Correct Solution:**
- Searched all files for `amazon|AMAZON` references using grep
- Updated all imports to use `toolshop.selectors.ts`
- Updated all mock data in test files: `source: 'toolshop'`, URLs to `practicesoftwaretesting.com`
- Deleted `amazon.selectors.ts` after confirming zero remaining references

**Lesson Learned:**
After a major migration, run a project-wide search for the old site name and references. Don't rely on TypeScript alone — string values in mock data won't cause type errors but will cause test failures.

---

## Bug #5: Screenshots Added to .gitignore

**AI Tool:** Claude Code (Claude Opus 4)
**Date:** 2026-02-11
**Severity:** High
**Category:** Configuration

**What AI Suggested:**
```gitignore
screenshots/*
!screenshots/.gitkeep
```

**Why It Was Wrong:**
- Checkout screenshots are required proof for the assignment
- The assignment explicitly states that a screenshot of the order confirmation must be submitted
- Ignoring them would result in missing deliverables in the repository

**Correct Solution:**
Removed the screenshots ignore rule entirely. Only `screenshots/debug/` is ignored for temporary files. Proof screenshots are tracked in git.

**Lesson Learned:**
Always verify submission requirements before adding files to `.gitignore`. When the assignment says "submit screenshot proof," those files must be committed.

---

## Statistics

| Category | Count | Fixed |
|----------|-------|-------|
| Automation | 2 | 2 |
| TypeScript / Validation | 2 | 2 |
| Configuration | 1 | 1 |
| **Total** | **5** | **5** |

---

## Summary

All 5 bugs were discovered during development and fixed before submission. The most impactful bugs were related to site migration (Address schema mismatch, leftover Amazon references) and Angular-specific automation behavior (custom password component). The key insight: AI handles code generation well but struggles with cross-cutting concerns — when a change affects multiple layers (like a schema migration), it often updates some files but misses others. Running `tsc --noEmit` and project-wide grep after major changes is essential to catch these gaps.
