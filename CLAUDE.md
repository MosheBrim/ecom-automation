# ecom-automation - Project Conventions

## Project Context

E-commerce automation for practicesoftwaretesting.com (Toolshop): Search → Scrape → Cart → Checkout → Screenshot proof.

---

## Architecture

```
Frontend (React)  →  API (Express)  →  Services  →  Automation (Playwright)
```

### Layer Rules

| Layer | Location | Does | Does NOT |
|-------|----------|------|----------|
| Components | `frontend/src/components/` | Render UI only | API calls, logic |
| Hooks | `frontend/src/hooks/` | State, API calls | UI rendering |
| API Routes | `backend/src/api/` | HTTP, validation | Business logic |
| Services | `backend/src/services/` | Business logic | HTTP, Playwright |
| Automation | `backend/src/automation/` | Browser control | Business decisions |
| Domain | `backend/src/domain/` | Types, models | Side effects |

---

## Design Patterns to Use

- **Strategy** → Product selection (cheapest/first/custom)
- **Factory** → Browser instance creation
- **Repository** → Data access abstraction
- **Builder** → Complex object construction (Order)

---

## Code Rules

### No Comments - Self-Documenting Code
- **No comments in code** - use clear naming instead
- Variable/function names should explain what they do
- If code needs a comment to be understood, refactor it

### Config & MD Files
- Comments only when absolutely necessary
- Keep comments short and professional
- No explanatory paragraphs - just essential info

### TypeScript
- Strict mode - **no `any`**
- Explicit return types on all functions
- Zod for runtime validation

### Naming

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase | `SearchForm.tsx` |
| Hooks | usePascalCase | `useSearch.ts` |
| Services | PascalCaseService | `SearchService.ts` |
| Selectors | SCREAMING_SNAKE | `TOOLSHOP_SELECTORS` |

### DRY - Extract When Used Twice
- `withRetry()` → Retry logic
- `withTimeout()` → Timeout wrapper
- `formatPrice()` → Price formatting
- `createLogger()` → Logger with requestId

---

## Automation Rules (35% of grade)

### No Sleep - EVER
```ts
// ❌ FORBIDDEN
await page.waitForTimeout(3000);

// ✅ REQUIRED
await page.waitForSelector('.selector', { state: 'visible', timeout: 10000 });
```

### Selectors in Dedicated Files
All selectors in `automation/selectors/` - never inline.

### Retry with Backoff
All fragile operations use `withRetry()` utility.

---

## Logging (Observability)

Every log MUST include:
- `requestId` - Trace identifier
- `step` - Current step name
- `duration` - Time in ms
- `status` - success/error

---

## API Response Format

```ts
// Success
{ success: true, data: {...}, meta: { requestId, timestamp } }

// Error
{ success: false, error: { code, message }, meta: { requestId, timestamp } }
```

---

## Security

- Credentials in `.env` only
- `.env` in `.gitignore`
- Validate all input with Zod

---

## Testing

### Naming
- Files: `{FileName}.test.ts`
- Cases: `should [behavior] when [condition]`

### Coverage Priority
- Services: 80%
- Utils: 90%
- Domain: 70%

### E2E Must Include
- Full flow: Search → Cart → Checkout
- Screenshot saved to `screenshots/`

---

## Error Handling

- Custom errors extend `AppError` base class
- Errors include: `code`, `message`, `step`, `isRetryable`
- API returns consistent error format

---

## Before Commit

- [ ] No `any` types
- [ ] No `console.log` (use logger)
- [ ] No hardcoded values
- [ ] No duplicate code
- [ ] Tests pass
