import { CheckoutRequest, Product } from '../../domain/validators/schemas';
import { browserFactory } from '../factories/BrowserFactory';
import { ensureLoggedIn, LoginCredentials } from '../flows/loginFlow';
import { addToCart, proceedToCheckout } from '../flows/cartFlow';
import { completeCheckout, CheckoutResult } from '../flows/checkoutFlow';
import { createLogger } from '../../utils/logger';
import { ProgressCallback } from './searchOrchestrator';

export interface CheckoutOrchestratorParams {
  checkoutRequest: CheckoutRequest;
  product: Product;
  credentials: LoginCredentials;
  requestId: string;
  dryRun: boolean;
  onProgress?: ProgressCallback;
}

export async function executeCheckoutFlow(
  params: CheckoutOrchestratorParams
): Promise<CheckoutResult> {
  const { checkoutRequest, product, credentials, requestId, dryRun, onProgress } = params;
  const log = createLogger(requestId);
  let context: { close: () => Promise<void> } | null = null;

  try {
    onProgress?.('opening_browser', 5);
    const browserResult = await browserFactory.createPage();
    context = browserResult.context;
    const page = browserResult.page;

    onProgress?.('logging_in', 15);
    log.info('Ensuring logged in');
    await ensureLoggedIn(page, credentials, requestId);

    onProgress?.('adding_to_cart', 35);
    log.info('Adding product to cart', { productId: product.id });
    await addToCart(page, product.productUrl, checkoutRequest.quantity, requestId);

    onProgress?.('checkout', 55);
    log.info('Proceeding to checkout');
    await proceedToCheckout(page, requestId);

    onProgress?.('filling_shipping', 70);
    log.info('Filling shipping information');
    const checkoutResult = await completeCheckout(
      page,
      checkoutRequest.shippingAddress,
      requestId,
      dryRun
    );

    onProgress?.('taking_screenshot', 90);

    return checkoutResult;
  } finally {
    if (context) {
      await context.close();
    }
  }
}
