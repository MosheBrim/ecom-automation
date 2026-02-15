import { describe, it, expect } from 'vitest';
import { OrderBuilder } from './Order';
import type { Product, Address } from '../validators/schemas';

describe('OrderBuilder', () => {
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

  const mockAddress: Address = {
    street: '123 Test St',
    city: 'New York',
    state: 'NY',
    country: 'US',
    postalCode: '10001',
  };

  function buildCompleteOrder(): OrderBuilder {
    return new OrderBuilder()
      .setId('order-123')
      .setRequestId('req-456')
      .setProduct(mockProduct)
      .setQuantity(1)
      .setShippingAddress(mockAddress);
  }

  describe('build', () => {
    it('should build a complete order', () => {
      const order = buildCompleteOrder().build();

      expect(order.id).toBe('order-123');
      expect(order.requestId).toBe('req-456');
      expect(order.product).toEqual(mockProduct);
      expect(order.quantity).toBe(1);
      expect(order.shippingAddress).toEqual(mockAddress);
    });

    it('should calculate totalPrice from product price and quantity', () => {
      const order = buildCompleteOrder().setQuantity(3).build();

      expect(order.totalPrice).toBeCloseTo(89.97);
    });

    it('should default status to pending', () => {
      const order = buildCompleteOrder().build();

      expect(order.status).toBe('pending');
    });

    it('should set createdAt and updatedAt to current time', () => {
      const before = new Date();
      const order = buildCompleteOrder().build();
      const after = new Date();

      expect(order.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(order.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(order.updatedAt).toEqual(order.createdAt);
    });
  });

  describe('setters', () => {
    it('should set status', () => {
      const order = buildCompleteOrder().setStatus('completed').build();
      expect(order.status).toBe('completed');
    });

    it('should set screenshotPath', () => {
      const order = buildCompleteOrder()
        .setScreenshotPath('/screenshots/proof.png')
        .build();

      expect(order.screenshotPath).toBe('/screenshots/proof.png');
    });

    it('should leave screenshotPath undefined when not set', () => {
      const order = buildCompleteOrder().build();
      expect(order.screenshotPath).toBeUndefined();
    });
  });

  describe('chaining', () => {
    it('should support method chaining', () => {
      const order = new OrderBuilder()
        .setId('id')
        .setRequestId('req')
        .setProduct(mockProduct)
        .setQuantity(2)
        .setShippingAddress(mockAddress)
        .setStatus('processing')
        .setScreenshotPath('/path.png')
        .build();

      expect(order.id).toBe('id');
      expect(order.status).toBe('processing');
      expect(order.screenshotPath).toBe('/path.png');
    });
  });

  describe('validation', () => {
    it('should throw when id is missing', () => {
      expect(() => {
        new OrderBuilder()
          .setRequestId('req')
          .setProduct(mockProduct)
          .setQuantity(1)
          .setShippingAddress(mockAddress)
          .build();
      }).toThrow('Order is missing required fields');
    });

    it('should throw when requestId is missing', () => {
      expect(() => {
        new OrderBuilder()
          .setId('id')
          .setProduct(mockProduct)
          .setQuantity(1)
          .setShippingAddress(mockAddress)
          .build();
      }).toThrow('Order is missing required fields');
    });

    it('should throw when product is missing', () => {
      expect(() => {
        new OrderBuilder()
          .setId('id')
          .setRequestId('req')
          .setQuantity(1)
          .setShippingAddress(mockAddress)
          .build();
      }).toThrow('Order is missing required fields');
    });

    it('should throw when quantity is missing', () => {
      expect(() => {
        new OrderBuilder()
          .setId('id')
          .setRequestId('req')
          .setProduct(mockProduct)
          .setShippingAddress(mockAddress)
          .build();
      }).toThrow('Order is missing required fields');
    });

    it('should throw when shippingAddress is missing', () => {
      expect(() => {
        new OrderBuilder()
          .setId('id')
          .setRequestId('req')
          .setProduct(mockProduct)
          .setQuantity(1)
          .build();
      }).toThrow('Order is missing required fields');
    });
  });
});
