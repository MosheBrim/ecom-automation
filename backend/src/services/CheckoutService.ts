import { Page, BrowserContext } from 'playwright';
import { CheckoutRequest, Product } from '../domain/validators/schemas';
import { Order, OrderBuilder } from '../domain/models/Order';
import { browserFactory } from '../automation/factories/BrowserFactory';
import { ensureLoggedIn } from '../automation/flows/loginFlow';
import { addToCart, proceedToCheckout } from '../automation/flows/cartFlow';
import { completeCheckout, CheckoutResult } from '../automation/flows/checkoutFlow';
import { createLogger } from '../utils/logger';
import { statusService } from './StatusService';
import { generateRequestId } from '../utils/generateRequestId';

export interface CheckoutServiceResult {
  requestId: string;
  order: Order | null;
  checkoutResult: CheckoutResult;
}

export class CheckoutService {
  async checkout(
    checkoutRequest: CheckoutRequest,
    product: Product,
    requestId: string,
    dryRun: boolean = true
  ): Promise<CheckoutServiceResult> {
    const log = createLogger(requestId);
    let page: Page | null = null;
    let context: BrowserContext | null = null;

    const credentials = {
      email: process.env.AMAZON_EMAIL ?? '',
      password: process.env.AMAZON_PASSWORD ?? '',
    };

    try {
      statusService.createStatus(requestId);
      statusService.updateStatus(requestId, 'opening_browser', 5);

      const browserResult = await browserFactory.createPage();
      page = browserResult.page;
      context = browserResult.context;

      statusService.updateStatus(requestId, 'logging_in', 15);
      log.info('Ensuring logged in');

      await ensureLoggedIn(page, credentials, requestId);

      statusService.updateStatus(requestId, 'adding_to_cart', 35);
      log.info('Adding product to cart', { productId: product.id });

      await addToCart(page, product.productUrl, checkoutRequest.quantity, requestId);

      statusService.updateStatus(requestId, 'checkout', 55);
      log.info('Proceeding to checkout');

      await proceedToCheckout(page, requestId);

      statusService.updateStatus(requestId, 'filling_shipping', 70);
      log.info('Filling shipping information');

      const checkoutResult = await completeCheckout(
        page,
        checkoutRequest.shippingAddress,
        requestId,
        dryRun
      );

      statusService.updateStatus(requestId, 'taking_screenshot', 90);

      let order: Order | null = null;
      if (checkoutResult.success) {
        order = new OrderBuilder()
          .setId(generateRequestId())
          .setRequestId(requestId)
          .setProduct(product)
          .setQuantity(checkoutRequest.quantity)
          .setShippingAddress(checkoutRequest.shippingAddress)
          .setStatus(dryRun ? 'pending' : 'completed')
          .setScreenshotPath(checkoutResult.screenshotPath)
          .build();

        statusService.completeStatus(requestId, checkoutResult.screenshotPath);
        log.info('Checkout completed successfully', { orderId: order.id });
      } else {
        statusService.failStatus(
          requestId,
          checkoutResult.error ?? 'Unknown error',
          checkoutResult.screenshotPath
        );
        log.error('Checkout failed', { error: checkoutResult.error });
      }

      return {
        requestId,
        order,
        checkoutResult,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.error(`Checkout failed: ${errorMessage}`);
      statusService.failStatus(requestId, errorMessage);
      throw error;
    } finally {
      if (context) {
        await context.close();
      }
    }
  }
}

export const checkoutService = new CheckoutService();
