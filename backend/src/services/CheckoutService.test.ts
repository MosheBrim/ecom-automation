import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CheckoutService } from './CheckoutService';
import * as checkoutOrchestrator from '../automation/orchestrators/checkoutOrchestrator';
import type { CheckoutResult } from '../automation/flows/checkoutFlow';
import { statusTracker } from '../domain/models/AutomationStatus';
import type { Product } from '../domain/validators/schemas';

vi.mock('../automation/orchestrators/checkoutOrchestrator', () => ({
  executeCheckoutFlow: vi.fn(),
}));

describe('CheckoutService', () => {
  let service: CheckoutService;
  const testRequestId = 'checkout-test-123';

  const mockProduct: Product = {
    id: 'PROD001',
    title: 'Test Product',
    price: 29.99,
    currency: 'USD',
    productUrl: 'https://practicesoftwaretesting.com/product/PROD001',
    imageUrl: 'https://practicesoftwaretesting.com/assets/img/products/1.jpg',
    source: 'toolshop',
    inStock: true,
  };

  const mockCheckoutResult: CheckoutResult = {
    success: true,
    screenshotPath: '/screenshots/proof.png',
    orderTotal: '$29.99',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CheckoutService();
    statusTracker.delete(testRequestId);
    statusTracker.create(testRequestId);

    process.env.SITE_EMAIL = 'test@example.com';
    process.env.SITE_PASSWORD = 'testpass';
    process.env.SHIPPING_STREET = '123 Test St';
    process.env.SHIPPING_CITY = 'New York';
    process.env.SHIPPING_STATE = 'NY';
    process.env.SHIPPING_COUNTRY = 'US';
    process.env.SHIPPING_POSTAL_CODE = '10001';
    process.env.PAYMENT_METHOD = 'bank-transfer';

    vi.mocked(checkoutOrchestrator.executeCheckoutFlow).mockResolvedValue(mockCheckoutResult);
  });

  describe('checkout', () => {
    it('returns successful checkout result', async () => {
      const result = await service.checkout(mockProduct, 1, testRequestId);

      expect(result.requestId).toBe(testRequestId);
      expect(result.checkoutResult.success).toBe(true);
      expect(result.checkoutResult.screenshotPath).toBe('/screenshots/proof.png');
    });

    it('creates order on successful checkout', async () => {
      const result = await service.checkout(mockProduct, 1, testRequestId);

      expect(result.order).not.toBeNull();
      expect(result.order?.product).toEqual(mockProduct);
      expect(result.order?.quantity).toBe(1);
    });

    it('uses default address from environment variables', async () => {
      await service.checkout(mockProduct, 1, testRequestId);

      const call = vi.mocked(checkoutOrchestrator.executeCheckoutFlow).mock.calls[0];
      expect(call[0].checkoutRequest.shippingAddress).toEqual({
        street: '123 Test St',
        city: 'New York',
        state: 'NY',
        country: 'US',
        postalCode: '10001',
      });
    });

    it('uses default payment method from environment variables', async () => {
      await service.checkout(mockProduct, 1, testRequestId);

      const call = vi.mocked(checkoutOrchestrator.executeCheckoutFlow).mock.calls[0];
      expect(call[0].checkoutRequest.paymentMethod).toBe('bank-transfer');
    });

    it('delegates to checkout orchestrator with credentials', async () => {
      await service.checkout(mockProduct, 1, testRequestId);

      expect(checkoutOrchestrator.executeCheckoutFlow).toHaveBeenCalledWith({
        checkoutRequest: expect.objectContaining({
          productId: 'PROD001',
          quantity: 1,
        }),
        product: mockProduct,
        credentials: { email: 'test@example.com', password: 'testpass' },
        requestId: testRequestId,
        onProgress: expect.any(Function),
      });
    });

    it('passes progress callback that updates status', async () => {
      await service.checkout(mockProduct, 1, testRequestId);

      const call = vi.mocked(checkoutOrchestrator.executeCheckoutFlow).mock.calls[0];
      const onProgress = call[0].onProgress;

      expect(onProgress).toBeDefined();
      onProgress?.('adding_to_cart', 35);

      const status = statusTracker.get(testRequestId);
      expect(status?.currentStep).toBe('adding_to_cart');
      expect(status?.progress).toBe(35);
    });

    it('sets order status to completed on success', async () => {
      const result = await service.checkout(mockProduct, 1, testRequestId);

      expect(result.order?.status).toBe('completed');
    });

    it('returns null order when checkout fails', async () => {
      vi.mocked(checkoutOrchestrator.executeCheckoutFlow).mockResolvedValue({
        success: false,
        screenshotPath: '/screenshots/error.png',
        error: 'Payment failed',
      });

      const result = await service.checkout(mockProduct, 1, testRequestId);

      expect(result.order).toBeNull();
      expect(result.checkoutResult.success).toBe(false);
      expect(result.checkoutResult.error).toBe('Payment failed');
    });

    it('updates status to completed on success', async () => {
      await service.checkout(mockProduct, 1, testRequestId);

      const status = statusTracker.get(testRequestId);
      expect(status?.currentStep).toBe('completed');
      expect(status?.screenshotPath).toBe('/screenshots/proof.png');
    });

    it('stores result in status on success', async () => {
      await service.checkout(mockProduct, 1, testRequestId);

      const status = statusTracker.get(testRequestId);
      expect(status?.result).toBeDefined();
      expect(status?.result?.orderTotal).toBe('$29.99');
      expect(status?.result?.product).toEqual(mockProduct);
    });

    it('sets status to failed when checkout result is unsuccessful', async () => {
      vi.mocked(checkoutOrchestrator.executeCheckoutFlow).mockResolvedValue({
        success: false,
        screenshotPath: '/screenshots/error.png',
        error: 'Card declined',
      });

      await service.checkout(mockProduct, 1, testRequestId);

      const status = statusTracker.get(testRequestId);
      expect(status?.currentStep).toBe('failed');
      expect(status?.error).toBe('Card declined');
    });

    it('handles orchestrator errors gracefully', async () => {
      vi.mocked(checkoutOrchestrator.executeCheckoutFlow).mockRejectedValue(
        new Error('Login failed')
      );

      const result = await service.checkout(mockProduct, 1, testRequestId);

      expect(result.order).toBeNull();
      expect(result.checkoutResult.success).toBe(false);
      expect(result.checkoutResult.error).toBe('Login failed');

      const status = statusTracker.get(testRequestId);
      expect(status?.currentStep).toBe('failed');
      expect(status?.error).toBe('Login failed');
    });

    it('handles multiple quantity in order', async () => {
      const result = await service.checkout(mockProduct, 3, testRequestId);

      expect(result.order?.quantity).toBe(3);
    });
  });
});
