import { describe, it, expect } from 'vitest';
import {
  CheapestProductStrategy,
  FirstProductStrategy,
  HighestRatedStrategy,
  BestValueStrategy,
  createSelectionStrategy,
} from './ProductSelectionStrategy';
import type { Product } from '../validators/schemas';

const createProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'test-id',
  title: 'Test Product',
  price: 99.99,
  currency: 'USD',
  productUrl: 'https://amazon.com/product/123',
  source: 'amazon',
  inStock: true,
  ...overrides,
});

const sampleProducts: Product[] = [
  createProduct({ id: '1', title: 'Product A', price: 50, rating: 4.0 }),
  createProduct({ id: '2', title: 'Product B', price: 30, rating: 4.5 }),
  createProduct({ id: '3', title: 'Product C', price: 100, rating: 5.0 }),
  createProduct({ id: '4', title: 'Product D', price: 25, rating: 3.0 }),
];

describe('CheapestProductStrategy', () => {
  const strategy = new CheapestProductStrategy();

  it('returns cheapest product', () => {
    const result = strategy.select(sampleProducts);
    expect(result?.id).toBe('4');
    expect(result?.price).toBe(25);
  });

  it('returns null for empty array', () => {
    expect(strategy.select([])).toBe(null);
  });

  it('returns single product when only one exists', () => {
    const single = [createProduct({ id: 'single', price: 99 })];
    expect(strategy.select(single)?.id).toBe('single');
  });
});

describe('FirstProductStrategy', () => {
  const strategy = new FirstProductStrategy();

  it('returns first product in array', () => {
    const result = strategy.select(sampleProducts);
    expect(result?.id).toBe('1');
  });

  it('returns null for empty array', () => {
    expect(strategy.select([])).toBe(null);
  });
});

describe('HighestRatedStrategy', () => {
  const strategy = new HighestRatedStrategy();

  it('returns highest rated product', () => {
    const result = strategy.select(sampleProducts);
    expect(result?.id).toBe('3');
    expect(result?.rating).toBe(5.0);
  });

  it('returns null for empty array', () => {
    expect(strategy.select([])).toBe(null);
  });

  it('returns first product when none have ratings', () => {
    const noRatings = [
      createProduct({ id: '1', rating: undefined }),
      createProduct({ id: '2', rating: undefined }),
    ];
    expect(strategy.select(noRatings)?.id).toBe('1');
  });

  it('ignores products without ratings when some have ratings', () => {
    const mixed = [
      createProduct({ id: '1', rating: undefined }),
      createProduct({ id: '2', rating: 4.0 }),
      createProduct({ id: '3', rating: undefined }),
    ];
    expect(strategy.select(mixed)?.id).toBe('2');
  });
});

describe('BestValueStrategy', () => {
  const strategy = new BestValueStrategy();

  it('returns product with best rating-to-price ratio', () => {
    const products = [
      createProduct({ id: '1', price: 100, rating: 4.0 }),
      createProduct({ id: '2', price: 20, rating: 4.0 }),
      createProduct({ id: '3', price: 50, rating: 4.5 }),
    ];
    const result = strategy.select(products);
    expect(result?.id).toBe('2');
  });

  it('returns null for empty array', () => {
    expect(strategy.select([])).toBe(null);
  });

  it('falls back to cheapest when no ratings', () => {
    const noRatings = [
      createProduct({ id: '1', price: 50, rating: undefined }),
      createProduct({ id: '2', price: 30, rating: undefined }),
    ];
    expect(strategy.select(noRatings)?.id).toBe('2');
  });
});

describe('createSelectionStrategy', () => {
  it('creates CheapestProductStrategy', () => {
    const strategy = createSelectionStrategy('cheapest');
    expect(strategy).toBeInstanceOf(CheapestProductStrategy);
  });

  it('creates FirstProductStrategy', () => {
    const strategy = createSelectionStrategy('first');
    expect(strategy).toBeInstanceOf(FirstProductStrategy);
  });

  it('creates HighestRatedStrategy', () => {
    const strategy = createSelectionStrategy('highest_rated');
    expect(strategy).toBeInstanceOf(HighestRatedStrategy);
  });

  it('creates BestValueStrategy', () => {
    const strategy = createSelectionStrategy('best_value');
    expect(strategy).toBeInstanceOf(BestValueStrategy);
  });

  it('defaults to FirstProductStrategy for unknown type', () => {
    const strategy = createSelectionStrategy('unknown' as never);
    expect(strategy).toBeInstanceOf(FirstProductStrategy);
  });
});
