# ecom-automation

E-commerce automation application using Playwright for automated purchasing on [practicesoftwaretesting.com](https://practicesoftwaretesting.com) (Toolshop).

**Flow:** Search → Scrape Results → Add to Cart → Checkout → Screenshot Proof

---

## Overview

A web application that automates the complete e-commerce checkout flow on practicesoftwaretesting.com. The user enters a search query, sees scraped product results, and the system handles everything else — login, cart, shipping, payment, and screenshot proof — in the background using a headless browser.

All displayed data comes from the automation layer via DOM scraping — no external API calls.

The application supports two purchase modes:

- **Automatic Mode** (default) — After search results load, the system automatically selects a product based on the chosen strategy (cheapest, first result, or highest rated) and triggers the checkout flow after a configurable delay
- **Manual Mode** — The user browses the scraped results and clicks "Buy Now" on a specific product to trigger checkout

```
User Flow:

┌──────────┐    ┌──────────────┐    ┌──────────┐    ┌──────────┐
│  Search  │───▶│   Results    │───▶│  Status  │───▶│  Result  │
│  Query   │    │ Auto / Manual│    │ Timeline │    │ + Proof  │
└──────────┘    └──────────────┘    └──────────┘    └──────────┘

Automation (behind the scenes):

┌────────┐  ┌───────┐  ┌──────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐
│Browser │─▶│ Login │─▶│ Cart │─▶│ Shipping │─▶│ Payment  │─▶│ Screenshot │
│  Open  │  │       │  │  Add │  │   Fill   │  │ Confirm  │  │   Proof    │
└────────┘  └───────┘  └──────┘  └──────────┘  └──────────┘  └────────────┘
```

### Screens

1. **Search** — Enter product query + optional advanced filters (min/max price, sort order). Toggle between Automatic and Manual purchase mode. In automatic mode, select a strategy (cheapest, first result, highest rated)
2. **Results** — Grid of scraped products with images, prices, ratings, and stock status. In manual mode, each product has a "Buy Now" button. In automatic mode, the best product is purchased after a short delay
3. **Status** — Real-time automation timeline with a circular progress ring showing percentage, elapsed time, and each step's duration. Steps display green checkmarks (done), spinning indicator (active), or gray dots (pending)
4. **Result** — Order summary with product details, automation timeline with durations, and screenshot proof of the completed checkout

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 + Vite + TypeScript | User interface |
| State | TanStack Query | Server state management + polling |
| Styling | TailwindCSS + shadcn/ui | UI components + theming |
| Icons | Lucide React | Consistent iconography |
| Backend | Express + TypeScript | API server |
| Automation | Playwright | Headless browser control + DOM scraping |
| Validation | Zod | Runtime schema validation |
| Logging | Winston | Structured logging with requestId tracing |
| Testing | Vitest + Playwright | Unit, service, and E2E tests |

---

## Project Structure

```
ecom-automation/
├── frontend/                    # React application
│   └── src/
│       ├── components/          # UI components
│       │   ├── ui/             # Generic (shadcn/ui)
│       │   ├── features/       # Feature components (SearchForm, ProductCard, etc.)
│       │   └── layout/         # Layout wrapper
│       ├── hooks/              # Custom hooks (useSearch, useBuy, useStatus)
│       ├── pages/              # Page components (SearchPage, StatusPage, ResultPage)
│       ├── services/           # API client
│       ├── types/              # TypeScript type definitions
│       └── utils/              # Formatters and helpers
│
├── backend/                     # Express API server
│   └── src/
│       ├── api/                # HTTP routes + request validators + middleware
│       ├── services/           # Business logic (SearchService, CheckoutService, StatusService)
│       ├── automation/         # Playwright automation
│       │   ├── selectors/      # Centralized DOM selectors (TOOLSHOP_SELECTORS)
│       │   ├── actions/        # Atomic page actions (navigate, scrape, screenshot)
│       │   ├── flows/          # Multi-step flows (login, search, cart, checkout)
│       │   ├── factories/      # Browser factory (singleton)
│       │   └── orchestrators/  # Flow coordination (search, checkout)
│       ├── domain/             # Models, strategies, validators, errors
│       └── utils/              # Logger, withRetry, withTimeout, formatPrice
│
├── screenshots/                 # Checkout proof screenshots (committed to git)
└── logs/                        # Application logs (gitignored)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ecom-automation

# Install backend dependencies
cd backend
npm install
npx playwright install chromium

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

```bash
# Copy environment template
cp .env.example .env
```

The `.env.example` file contains the public demo credentials for practicesoftwaretesting.com:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `PORT` | Backend server port | `3001` |
| `SITE_EMAIL` | Toolshop demo account | `customer@practicesoftwaretesting.com` |
| `SITE_PASSWORD` | Toolshop demo password | `welcome01` |
| `SITE_URL` | Target site URL | `https://practicesoftwaretesting.com` |
| `HEADLESS` | Run browser without UI | `true` |
| `SLOW_MO` | Delay between Playwright actions (ms) | `0` |
| `DEFAULT_TIMEOUT` | Playwright action timeout (ms) | `30000` |
| `SHIPPING_STREET` | Default shipping street | `123 Test Street` |
| `SHIPPING_CITY` | Default shipping city | `New York` |
| `SHIPPING_STATE` | Default shipping state | `NY` |
| `SHIPPING_COUNTRY` | Default shipping country | `US` |
| `SHIPPING_POSTAL_CODE` | Default postal code | `10001` |
| `PAYMENT_METHOD` | Payment method | `bank-transfer` |
| `LOG_LEVEL` | Logging verbosity | `info` |
| `LOG_FILE` | Log file path | `logs/app.log` |
| `SCREENSHOTS_DIR` | Screenshot output directory | `screenshots` |
| `FRONTEND_URL` | CORS origin for frontend | `http://localhost:5173` |
| `VITE_AUTO_BUY_DELAY_MS` | Auto-buy delay after search (ms) | `1500` |

Supported payment methods: `bank-transfer`, `credit-card`, `cash-on-delivery`.

### Running the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Automation Flow

### 9 Steps of the Checkout Automation

| Step | Name | Description | Key File | Wait Strategy |
|------|------|-------------|----------|---------------|
| 1 | `initializing` | Initialize automation context | `CheckoutService.ts` | Instant |
| 2 | `opening_browser` | Launch headless Chromium | `BrowserFactory.ts` | Browser ready event |
| 3 | `logging_in` | Login to Toolshop account | `loginFlow.ts` | `waitForSelector` on login form |
| 4 | `adding_to_cart` | Navigate to product + add to cart | `cartFlow.ts` | `waitForFunction` on cart quantity |
| 5 | `checkout` | Proceed to checkout wizard | `cartFlow.ts` | `waitForSelector` on proceed button |
| 6 | `filling_shipping` | Fill shipping address fields | `checkoutFlow.ts` | `waitForSelector` on address form |
| 7 | `filling_payment` | Select payment method + fill details | `checkoutFlow.ts` | `waitForSelector` on payment form |
| 8 | `confirming_order` | Confirm order and wait for success | `checkoutFlow.ts` | `waitForSelector` on success message |
| 9 | `taking_screenshot` | Capture checkout proof screenshot | `screenshotActions.ts` | Page fully loaded |

All selectors are centralized in `automation/selectors/toolshop.selectors.ts`.
All fragile operations use `withRetry()` with exponential backoff.

### Product Data Format (Normalized)

```json
{
  "id": "01JKAT24YE2QBP2HXMQ02B67HM",
  "title": "Combination Pliers",
  "price": 14.15,
  "currency": "USD",
  "productUrl": "https://practicesoftwaretesting.com/product/01JKAT24YE2QBP2HXMQ02B67HM",
  "imageUrl": "https://practicesoftwaretesting.com/assets/img/products/pliers02.jpeg",
  "source": "toolshop"
}
```

---

## API Endpoints

### Search Products

```http
POST /api/search
Content-Type: application/json

{
  "query": "pliers",
  "sortBy": "relevance",
  "maxPrice": 50,
  "minPrice": 5,
  "selectionStrategy": "cheapest",
  "limit": 20
}
```

**Response:**
```json
{
  "success": true,
  "data": { "products": [...], "selectedProduct": {...} },
  "meta": { "requestId": "...", "timestamp": "...", "totalProducts": 12 }
}
```

### Buy Product (Async)

```http
POST /api/checkout
Content-Type: application/json

{
  "product": { "id": "...", "title": "...", "price": 14.15, ... },
  "quantity": 1
}
```

Returns immediately with `{ requestId }`. Checkout runs in background.

### Get Automation Status

```http
GET /api/status/:requestId
```

Returns current step, progress %, step history with durations, and result when completed.

---

## Design Patterns

| Pattern | Usage | File |
|---------|-------|------|
| **Strategy** | Product selection (cheapest, first, highest-rated, best-value) | `ProductSelectionStrategy.ts` |
| **Factory** | Browser instance management (singleton with `getInstance()`) | `BrowserFactory.ts` |
| **Builder** | Order construction with validation | `Order.ts` |

---

## Testing

### Unit Tests

```bash
cd backend
npm test
```

Tests cover: `formatPrice`, `withRetry`, `withTimeout`, `OrderBuilder`, `ProductSelectionStrategy`, `AppError`, `SearchService`, `CheckoutService`, `StatusService`.

### E2E Tests

```bash
cd backend
npm run test:e2e
```

The E2E test runs a **complete flow against the live site** (120s timeout): search "pliers" → select cheapest → navigate to product → add to cart → login with `pressSequentially` → fill shipping address → select bank transfer payment → confirm order → take screenshot proof.

Screenshot proof is saved to `screenshots/`.

### Test Summary

| Category | Test Files | Tests |
|----------|-----------|-------|
| Utils (formatPrice, withRetry, withTimeout) | 3 | 34 |
| Domain (AppError, Order, ProductSelectionStrategy) | 3 | 43 |
| Services (Search, Checkout, Status) | 3 | 37 |
| E2E (full automation flow against live site) | 1 | 15 |
| **Total** | **10** | **129** |

---

## Observability

Every automation step is logged with structured data via Winston:

```
2026-02-15 09:30:00.123 [INFO] [requestId=abc-123 step=fill_shipping duration=2340ms status=success] Shipping address filled
```

**Log fields:** `requestId` (trace), `step` (current operation), `duration` (ms), `status` (success/error).

**Transports:** Colorized console + rotating file logs (5MB max, 5 files retained).

The frontend displays a real-time status timeline with a circular progress ring, showing completed steps, current step with spinner, and durations.

---

## Documentation

| File | Description |
|------|-------------|
| [CLAUDE.md](./CLAUDE.md) | Project conventions and coding standards |
| [AI_USAGE.md](./AI_USAGE.md) | AI tools usage, prompts, and security measures |
| [README_AI_BUGS.md](./README_AI_BUGS.md) | AI-generated bugs and corrections |

---

## Security

- All credentials stored in `.env` (gitignored) — never hardcoded
- `.env.example` provides safe default values for the demo site
- All API input validated with Zod schemas
- No sensitive data in logs or error messages
- Screenshots taken only on the confirmation page (no credential fields visible)
