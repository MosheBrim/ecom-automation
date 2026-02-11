import { Product } from '../validators/schemas';

export type SelectionStrategyType = 'cheapest' | 'first' | 'highest_rated' | 'best_value';

export interface ProductSelectionStrategy {
  select(products: Product[]): Product | null;
}

export class CheapestProductStrategy implements ProductSelectionStrategy {
  select(products: Product[]): Product | null {
    if (products.length === 0) return null;
    return products.reduce((min, p) => p.price < min.price ? p : min);
  }
}

export class FirstProductStrategy implements ProductSelectionStrategy {
  select(products: Product[]): Product | null {
    return products[0] ?? null;
  }
}

export class HighestRatedStrategy implements ProductSelectionStrategy {
  select(products: Product[]): Product | null {
    if (products.length === 0) return null;
    const productsWithRating = products.filter(p => p.rating !== undefined);
    if (productsWithRating.length === 0) return products[0];
    return productsWithRating.reduce((best, p) =>
      (p.rating ?? 0) > (best.rating ?? 0) ? p : best
    );
  }
}

export class BestValueStrategy implements ProductSelectionStrategy {
  select(products: Product[]): Product | null {
    if (products.length === 0) return null;
    const productsWithRating = products.filter(p => p.rating !== undefined);
    if (productsWithRating.length === 0) {
      return new CheapestProductStrategy().select(products);
    }
    return productsWithRating.reduce((best, p) => {
      const pValue = (p.rating ?? 0) / p.price;
      const bestValue = (best.rating ?? 0) / best.price;
      return pValue > bestValue ? p : best;
    });
  }
}

export function createSelectionStrategy(type: SelectionStrategyType): ProductSelectionStrategy {
  switch (type) {
    case 'cheapest':
      return new CheapestProductStrategy();
    case 'first':
      return new FirstProductStrategy();
    case 'highest_rated':
      return new HighestRatedStrategy();
    case 'best_value':
      return new BestValueStrategy();
    default:
      return new FirstProductStrategy();
  }
}
