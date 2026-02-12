import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SearchForm } from '@/components/features/SearchForm';
import { ProductList } from '@/components/features/ProductList';
import { StatusTracker } from '@/components/features/StatusTracker';
import { useSearch } from '@/hooks/useSearch';
import { useBuy } from '@/hooks/useCheckout';
import { useStatus } from '@/hooks/useStatus';
import { AlertCircle, Zap, ShoppingCart, Search } from 'lucide-react';

const AUTO_BUY_DELAY_MS = Number(import.meta.env.VITE_AUTO_BUY_DELAY_MS ?? 2000);

function findCheapestProduct(products: { price: number; inStock?: boolean }[]) {
  const available = products.filter((p) => p.inStock !== false);
  if (available.length === 0) return null;
  return available.reduce((min, p) => (p.price < min.price ? p : min), available[0]);
}

export function SearchPage() {
  const { search, products, isLoading, error, requestId } = useSearch();
  const { buy, isLoading: isBuying, error: buyError } = useBuy();
  const { status } = useStatus(requestId, { enabled: isLoading });
  const autoBuyTriggered = useRef(false);

  useEffect(() => {
    if (isLoading) {
      autoBuyTriggered.current = false;
    }
  }, [isLoading]);

  useEffect(() => {
    if (products.length > 0 && !autoBuyTriggered.current && !isBuying) {
      autoBuyTriggered.current = true;
      const timer = setTimeout(() => {
        const cheapest = findCheapestProduct(products);
        if (cheapest) {
          buy(cheapest as typeof products[0]);
        }
      }, AUTO_BUY_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [products, isBuying, buy]);

  const hasError = error || buyError;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        <aside className="space-y-4">
          <SearchForm onSearch={search} isLoading={isLoading || isBuying} />

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
                      Purchasing cheapest product...
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
                    The cheapest available product will be purchased automatically
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
