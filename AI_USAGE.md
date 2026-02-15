# AI Usage Documentation

## Overview

This document provides full transparency about AI tool usage during the development of this e-commerce automation project, as required by the assignment.

---

## AI Tools Used

| Tool | Model | Purpose |
|------|-------|---------|
| Claude Code (VS Code Extension) | Claude Opus 4 | Architecture design, code generation, testing, code review, debugging |

---

## Prompts Used During Development

### Prompt 1: Redesign Checkout to Fully Automated Background Flow

```
The current implementation requires the user to fill in checkout details manually through
a form. This doesn't match the assignment requirements. I need the following changes:

- The browser should run behind the scenes (headless) — the user should never see it
- The user should NOT enter shipping address or payment details — everything must be
  automated using default values from environment variables
- The flow should be: enter search query → see scraped products → click "Buy" →
  see real-time status page showing each automation step with duration → see final
  result with screenshot proof
- The checkout API should be async: return a requestId immediately, run checkout in
  the background, and let the frontend poll for status updates
- Each automation step must be tracked with timestamps and durations for the status timeline

Delete the CheckoutForm component and any user-facing checkout UI. Design everything
at the highest quality level to match 100/100 on the assignment.
```

**Outcome:** AI successfully restructured the entire application — removed CheckoutForm, created async checkout API with `requestId` polling, added StatusPage with real-time timeline, and ResultPage with screenshot proof. The CheckoutService now reads shipping address and payment method from `.env` variables. One issue: the login flow got stuck on the Toolshop site because the password field uses a custom Angular component (see [README_AI_BUGS.md](./README_AI_BUGS.md#bug-2-login-stuck-on-toolshops-custom-password-component) for details).

---

### Prompt 2: Migrate Automation Target from Amazon to practicesoftwaretesting.com

```
The project was originally built for Amazon but I need to switch to
practicesoftwaretesting.com (Toolshop) because I can't demo payment on Amazon.
I need you to adapt everything to the new site so it works perfectly, as if it was
built from scratch for this site:

- Rewrite all selectors using the site's data-test attributes
- Rewrite all automation flows (login, search, cart, checkout) for the Toolshop site
- The checkout on Toolshop is a 4-step wizard: Cart → Sign In → Address → Payment
- Update the Address schema (Toolshop uses street/city/state/country/postalCode)
- Update all tests with correct mock data for the new site
- Delete the old amazon.selectors.ts file
- Use DOM scraping only — no API calls to the target site

Here is the HTML of each page on the site: [provided login, products, product detail,
and checkout page HTML].
```

**Outcome:** AI rewrote 20+ files — new `toolshop.selectors.ts` with all `data-test` attributes, all automation flows adapted to Toolshop's Angular-based UI, new Address schema, updated tests. Issues found: some files still referenced Amazon selectors after migration, and the Address type mismatch caused TypeScript errors across 8+ files (see [README_AI_BUGS.md](./README_AI_BUGS.md#bug-3-address-schema-mismatch-after-site-migration) for details).

---

### Prompt 3: Modern UI Redesign for All Pages and Components

```
Redesign all pages with a modern, clean UI. The current design looks too basic.
I want each page to feel polished — proper spacing, visual hierarchy, card layouts,
icons where appropriate. Use shadcn/ui components as the base.

Pages to redesign:
- SearchPage: sidebar layout with search form on the left, product grid on the right
- ProductCard: hover effects, image scaling, stock badges, star ratings
- StatusPage: show automation progress with a timeline of steps
- ResultPage: order summary with screenshot proof display

Add an automatic/manual mode toggle for the search — automatic mode should auto-buy
the best product based on the selection strategy, manual mode lets the user pick.
```

**Outcome:** AI redesigned all 4 pages and their sub-components. SearchPage got a sidebar layout (380px left panel + flexible grid). ProductCard received hover shadow/border effects, image scale animations, in-stock/out-of-stock badges, and star ratings with review counts. Added Zap/MousePointerClick icons for auto/manual mode toggle with strategy selector dropdown. All components use Lucide React icons for consistent iconography. The design was significantly more polished but still needed color theming (addressed in Prompt 5).

---

### Prompt 4: Implement Real E2E Tests Against the Live Site

```
The current tests are all mocked unit tests. I need a real E2E test that runs
against the live practicesoftwaretesting.com site and proves the entire automation
flow works end-to-end:

- Search for a product, extract results, select the cheapest
- Navigate to the product page and add to cart
- Go through the full checkout: login → shipping → payment → confirm
- Take a screenshot of the order confirmation as proof
- The test should have a generous timeout since it hits a real site
- Use the same automation flows the app uses (not separate test-only code)
```

**Outcome:** AI created a comprehensive E2E test file (`e2e.test.ts`, 439 lines) with 11 test suites covering browser factory, screenshots, navigation, form interactions, product selection, checkout simulation, context management, and the full live-site flow. The full E2E test runs against practicesoftwaretesting.com with a 120-second timeout: searches "pliers" → selects cheapest → adds to cart → logs in → fills shipping → selects bank transfer → confirms order → takes screenshot proof. Uses `pressSequentially` for Angular form inputs and `Promise.race` for search results fallback.

---

### Prompt 5: Implement Color Theming with CSS Variables

```
I want to update the design with nice color tones. Don't hardcode colors — define
them in a single file using CSS variables so I can change the entire color scheme
by editing one place. Follow the convention for where to define theme colors
(your decision which file — I think there are conventions for this).

I like modern indigo/purple tones.
```

**Outcome:** AI correctly set up CSS custom properties in `index.css` (the shadcn/ui convention) with HSL-based color variables for primary, accent, background, success, and destructive colors. Extended `tailwind.config.js` to reference these variables. All components now use theme tokens (`bg-primary`, `text-accent`) instead of hardcoded colors. Required 3 iterations to find the right palette — first two attempts (warm taupe and amber/cognac) didn't look good before settling on indigo/purple.

---

### Prompt 6: Redesign StatusPage with Circular Progress Ring and Step Timeline

```
The StatusPage needs to look more impressive. Instead of a simple progress bar,
I want a circular progress ring that fills up as steps complete. Show the percentage
in the center of the ring.

Next to it, show a vertical timeline of all 9 checkout steps — completed steps
get a green checkmark, the current step gets a spinning indicator, and pending
steps are grayed out. Each completed step should show how long it took.

When the checkout finishes, auto-redirect to the result page after a short delay.
```

**Outcome:** AI built an SVG-based circular progress ring (radius 54px, 700ms smooth animation) with dynamic color changes: indigo while running, green on success, red on failure. The center shows percentage during progress, a CheckCircle icon on success, or XCircle on failure. The right panel displays a vertical step timeline for all 9 automation steps (initializing → opening_browser → logging_in → adding_to_cart → checkout → filling_shipping → filling_payment → confirming_order → taking_screenshot). Each step shows its duration once completed. A real-time elapsed timer updates every 100ms. Auto-redirects to ResultPage after 1.5 seconds on completion. Responsive layout: 2-column on desktop, stacked on mobile.

---

### Prompt 7: Add Structured Logging with Request Tracing

```
I need proper logging throughout the automation — not just console.log. Every step
should be logged with:
- requestId to trace the entire flow
- step name (e.g., "adding_to_cart", "filling_shipping")
- duration in milliseconds
- status (success or error)

Use Winston for the logger. Logs should go to both console (colorized) and a file.
The logger should be easy to use — create it once with a requestId and then just
call log.info(), log.error() etc.
```

**Outcome:** AI implemented a structured Winston logger in `utils/logger.ts` with dual transports: colorized console output and rotating file logs (5MB max, 5 files retained). The `createLogger(requestId)` factory creates a logger instance bound to a request. Added a fluent `.withStep('step_name')` API for step-based logging with automatic duration tracking via `.success(message, durationMs)`. Log format: `TIMESTAMP [LEVEL] [requestId=xxx step=yyy duration=123ms status=success] MESSAGE`. Integrated logging into all automation flows: `cartFlow.ts`, `checkoutFlow.ts`, `loginFlow.ts`, and both orchestrators.

---

### Prompt 8: Full Code Review and Assignment Compliance Check

```
Go through the code again, check that the code is clean and working with no issues.
Also do a general review of the entire project — is there anything you would change,
or is it perfect for the assignment I received? After that, push to the branch.
```

**Outcome:** AI ran TypeScript type-checking on both frontend and backend, ran all 129 unit tests (all passing), and identified one critical backend issue: the `selectionStrategy` field was missing from the Zod validation schema, causing TypeScript compile errors (TS2345). Fixed by adding `selectionStrategy` to `SearchRequestSchema`. Also found and fixed hardcoded `green-500` colors that should use the theme's `success` variable (see [README_AI_BUGS.md](./README_AI_BUGS.md#bug-1-selectionstrategy-stripped-by-zod-validation) for details).

---

### Prompt 9: Debug Stuck Login During Checkout Automation

```
There's a problem with the login — it can't log in. Why?
[Attached screenshots of the stuck login page and the frozen status page]
```

**Outcome:** AI investigated the login flow and found the issue. The Toolshop site uses a custom Angular `password-input` component (`<app-password-input>`) where the `<input>` element is nested inside a wrapper. Playwright's standard `fill()` method didn't trigger Angular's change detection on this component, so the form validator never registered the password — the login button stayed disabled and the automation hung indefinitely. Fixed by switching to `pressSequentially()` with a 10ms delay between keystrokes, which correctly triggers Angular's `(input)` event listeners. Also discovered the login happens during the checkout wizard (step 2), not on a separate page (see [README_AI_BUGS.md](./README_AI_BUGS.md#bug-2-login-stuck-on-toolshops-custom-password-component) for details).

---

### Prompt 10: Prepare Project Documentation for Submission

```
Go through the project and prepare everything for submission:
- Update AI_USAGE.md with real prompts from our development sessions (polished English)
- Update README_AI_BUGS.md with real bugs we encountered
- Update README.md to be submission-quality
- Remove screenshots from .gitignore so proof files get committed
- Delete all old screenshots and generate fresh E2E proof
- Verify all tests pass
```

**Outcome:** AI updated all three documentation files with real data extracted from previous development sessions. Removed the `screenshots` ignore rule from `.gitignore` (keeping only `screenshots/debug/` for temp files). Deleted 54 old screenshot files and ran the full E2E test suite to generate a fresh checkout proof screenshot. Verified all 129 unit tests pass across 10 test files. The initial attempt used fabricated prompts and bugs — the user caught this and provided the actual chat logs, which were then used to write authentic documentation.

---

## Security Measures — Preventing Secret Leakage

| Measure | Implementation |
|---------|---------------|
| Environment variables | All credentials in `.env` only — never hardcoded in source |
| Git protection | `.env` in `.gitignore` — verified before every commit |
| Safe example file | `.env.example` contains public demo credentials from practicesoftwaretesting.com |
| Input validation | Zod schemas validate all API input before it reaches business logic |
| Log sanitization | Logger does not output passwords or payment details |
| Prompt safety | Never pasted real credentials into AI prompts — used placeholder values |
| Code review | Reviewed every AI-generated file for hardcoded secrets before committing |

For detailed AI bug documentation, see [README_AI_BUGS.md](./README_AI_BUGS.md).

---

## Statistics

| Metric | Count |
|--------|-------|
| Total AI prompts used | 10+ |
| Prompts that needed correction | 4 |
| Bugs found and fixed | 5 |
| Total tests (unit + E2E) | 129 |
| Files created/rewritten by AI | 40+ |

---

## Lessons Learned

| Area | Lesson |
|------|--------|
| Automation | Never use `waitForTimeout` — always wait for specific DOM conditions |
| Selectors | Use `data-test` attributes, not CSS classes — they survive UI redesigns |
| Angular sites | Custom components may need `pressSequentially` instead of `fill()` for proper change detection |
| Migration | When switching target sites, audit ALL files for old references — type errors propagate across layers |
| Zod validation | Fields not in the schema get stripped silently — always verify the validated output matches what downstream code expects |
| Theming | Use CSS custom properties with HSL values for flexible theming — avoids hardcoded colors scattered across components |
| Logging | Structured logs with requestId enable end-to-end tracing of automation flows |
| E2E testing | Test against the real site, not just mocks — catches issues mocks can't simulate (Angular change detection, async loading) |
| AI documentation | Always verify AI-generated documentation against real data — AI will fabricate plausible-looking content if not given real source material |
| Process | Always run `tsc --noEmit` before committing — catches type mismatches early |
