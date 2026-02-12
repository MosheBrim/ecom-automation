import { Page } from 'playwright';
import { TOOLSHOP_SELECTORS } from '../selectors/toolshop.selectors';
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
      await page.waitForSelector(TOOLSHOP_SELECTORS.PRODUCT_DETAIL.ADD_TO_CART, {
        state: 'visible',
        timeout: 10000,
      });

      if (quantity > 1) {
        await page.fill(TOOLSHOP_SELECTORS.PRODUCT_DETAIL.QUANTITY_INPUT, String(quantity));
      }

      await page.click(TOOLSHOP_SELECTORS.PRODUCT_DETAIL.ADD_TO_CART);

      await page.waitForFunction(
        (selector) => {
          const element = document.querySelector(selector);
          return element && element.textContent?.trim() !== '' && element.textContent?.trim() !== '0';
        },
        TOOLSHOP_SELECTORS.NAV.CART_QUANTITY,
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
  expectedProductTitle: string,
  requestId: string
): Promise<boolean> {
  const log = createLogger(requestId).withStep('verify_cart');
  const startTime = Date.now();

  await navigateToCart(page, requestId);

  await page.waitForSelector(TOOLSHOP_SELECTORS.CART.PRODUCT_TITLE, {
    state: 'visible',
    timeout: 10000,
  });

  const cartTitles = await page.$$(TOOLSHOP_SELECTORS.CART.PRODUCT_TITLE);

  for (const titleElement of cartTitles) {
    const title = await titleElement.textContent();
    if (title?.includes(expectedProductTitle)) {
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
      const proceedButton = await page.$(TOOLSHOP_SELECTORS.CART.PROCEED_BUTTON);
      if (!proceedButton) {
        throw new AutomationError('Proceed button not found in cart', 'proceed_to_checkout', true);
      }

      await proceedButton.click();

      await page.waitForSelector(TOOLSHOP_SELECTORS.CHECKOUT.PROCEED_AFTER_LOGIN, {
        state: 'visible',
        timeout: 15000,
      });
    },
    requestId,
    'proceed_to_checkout'
  );

  log.success('Proceeded to checkout', Date.now() - startTime);
}
