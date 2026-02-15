import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { SearchRequest, Product } from '@/types';
import { useState } from 'react';

export function useSearch() {
  const [products, setProducts] = useState<Product[]>([]);

  const mutation = useMutation({
    mutationFn: (request: SearchRequest) => apiClient.search(request),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setProducts(response.data.products);
      }
    },
  });

  const search = (request: SearchRequest) => {
    setProducts([]);
    mutation.mutate(request);
  };

  const clearResults = () => {
    setProducts([]);
  };

  return {
    search,
    clearResults,
    products,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
    requestId: mutation.data?.meta.requestId ?? null,
  };
}
