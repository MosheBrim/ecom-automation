import { Page } from 'playwright';
import { AMAZON_SELECTORS } from '../selectors/amazon.selectors';
import { createLogger } from '../../utils/logger';
import { withRetry } from '../../utils/withRetry';
import { navigateToProductPage, navigateToCart } from '../actions/navigationActions';
import { AutomationError } from '../../domain/errors/AppError';

export async function addToCart(
  page: Page,
  productUrl: string,
  quantity: number,
  requestId: string
): Promise<void> {
  const log = createLogger(requestId).withStep('add_to_cart');
  const startTime = Date.now();

  await navigateToProductPage(page, productUrl, requestId);

  await withRetry(
    async () => {
      await page.waitForSelector(AMAZON_SELECTORS.PRODUCT_PAGE.ADD_TO_CART_BUTTON, {
        state: 'visible',
        timeout: 10000,
      });

      if (quantity > 1) {
        const quantitySelector = await page.$(AMAZON_SELECTORS.PRODUCT_PAGE.QUANTITY_SELECT);
        if (quantitySelector) {
          await page.selectOption(AMAZON_SELECTORS.PRODUCT_PAGE.QUANTITY_SELECT, String(quantity));
        }
      }

      await page.click(AMAZON_SELECTORS.PRODUCT_PAGE.ADD_TO_CART_BUTTON);

      await page.waitForFunction(
        (selector) => {
          const element = document.querySelector(selector);
          return element && element.textContent !== '0';
        },
        AMAZON_SELECTORS.CART.CART_COUNT,
        { timeout: 10000 }
      );
    },
    requestId,
    'add_to_cart'
  );

  log.success('Product added to cart', Date.now() - startTime);
}

export async function verifyCartContents(
  page: Page,
  expectedProductId: string,
  requestId: string
): Promise<boolean> {
  const log = createLogger(requestId).withStep('verify_cart');
  const startTime = Date.now();

  await navigateToCart(page, requestId);

  await page.waitForSelector(AMAZON_SELECTORS.CART.CART_ITEMS, {
    state: 'visible',
    timeout: 10000,
  });

  const cartItems = await page.$$(AMAZON_SELECTORS.CART.CART_ITEMS);

  for (const item of cartItems) {
    const asin = await item.getAttribute('data-asin');
    if (asin === expectedProductId) {
      log.success('Cart verified', Date.now() - startTime);
      return true;
    }
  }

  log.error('Product not found in cart', { duration: Date.now() - startTime });
  return false;
}

export async function proceedToCheckout(
  page: Page,
  requestId: string
): Promise<void> {
  const log = createLogger(requestId).withStep('proceed_to_checkout');
  const startTime = Date.now();

  await navigateToCart(page, requestId);

  await withRetry(
    async () => {
      const checkoutButton = await page.$(AMAZON_SELECTORS.CART.PROCEED_TO_CHECKOUT);
      if (!checkoutButton) {
        throw new AutomationError('Checkout button not found', 'proceed_to_checkout', true);
      }

      await checkoutButton.click();

      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 });
    },
    requestId,
    'proceed_to_checkout'
  );

  log.success('Proceeded to checkout', Date.now() - startTime);
}
