# ecom-automation - Project Conventions

## Project Context

E-commerce automation project for Amazon. Searches products, scrapes data, adds to cart, and completes checkout with screenshot proof.

## Architecture

```
Frontend (React)  →  API (Express)  →  Automation (Playwright)
     ↓                    ↓                    ↓
   UI only          Business Logic       Browser Control
```

### Layer Responsibilities

| Layer | Location | Does | Does NOT |
|-------|----------|------|----------|
| UI Components | `frontend/src/components/` | Render UI, receive props | API calls, business logic |
| UI Hooks | `frontend/src/hooks/` | State, handlers, API calls | UI rendering |
| API Routes | `backend/src/api/` | HTTP handling, validation | Business logic |
| Services | `backend/src/services/` | Business logic, orchestration | HTTP, Playwright direct |
| Automation | `backend/src/automation/` | Playwright browser control | Business decisions |
| Domain | `backend/src/domain/` | Types, models, validation | Side effects |

## Code Style

### General Rules
- TypeScript strict mode - no `any`
- No comments - use clear naming instead
- English only - no i18n needed
- Simple over clever

### Component Pattern
```tsx
// Component: UI only
function SearchForm({ query, onSubmit, isLoading }: SearchFormProps) {
  return <form>...</form>;
}

// Hook: All logic
function useSearchForm() {
  const [query, setQuery] = useState('');
  const mutation = useSearchMutation();
  return { query, setQuery, onSubmit: mutation.mutate, isLoading: mutation.isPending };
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `SearchForm.tsx` |
| Hooks | use + PascalCase | `useSearchForm.ts` |
| Services | PascalCase + Service | `SearchService.ts` |
| Types | PascalCase | `Product.ts` |
| Utils | camelCase | `formatPrice.ts` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES` |

### File Structure
```
Feature/
├── FeatureName.tsx      # Component (UI only)
├── useFeatureName.ts    # Hook (logic)
└── index.ts             # Barrel export
```

## Automation Rules

### No Sleep - Explicit Waits Only
```ts
// BAD
await page.waitForTimeout(3000);

// GOOD
await page.waitForSelector('.product-card', { state: 'visible', timeout: 5000 });
```

### Selectors in Dedicated Files
```ts
// automation/selectors/amazon.selectors.ts
export const AMAZON_SELECTORS = {
  searchBox: '#twotabsearchtextbox',
  searchButton: '#nav-search-submit-button',
  productCard: '[data-component-type="s-search-result"]',
};
```

### Retry Pattern
```ts
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Retry failed');
}
```

## Logging (Observability)

Every operation must log:
```ts
logger.info('Step completed', {
  requestId: 'uuid',
  step: 'search',
  duration: 1234,
  status: 'success'
});
```

## Security

- NEVER hardcode credentials
- Use `.env` for secrets
- `.env` is in `.gitignore`
- Use `.env.example` for documentation

## Testing

- Unit tests: Domain logic (price normalization, product selection)
- E2E test: Full flow must produce screenshot in `screenshots/`

## Before Committing

- [ ] No `any` types
- [ ] No `console.log` (use logger)
- [ ] No hardcoded values
- [ ] Types are explicit
- [ ] Tests pass
