# ecom-automation

E-commerce automation project using Playwright for web scraping and automated purchasing flow on practicesoftwaretesting.com (Toolshop).

## Overview

A web application that automates the complete e-commerce flow. The user searches for products, sees results scraped from the target site, clicks "Buy", and the automation handles everything else (login, cart, shipping, payment, screenshot proof) in the background.

```
User Flow:

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Search  │───▶│  Results  │───▶│  Status  │───▶│  Result  │
│  Query   │    │ + Buy Btn │    │ Timeline │    │ + Proof  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     UI              UI           Real-time        Final
                                  Tracking        Summary

Automation (behind the scenes):

┌────────┐  ┌───────┐  ┌──────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐
│ Browser│─▶│ Login │─▶│ Cart │─▶│ Shipping │─▶│ Payment  │─▶│ Screenshot │
│  Open  │  │       │  │  Add │  │   Fill   │  │ Confirm  │  │   Proof    │
└────────┘  └───────┘  └──────┘  └──────────┘  └──────────┘  └────────────┘
```

### Screens

1. **Search** - Enter product query + optional filters (price range, sort, selection strategy)
2. **Results** - Grid of scraped products with images, prices, ratings. Each has a "Buy" button
3. **Status** - Real-time automation timeline showing each step, duration, and progress
4. **Result** - Order details, automation timeline summary, and screenshot proof

### Key Design Decisions

- **Fully automated checkout** - User only enters search query and clicks Buy. Shipping address and payment details come from environment variables
- **Headless browser** - Automation runs invisibly in the background (configurable via `HEADLESS` env var)
- **Async checkout API** - Returns requestId immediately, frontend polls for status updates
- **Step-by-step tracking** - Each automation step is tracked with timestamps and durations

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 + Vite + TypeScript | User interface |
| State | TanStack Query | Server state management |
| Styling | TailwindCSS + shadcn/ui | UI components |
| Backend | Express + TypeScript | API server |
| Automation | Playwright | Browser control |
| Validation | Zod | Schema validation |
| Logging | Winston | Structured logging |
| Testing | Vitest + Playwright | Unit + E2E tests |

---

## Project Structure

```
ecom-automation/
├── frontend/                 # React application
│   └── src/
│       ├── components/       # UI components
│       │   ├── ui/          # Generic components (shadcn/ui)
│       │   ├── features/    # Feature components
│       │   └── layout/      # Layout wrapper
│       ├── hooks/           # Custom hooks (useBuy, useSearch, useStatus)
│       ├── pages/           # Page components (Search, Status, Result)
│       ├── services/        # API client
│       ├── types/           # TypeScript types
│       └── utils/           # Utilities (formatters)
│
├── backend/                  # Express server
│   └── src/
│       ├── api/             # HTTP routes + validators
│       ├── services/        # Business logic
│       ├── automation/      # Playwright automation
│       │   ├── selectors/   # DOM selectors
│       │   ├── actions/     # Page actions
│       │   ├── flows/       # Multi-step flows
│       │   ├── factories/   # Browser factory
│       │   └── orchestrators/ # Flow orchestrators
│       ├── domain/          # Models, strategies, validators
│       └── utils/           # Logger, retry, etc.
│
├── screenshots/              # Checkout proof screenshots
└── logs/                     # Application logs
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ecom-automation.git
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

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `SITE_EMAIL` | Toolshop test account email | `customer@practicesoftwaretesting.com` |
| `SITE_PASSWORD` | Toolshop test account password | `welcome01` |
| `HEADLESS` | Run browser headless (no UI) | `true` |
| `SHIPPING_STREET` | Default shipping street | `123 Test Street` |
| `SHIPPING_CITY` | Default shipping city | `New York` |
| `SHIPPING_STATE` | Default shipping state | `NY` |
| `SHIPPING_COUNTRY` | Default shipping country | `US` |
| `SHIPPING_POSTAL_CODE` | Default shipping postal code | `10001` |
| `PAYMENT_METHOD` | Default payment method | `bank-transfer` |

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

| Step | Description | Key Files |
|------|-------------|-----------|
| 1 | Open headless browser | `BrowserFactory.ts` |
| 2 | Login to site | `loginFlow.ts` |
| 3 | Navigate to product page | `navigationActions.ts` |
| 4 | Add product to cart | `cartFlow.ts` |
| 5 | Proceed to checkout | `cartFlow.ts` |
| 6 | Fill shipping address (from .env) | `checkoutFlow.ts` |
| 7 | Fill payment details (from .env) | `checkoutFlow.ts` |
| 8 | Confirm order | `checkoutFlow.ts` |
| 9 | Take screenshot proof | `screenshotActions.ts` |

### Product Data Format

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
  "maxPrice": 50,
  "selectionStrategy": "cheapest"
}
```

### Buy Product (Async)

```http
POST /api/checkout
Content-Type: application/json

{
  "product": { "id": "...", "title": "...", "price": 14.15, ... }
}
```

Returns immediately with `{ requestId }`. Checkout runs in background.

### Get Automation Status

```http
GET /api/status/:requestId
```

Returns current step, progress %, step history with durations, and result when completed.

---

## Testing

### Unit Tests

```bash
cd backend
npm test
```

### E2E Tests

```bash
cd backend
npm run test:e2e
```

E2E tests produce screenshots in `screenshots/` directory.

---

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Project conventions and patterns
- [AI_USAGE.md](./AI_USAGE.md) - AI tools usage documentation
- [README_AI_BUGS.md](./README_AI_BUGS.md) - AI mistakes and corrections

---

## Security

- **NEVER** commit `.env` file - contains credentials
- Use dedicated test accounts only
- All credentials stored in environment variables
- Input validation on all endpoints via Zod schemas

---

## License

MIT
