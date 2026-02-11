import { SearchForm } from '@/components/features/SearchForm';
import { ProductList } from '@/components/features/ProductList';
import { StatusTracker } from '@/components/features/StatusTracker';
import { CheckoutForm } from '@/components/features/CheckoutForm';
import { ResultDisplay } from '@/components/features/ResultDisplay';
import { useSearch } from '@/hooks/useSearch';
import { useCheckout } from '@/hooks/useCheckout';
import { useStatus } from '@/hooks/useStatus';
import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';

type AppState = 'search' | 'checkout' | 'result';

export function HomePage() {
  const [appState, setAppState] = useState<AppState>('search');

  const {
    search,
    clearResults,
    products,
    selectedProduct,
    setSelectedProduct,
    isLoading: isSearching,
    error: searchError,
    requestId: searchRequestId,
  } = useSearch();

  const {
    checkout,
    reset: resetCheckout,
    result: checkoutResult,
    isLoading: isCheckingOut,
    error: checkoutError,
    requestId: checkoutRequestId,
  } = useCheckout();

  const activeRequestId = checkoutRequestId ?? searchRequestId;
  const isProcessing = isSearching || isCheckingOut;

  const { status } = useStatus(activeRequestId, {
    enabled: isProcessing,
  });

  const handleSearch = (request: Parameters<typeof search>[0]) => {
    setAppState('search');
    search(request);
  };

  const handleSelectForCheckout = () => {
    if (selectedProduct) {
      setAppState('checkout');
    }
  };

  const handleCancelCheckout = () => {
    setAppState('search');
  };

  const handleCheckout = (request: Parameters<typeof checkout>[0]) => {
    checkout(request);
    setAppState('result');
  };

  const handleReset = () => {
    clearResults();
    resetCheckout();
    setAppState('search');
  };

  const showSearchSection = appState === 'search';
  const showCheckoutForm = appState === 'checkout' && selectedProduct;
  const showResult = appState === 'result' && checkoutResult && selectedProduct;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            <h1 className="text-xl font-bold">E-Commerce Automation</h1>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-8 lg:grid-cols-[350px,1fr]">
          <aside className="space-y-6">
            {showSearchSection && (
              <SearchForm onSearch={handleSearch} isLoading={isSearching} />
            )}

            {showCheckoutForm && (
              <CheckoutForm
                product={selectedProduct}
                onCheckout={handleCheckout}
                isLoading={isCheckingOut}
                onCancel={handleCancelCheckout}
              />
            )}

            {showResult && (
              <ResultDisplay
                result={checkoutResult}
                product={selectedProduct}
                onReset={handleReset}
                error={checkoutError}
              />
            )}

            {isProcessing && status && (
              <StatusTracker status={status} isLoading={false} />
            )}

            {searchError && appState === 'search' && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                {searchError}
              </div>
            )}
          </aside>

          <section>
            {showSearchSection && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {products.length > 0
                        ? `Found ${products.length} products`
                        : 'Search for products'}
                    </h2>
                    {selectedProduct && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {selectedProduct.title.slice(0, 50)}...
                      </p>
                    )}
                  </div>
                  {selectedProduct && (
                    <button
                      onClick={handleSelectForCheckout}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Proceed to Checkout
                    </button>
                  )}
                </div>

                <ProductList
                  products={products}
                  selectedProduct={selectedProduct}
                  onSelectProduct={setSelectedProduct}
                  isLoading={isSearching}
                />
              </>
            )}

            {showCheckoutForm && (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Complete the checkout form to proceed</p>
                </div>
              </div>
            )}

            {showResult && (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Checkout process completed</p>
                  <p className="text-sm">See results on the left</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
