import { Page } from 'playwright';
import { createLogger } from '../../utils/logger';
import { withRetry } from '../../utils/withRetry';

const TOOLSHOP_BASE_URL = process.env.SITE_URL ?? 'https://practicesoftwaretesting.com';

export async function navigateToHome(
  page: Page,
  requestId: string
): Promise<void> {
  const log = createLogger(requestId).withStep('navigate_to_home');
  const startTime = Date.now();

  await withRetry(
    async () => {
      await page.goto(TOOLSHOP_BASE_URL, { waitUntil: 'domcontentloaded' });
    },
    requestId,
    'navigate_to_home'
  );

  log.success('Navigated to Toolshop homepage', Date.now() - startTime);
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
      await page.goto(`${TOOLSHOP_BASE_URL}/checkout`, {
        waitUntil: 'domcontentloaded',
      });
    },
    requestId,
    'navigate_to_cart'
  );

  log.success('Navigated to cart/checkout', Date.now() - startTime);
}
