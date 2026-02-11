# ecom-automation

E-commerce automation project using Playwright for web scraping and automated purchasing flow.

## Overview

This application automates the process of:
1. Searching for products on Amazon
2. Scraping and normalizing product data
3. Adding products to cart
4. Completing the checkout process
5. Capturing screenshots as proof

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + TypeScript |
| Backend | Express + TypeScript |
| Automation | Playwright |
| Styling | TailwindCSS + shadcn/ui |
| Validation | Zod |
| Testing | Vitest + Playwright |

## Project Structure

```
ecom-automation/
├── frontend/          # React UI
├── backend/           # Express API + Playwright automation
├── docs/              # Documentation
└── screenshots/       # E2E test screenshots
```

## Getting Started

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start backend
cd backend && npm run dev

# Start frontend (new terminal)
cd frontend && npm run dev
```

## Documentation

- [AI_USAGE.md](./AI_USAGE.md) - AI tools usage documentation
- [CLAUDE.md](./CLAUDE.md) - Project conventions for AI assistance

## License

MIT
