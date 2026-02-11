import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { SearchRequest, Product } from '@/types';
import { useState } from 'react';

export function useSearch() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const mutation = useMutation({
    mutationFn: (request: SearchRequest) => apiClient.search(request),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setProducts(response.data.products);
        setSelectedProduct(response.data.selectedProduct);
      }
    },
  });

  const search = (request: SearchRequest) => {
    mutation.mutate(request);
  };

  const clearResults = () => {
    setProducts([]);
    setSelectedProduct(null);
  };

  return {
    search,
    clearResults,
    products,
    selectedProduct,
    setSelectedProduct,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
    requestId: mutation.data?.meta.requestId ?? null,
  };
}
