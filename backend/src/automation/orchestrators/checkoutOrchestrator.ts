import { Page } from 'playwright';
import { CheckoutRequest, Product } from '../../domain/validators/schemas';
import { browserFactory } from '../factories/BrowserFactory';
import { ensureLoggedIn, LoginCredentials } from '../flows/loginFlow';
import { addToCart, proceedToCheckout } from '../flows/cartFlow';
import {
  proceedPastLogin,
  fillShippingAddress,
  fillPaymentAndConfirm,
  CheckoutResult,
} from '../flows/checkoutFlow';
import { TOOLSHOP_SELECTORS } from '../selectors/toolshop.selectors';
import { takeCheckoutProof } from '../actions/screenshotActions';
import { createLogger } from '../../utils/logger';
import { ProgressCallback } from './searchOrchestrator';

export interface CheckoutOrchestratorParams {
  checkoutRequest: CheckoutRequest;
  product: Product;
  credentials: LoginCredentials;
  requestId: string;
  onProgress?: ProgressCallback;
}

export async function executeCheckoutFlow(
  params: CheckoutOrchestratorParams
): Promise<CheckoutResult> {
  const { checkoutRequest, product, credentials, requestId, onProgress } = params;
  const log = createLogger(requestId);
  let context: { close: () => Promise<void> } | null = null;
  let page: Page | null = null;

  try {
    onProgress?.('opening_browser', 5);
    const browserResult = await browserFactory.createPage();
    context = browserResult.context;
    page = browserResult.page;

    onProgress?.('logging_in', 15);
    log.info('Ensuring logged in');
    await ensureLoggedIn(page, credentials, requestId);

    onProgress?.('adding_to_cart', 30);
    log.info('Adding product to cart', { productId: product.id });
    await addToCart(page, product.productUrl, checkoutRequest.quantity, requestId);

    onProgress?.('checkout', 45);
    log.info('Proceeding to checkout');
    await proceedToCheckout(page, requestId);

    onProgress?.('filling_shipping', 55);
    log.info('Filling shipping address');
    await proceedPastLogin(page, requestId);
    await fillShippingAddress(page, checkoutRequest.shippingAddress, requestId);

    const cartTotalElement = await page.$(TOOLSHOP_SELECTORS.CART.CART_TOTAL);
    const orderTotal = await cartTotalElement?.textContent();

    onProgress?.('filling_payment', 70);
    log.info('Filling payment details');
    await fillPaymentAndConfirm(page, checkoutRequest.paymentMethod, requestId);

    onProgress?.('confirming_order', 85);

    onProgress?.('taking_screenshot', 90);
    log.info('Taking screenshot proof');
    const screenshotPath = await takeCheckoutProof(page, requestId);

    log.info('Checkout completed successfully');
    return {
      success: true,
      screenshotPath,
      orderTotal: orderTotal?.trim(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error(`Checkout failed: ${errorMessage}`);

    let screenshotPath = '';
    if (page) {
      try {
        screenshotPath = await takeCheckoutProof(page, requestId);
      } catch {
        log.error('Failed to take error screenshot');
      }
    }

    return {
      success: false,
      screenshotPath,
      error: errorMessage,
    };
  } finally {
    if (context) {
      await context.close();
    }
  }
}
