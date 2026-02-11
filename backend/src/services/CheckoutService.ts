import { CheckoutRequest, Product } from '../domain/validators/schemas';
import { Order, OrderBuilder } from '../domain/models/Order';
import { executeCheckoutFlow } from '../automation/orchestrators/checkoutOrchestrator';
import { CheckoutResult } from '../automation/flows/checkoutFlow';
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

    const credentials = {
      email: process.env.AMAZON_EMAIL ?? '',
      password: process.env.AMAZON_PASSWORD ?? '',
    };

    try {
      statusService.createStatus(requestId);

      const checkoutResult = await executeCheckoutFlow({
        checkoutRequest,
        product,
        credentials,
        requestId,
        dryRun,
        onProgress: (step, progress) => statusService.updateStatus(requestId, step, progress),
      });

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
    }
  }
}

export const checkoutService = new CheckoutService();
