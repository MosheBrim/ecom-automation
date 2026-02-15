import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { SearchForm } from '@/components/features/SearchForm';
import { ProductList } from '@/components/features/ProductList';
import { StatusTracker } from '@/components/features/StatusTracker';
import { useSearch } from '@/hooks/useSearch';
import { useBuy } from '@/hooks/useCheckout';
import { useStatus } from '@/hooks/useStatus';
import { AlertCircle, Zap, ShoppingCart, Search, MousePointerClick } from 'lucide-react';
import type { Product } from '@/types';

const AUTO_BUY_DELAY_MS = Number(import.meta.env.VITE_AUTO_BUY_DELAY_MS ?? 2000);

type AutoStrategy = 'cheapest' | 'first' | 'highest_rated';

const STRATEGY_LABELS: Record<AutoStrategy, string> = {
  cheapest: 'Cheapest Product',
  first: 'First Result',
  highest_rated: 'Highest Rated',
};

function selectProduct(products: Product[], strategy: AutoStrategy): Product | null {
  const available = products.filter((p) => p.inStock !== false);
  if (available.length === 0) return null;

  switch (strategy) {
    case 'cheapest':
      return available.reduce((min, p) => (p.price < min.price ? p : min), available[0]);
    case 'first':
      return available[0];
    case 'highest_rated':
      return available.reduce((best, p) => ((p.rating ?? 0) > (best.rating ?? 0) ? p : best), available[0]);
  }
}

export function SearchPage() {
  const { search, products, isLoading, error, requestId } = useSearch();
  const { buy, isLoading: isBuying, error: buyError } = useBuy();
  const { status } = useStatus(requestId, { enabled: isLoading });
  const autoBuyTriggered = useRef(false);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [autoStrategy, setAutoStrategy] = useState<AutoStrategy>('cheapest');

  useEffect(() => {
    if (isLoading) {
      autoBuyTriggered.current = false;
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isAutoMode) return;
    if (products.length > 0 && !autoBuyTriggered.current && !isBuying) {
      autoBuyTriggered.current = true;
      const timer = setTimeout(() => {
        const selected = selectProduct(products, autoStrategy);
        if (selected) {
          buy(selected);
        }
      }, AUTO_BUY_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [products, isBuying, buy, isAutoMode, autoStrategy]);

  const hasError = error || buyError;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        <aside className="space-y-4">
          <SearchForm onSearch={search} isLoading={isLoading || isBuying} />

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center rounded-lg bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setIsAutoMode(true)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    isAutoMode
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5" />
                  Automatic
                </button>
                <button
                  type="button"
                  onClick={() => setIsAutoMode(false)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    !isAutoMode
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <MousePointerClick className="h-3.5 w-3.5" />
                  Manual
                </button>
              </div>

              {isAutoMode ? (
                <Select
                  value={autoStrategy}
                  onChange={(e) => setAutoStrategy(e.target.value as AutoStrategy)}
                  className="mt-2 h-9 text-xs"
                >
                  {Object.entries(STRATEGY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              ) : (
                <p className="text-[11px] text-muted-foreground text-center mt-2">
                  Choose a product to purchase manually
                </p>
              )}
            </CardContent>
          </Card>

          {isLoading && status && (
            <StatusTracker status={status} />
          )}

          {hasError && (
            <Card className="border-destructive">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-destructive">{error || buyError}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && !isBuying && products.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-6 pb-6">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Search for Products</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter a query to find products on Toolshop
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </aside>

        <section className="space-y-4">
          {(products.length > 0 || isLoading || isBuying) && (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  {isBuying ? (
                    <>
                      <ShoppingCart className="h-5 w-5 text-primary animate-pulse" />
                      Purchasing {STRATEGY_LABELS[autoStrategy].toLowerCase()}...
                    </>
                  ) : products.length > 0 ? (
                    <>
                      <Zap className="h-5 w-5 text-primary" />
                      Found {products.length} products
                    </>
                  ) : (
                    'Searching...'
                  )}
                </h2>
                {products.length > 0 && !isBuying && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {isAutoMode
                      ? `The ${STRATEGY_LABELS[autoStrategy].toLowerCase()} will be purchased automatically`
                      : 'Click "Buy Now" on a product to purchase it'}
                  </p>
                )}
              </div>
            </div>
          )}

          <ProductList
            products={products}
            onBuy={buy}
            isLoading={isLoading}
            isBuying={isBuying}
          />
        </section>
      </div>
    </div>
  );
}
