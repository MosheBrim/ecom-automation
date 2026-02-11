import { Page } from 'playwright';
import { createLogger } from '../../utils/logger';
import { withRetry } from '../../utils/withRetry';

const AMAZON_BASE_URL = 'https://www.amazon.com';

export async function navigateToAmazon(
  page: Page,
  requestId: string
): Promise<void> {
  const log = createLogger(requestId).withStep('navigate_to_amazon');
  const startTime = Date.now();

  await withRetry(
    async () => {
      await page.goto(AMAZON_BASE_URL, { waitUntil: 'domcontentloaded' });
    },
    requestId,
    'navigate_to_amazon'
  );

  log.success('Navigated to Amazon homepage', Date.now() - startTime);
}

export async function navigateToProductPage(
  page: Page,
  productUrl: string,
  requestId: string
): Promise<void> {
  const log = createLogger(requestId).withStep('navigate_to_product');
  const startTime = Date.now();

  await withRetry(
    async () => {
      await page.goto(productUrl, { waitUntil: 'domcontentloaded' });
    },
    requestId,
    'navigate_to_product'
  );

  log.success('Navigated to product page', Date.now() - startTime);
}

export async function navigateToCart(
  page: Page,
  requestId: string
): Promise<void> {
  const log = createLogger(requestId).withStep('navigate_to_cart');
  const startTime = Date.now();

  await withRetry(
    async () => {
      await page.goto(`${AMAZON_BASE_URL}/gp/cart/view.html`, {
        waitUntil: 'domcontentloaded',
      });
    },
    requestId,
    'navigate_to_cart'
  );

  log.success('Navigated to cart', Date.now() - startTime);
}

export async function navigateToCheckout(
  page: Page,
  requestId: string
): Promise<void> {
  const log = createLogger(requestId).withStep('navigate_to_checkout');
  const startTime = Date.now();

  await withRetry(
    async () => {
      await page.goto(`${AMAZON_BASE_URL}/gp/buy/spc/handlers/display.html`, {
        waitUntil: 'domcontentloaded',
      });
    },
    requestId,
    'navigate_to_checkout'
  );

  log.success('Navigated to checkout', Date.now() - startTime);
}
