import { Product, Address, PaymentMethod } from '../domain/validators/schemas';
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
  private getDefaultAddress(): Address {
    return {
      street: process.env.SHIPPING_STREET ?? '123 Test Street',
      city: process.env.SHIPPING_CITY ?? 'New York',
      state: process.env.SHIPPING_STATE ?? 'NY',
      country: process.env.SHIPPING_COUNTRY ?? 'US',
      postalCode: process.env.SHIPPING_POSTAL_CODE ?? '10001',
    };
  }

  private getDefaultPaymentMethod(): PaymentMethod {
    const method = process.env.PAYMENT_METHOD;
    const validMethods: PaymentMethod[] = [
      'bank-transfer', 'cash-on-delivery', 'credit-card', 'buy-now-pay-later', 'gift-card',
    ];
    if (method && validMethods.includes(method as PaymentMethod)) {
      return method as PaymentMethod;
    }
    return 'bank-transfer';
  }

  async checkout(
    product: Product,
    quantity: number,
    requestId: string
  ): Promise<CheckoutServiceResult> {
    const log = createLogger(requestId);

    const credentials = {
      email: process.env.SITE_EMAIL ?? '',
      password: process.env.SITE_PASSWORD ?? '',
    };

    const shippingAddress = this.getDefaultAddress();
    const paymentMethod = this.getDefaultPaymentMethod();

    try {
      const checkoutRequest = {
        productId: product.id,
        quantity,
        shippingAddress,
        paymentMethod,
      };

      const checkoutResult = await executeCheckoutFlow({
        checkoutRequest,
        product,
        credentials,
        requestId,
        onProgress: (step, progress) => statusService.updateStatus(requestId, step, progress),
      });

      let order: Order | null = null;
      if (checkoutResult.success) {
        order = new OrderBuilder()
          .setId(generateRequestId())
          .setRequestId(requestId)
          .setProduct(product)
          .setQuantity(quantity)
          .setShippingAddress(shippingAddress)
          .setStatus('completed')
          .setScreenshotPath(checkoutResult.screenshotPath)
          .build();

        statusService.completeStatus(requestId, checkoutResult.screenshotPath);

        statusService.setResult(requestId, {
          order: { id: order.id, totalPrice: order.totalPrice, status: order.status },
          orderTotal: checkoutResult.orderTotal,
          screenshotPath: checkoutResult.screenshotPath,
          product,
        });

        log.info('Checkout completed successfully', { orderId: order.id });
      } else {
        statusService.failStatus(
          requestId,
          checkoutResult.error ?? 'Unknown error',
          checkoutResult.screenshotPath
        );

        statusService.setResult(requestId, {
          order: null,
          screenshotPath: checkoutResult.screenshotPath,
          error: checkoutResult.error,
          product,
        });

        log.error('Checkout failed', { error: checkoutResult.error });
      }

      return { requestId, order, checkoutResult };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.error(`Checkout failed: ${errorMessage}`);
      statusService.failStatus(requestId, errorMessage);

      statusService.setResult(requestId, {
        order: null,
        error: errorMessage,
        product,
      });

      return {
        requestId,
        order: null,
        checkoutResult: { success: false, screenshotPath: '', error: errorMessage },
      };
    }
  }
}

export const checkoutService = new CheckoutService();
