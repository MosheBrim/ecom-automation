import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/api';
import type { Product } from '@/types';

export function useBuy() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (product: Product) => apiClient.buy({ product, quantity: 1 }),
    onSuccess: (response) => {
      if (response.data?.requestId) {
        navigate(`/status/${response.data.requestId}`);
      }
    },
  });

  const buy = (product: Product) => {
    mutation.mutate(product);
  };

  return {
    buy,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}
