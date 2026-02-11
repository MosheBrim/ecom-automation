# ecom-automation

E-commerce automation project using Playwright for web scraping and automated purchasing flow on Amazon.

## Overview

This application automates the complete e-commerce flow:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Search  │───▶│  Scrape  │───▶│  Select  │───▶│   Cart   │───▶│ Checkout │
│  Query   │    │ Products │    │ Product  │    │   Add    │    │ Complete │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                                      │
                                                               ┌──────▼──────┐
                                                               │ Screenshot  │
                                                               │   Proof     │
                                                               └─────────────┘
```

### Features

- **Search**: Enter product query with optional price filter
- **Results**: View scraped products with images, prices, and details
- **Status**: Real-time automation progress tracking
- **Checkout**: Complete purchase flow with screenshot proof

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
│       │   ├── ui/          # Generic components
│       │   └── features/    # Feature components
│       ├── hooks/           # Custom hooks (logic)
│       ├── pages/           # Page components
│       ├── services/        # API client
│       ├── types/           # TypeScript types
│       └── utils/           # Utilities
│
├── backend/                  # Express server
│   └── src/
│       ├── api/             # HTTP routes
│       │   ├── routes/
│       │   ├── middleware/
│       │   └── validators/
│       ├── services/        # Business logic
│       ├── automation/      # Playwright
│       │   ├── selectors/   # DOM selectors
│       │   ├── actions/     # Page actions
│       │   ├── flows/       # Complete flows
│       │   └── factories/   # Browser factory
│       ├── domain/          # Models & types
│       │   ├── models/
│       │   ├── strategies/
│       │   └── validators/
│       └── utils/           # Logger, retry, etc.
│
├── screenshots/              # E2E proof screenshots
├── logs/                     # Application logs
└── docs/                     # Documentation
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

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

# Edit .env with your credentials
# IMPORTANT: Use a test account, never your personal account!
```

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

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 3001 |
| `NODE_ENV` | Environment mode | development |
| `AMAZON_EMAIL` | Amazon test account email | - |
| `AMAZON_PASSWORD` | Amazon test account password | - |
| `HEADLESS` | Run browser headless | false |
| `SLOW_MO` | Slow down automation (ms) | 0 |
| `DEFAULT_TIMEOUT` | Playwright timeout (ms) | 30000 |
| `LOG_LEVEL` | Logging level | info |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

---

## Automation Flow

### 10 Steps of the Automation

| Step | Description | Key Files |
|------|-------------|-----------|
| 1 | Open browser | `BrowserFactory.ts` |
| 2 | Login (if required) | `loginFlow.ts` |
| 3 | Navigate to search | `navigationActions.ts` |
| 4 | Execute search | `searchFlow.ts` |
| 5 | Scrape results | `scrapeActions.ts` |
| 6 | Select product | `ProductSelectionStrategy.ts` |
| 7 | Add to cart | `cartFlow.ts` |
| 8 | Go to checkout | `checkoutFlow.ts` |
| 9 | Fill shipping | `checkoutFlow.ts` |
| 10 | Screenshot proof | `screenshotActions.ts` |

### Product Data Format

```json
{
  "id": "B09V3KXJPB",
  "title": "Example Product Name",
  "price": 299.99,
  "currency": "USD",
  "productUrl": "https://amazon.com/dp/B09V3KXJPB",
  "imageUrl": "https://images-na.ssl-images-amazon.com/...",
  "source": "amazon"
}
```

---

## API Endpoints

### Search Products

```http
POST /api/search
Content-Type: application/json

{
  "query": "laptop",
  "maxPrice": 1000
}
```

### Get Automation Status

```http
GET /api/status/:requestId
```

### Execute Checkout

```http
POST /api/checkout
Content-Type: application/json

{
  "productId": "B09V3KXJPB",
  "shippingAddress": { ... }
}
```

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

## Security Notes

- **NEVER** commit `.env` file
- Use dedicated test accounts
- All credentials in environment variables
- Input validation on all endpoints

---

## License

MIT
