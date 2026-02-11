import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CheckoutService } from './CheckoutService';
import * as checkoutOrchestrator from '../automation/orchestrators/checkoutOrchestrator';
import type { CheckoutResult } from '../automation/flows/checkoutFlow';
import { statusTracker } from '../domain/models/AutomationStatus';
import type { Product, CheckoutRequest } from '../domain/validators/schemas';

vi.mock('../automation/orchestrators/checkoutOrchestrator', () => ({
  executeCheckoutFlow: vi.fn(),
}));

describe('CheckoutService', () => {
  let service: CheckoutService;
  const testRequestId = 'checkout-test-123';

  const mockProduct: Product = {
    id: 'ASIN001',
    title: 'Test Product',
    price: 29.99,
    currency: 'USD',
    productUrl: 'https://amazon.com/dp/ASIN001',
    imageUrl: 'https://amazon.com/images/1.jpg',
    source: 'amazon',
    inStock: true,
  };

  const mockCheckoutRequest: CheckoutRequest = {
    productId: 'ASIN001',
    shippingAddress: {
      fullName: 'John Doe',
      addressLine1: '123 Test St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
    },
    quantity: 1,
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

    process.env.AMAZON_EMAIL = 'test@example.com';
    process.env.AMAZON_PASSWORD = 'testpass';

    vi.mocked(checkoutOrchestrator.executeCheckoutFlow).mockResolvedValue(mockCheckoutResult);
  });

  describe('checkout', () => {
    it('returns successful checkout result', async () => {
      const result = await service.checkout(
        mockCheckoutRequest,
        mockProduct,
        testRequestId,
        true
      );

      expect(result.requestId).toBe(testRequestId);
      expect(result.checkoutResult.success).toBe(true);
      expect(result.checkoutResult.screenshotPath).toBe('/screenshots/proof.png');
    });

    it('creates order on successful checkout', async () => {
      const result = await service.checkout(
        mockCheckoutRequest,
        mockProduct,
        testRequestId,
        true
      );

      expect(result.order).not.toBeNull();
      expect(result.order?.product).toEqual(mockProduct);
      expect(result.order?.quantity).toBe(1);
    });

    it('delegates to checkout orchestrator', async () => {
      await service.checkout(mockCheckoutRequest, mockProduct, testRequestId, true);

      expect(checkoutOrchestrator.executeCheckoutFlow).toHaveBeenCalledWith({
        checkoutRequest: mockCheckoutRequest,
        product: mockProduct,
        credentials: { email: 'test@example.com', password: 'testpass' },
        requestId: testRequestId,
        dryRun: true,
        onProgress: expect.any(Function),
      });
    });

    it('passes progress callback that updates status', async () => {
      await service.checkout(mockCheckoutRequest, mockProduct, testRequestId, true);

      const call = vi.mocked(checkoutOrchestrator.executeCheckoutFlow).mock.calls[0];
      const onProgress = call[0].onProgress;

      expect(onProgress).toBeDefined();
      onProgress?.('adding_to_cart', 35);

      const status = statusTracker.get(testRequestId);
      expect(status?.currentStep).toBe('adding_to_cart');
      expect(status?.progress).toBe(35);
    });

    it('sets order status to pending in dry run mode', async () => {
      const result = await service.checkout(
        mockCheckoutRequest,
        mockProduct,
        testRequestId,
        true
      );

      expect(result.order?.status).toBe('pending');
    });

    it('sets order status to completed when not dry run', async () => {
      const result = await service.checkout(
        mockCheckoutRequest,
        mockProduct,
        testRequestId,
        false
      );

      expect(result.order?.status).toBe('completed');
    });

    it('returns null order when checkout fails', async () => {
      vi.mocked(checkoutOrchestrator.executeCheckoutFlow).mockResolvedValue({
        success: false,
        screenshotPath: '/screenshots/error.png',
        error: 'Payment failed',
      });

      const result = await service.checkout(
        mockCheckoutRequest,
        mockProduct,
        testRequestId,
        true
      );

      expect(result.order).toBeNull();
      expect(result.checkoutResult.success).toBe(false);
      expect(result.checkoutResult.error).toBe('Payment failed');
    });

    it('updates status to completed on success', async () => {
      await service.checkout(mockCheckoutRequest, mockProduct, testRequestId, true);

      const status = statusTracker.get(testRequestId);
      expect(status?.currentStep).toBe('completed');
      expect(status?.screenshotPath).toBe('/screenshots/proof.png');
    });

    it('sets status to failed when checkout result is unsuccessful', async () => {
      vi.mocked(checkoutOrchestrator.executeCheckoutFlow).mockResolvedValue({
        success: false,
        screenshotPath: '/screenshots/error.png',
        error: 'Card declined',
      });

      await service.checkout(mockCheckoutRequest, mockProduct, testRequestId, true);

      const status = statusTracker.get(testRequestId);
      expect(status?.currentStep).toBe('failed');
      expect(status?.error).toBe('Card declined');
    });

    it('sets status to failed when orchestrator throws', async () => {
      vi.mocked(checkoutOrchestrator.executeCheckoutFlow).mockRejectedValue(
        new Error('Login failed')
      );

      try {
        await service.checkout(mockCheckoutRequest, mockProduct, testRequestId, true);
      } catch {
        // Expected
      }

      const status = statusTracker.get(testRequestId);
      expect(status?.currentStep).toBe('failed');
      expect(status?.error).toBe('Login failed');
    });

    it('propagates orchestrator errors', async () => {
      vi.mocked(checkoutOrchestrator.executeCheckoutFlow).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.checkout(mockCheckoutRequest, mockProduct, testRequestId, true)
      ).rejects.toThrow('Network error');
    });

    it('handles multiple quantity in order', async () => {
      const multiQuantityRequest = { ...mockCheckoutRequest, quantity: 3 };

      const result = await service.checkout(
        multiQuantityRequest,
        mockProduct,
        testRequestId,
        true
      );

      expect(result.order?.quantity).toBe(3);
    });
  });
});
