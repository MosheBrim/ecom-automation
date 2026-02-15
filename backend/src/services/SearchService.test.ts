import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchService } from './SearchService';
import * as searchOrchestrator from '../automation/orchestrators/searchOrchestrator';
import { statusTracker } from '../domain/models/AutomationStatus';
import type { Product } from '../domain/validators/schemas';

vi.mock('../automation/orchestrators/searchOrchestrator', () => ({
  executeSearchFlow: vi.fn(),
}));

describe('SearchService', () => {
  let service: SearchService;
  const testRequestId = 'search-test-123';

  const mockProducts: Product[] = [
    {
      id: 'PROD001',
      title: 'Test Product 1',
      price: 29.99,
      currency: 'USD',
      productUrl: 'https://practicesoftwaretesting.com/product/PROD001',
      imageUrl: 'https://practicesoftwaretesting.com/assets/img/products/1.jpg',
      source: 'toolshop',
      inStock: true,
    },
    {
      id: 'PROD002',
      title: 'Test Product 2',
      price: 19.99,
      currency: 'USD',
      productUrl: 'https://practicesoftwaretesting.com/product/PROD002',
      imageUrl: 'https://practicesoftwaretesting.com/assets/img/products/2.jpg',
      source: 'toolshop',
      rating: 4.5,
      inStock: true,
    },
    {
      id: 'PROD003',
      title: 'Test Product 3',
      price: 39.99,
      currency: 'USD',
      productUrl: 'https://practicesoftwaretesting.com/product/PROD003',
      imageUrl: 'https://practicesoftwaretesting.com/assets/img/products/3.jpg',
      source: 'toolshop',
      rating: 4.8,
      inStock: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SearchService();
    statusTracker.delete(testRequestId);

    vi.mocked(searchOrchestrator.executeSearchFlow).mockResolvedValue({
      products: mockProducts,
    });
  });

  describe('search', () => {
    it('returns search results with products', async () => {
      const result = await service.search(
        { query: 'test product', limit: 10, sortBy: 'relevance' },
        testRequestId
      );

      expect(result.requestId).toBe(testRequestId);
      expect(result.products).toHaveLength(3);
      expect(result.products[0].title).toBe('Test Product 1');
    });

    it('selects first product by default', async () => {
      const result = await service.search(
        { query: 'test', limit: 10, sortBy: 'relevance' },
        testRequestId,
        'first'
      );

      expect(result.selectedProduct).not.toBeNull();
      expect(result.selectedProduct?.id).toBe('PROD001');
    });

    it('selects cheapest product when strategy is cheapest', async () => {
      const result = await service.search(
        { query: 'test', limit: 10, sortBy: 'relevance' },
        testRequestId,
        'cheapest'
      );

      expect(result.selectedProduct?.id).toBe('PROD002');
      expect(result.selectedProduct?.price).toBe(19.99);
    });

    it('selects highest rated product when strategy is highest_rated', async () => {
      const result = await service.search(
        { query: 'test', limit: 10, sortBy: 'relevance' },
        testRequestId,
        'highest_rated'
      );

      expect(result.selectedProduct?.id).toBe('PROD003');
      expect(result.selectedProduct?.rating).toBe(4.8);
    });

    it('delegates browser management to orchestrator', async () => {
      await service.search({ query: 'test', limit: 10, sortBy: 'relevance' }, testRequestId);

      expect(searchOrchestrator.executeSearchFlow).toHaveBeenCalledWith(
        { query: 'test', limit: 10, sortBy: 'relevance' },
        testRequestId,
        expect.any(Function)
      );
    });

    it('passes progress callback to orchestrator', async () => {
      await service.search({ query: 'test', limit: 10, sortBy: 'relevance' }, testRequestId);

      const call = vi.mocked(searchOrchestrator.executeSearchFlow).mock.calls[0];
      const progressCallback = call[2];

      expect(progressCallback).toBeDefined();
      progressCallback?.('searching', 30);

      const status = statusTracker.get(testRequestId);
      expect(status?.currentStep).toBe('searching');
      expect(status?.progress).toBe(30);
    });

    it('creates and updates status during search', async () => {
      await service.search({ query: 'test', limit: 10, sortBy: 'relevance' }, testRequestId);

      const status = statusTracker.get(testRequestId);
      expect(status).toBeDefined();
      expect(status?.currentStep).toBe('completed');
      expect(status?.progress).toBe(100);
    });

    it('sets status to failed when orchestrator throws', async () => {
      vi.mocked(searchOrchestrator.executeSearchFlow).mockRejectedValue(new Error('Search failed'));

      await expect(
        service.search({ query: 'test', limit: 10, sortBy: 'relevance' }, testRequestId)
      ).rejects.toThrow('Search failed');

      const status = statusTracker.get(testRequestId);
      expect(status?.currentStep).toBe('failed');
      expect(status?.error).toBe('Search failed');
    });

    it('returns null selectedProduct when no products found', async () => {
      vi.mocked(searchOrchestrator.executeSearchFlow).mockResolvedValue({
        products: [],
      });

      const result = await service.search(
        { query: 'nonexistent', limit: 10, sortBy: 'relevance' },
        testRequestId
      );

      expect(result.products).toHaveLength(0);
      expect(result.selectedProduct).toBeNull();
    });
  });
});
