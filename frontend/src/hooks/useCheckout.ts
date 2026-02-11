import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { CheckoutRequest, CheckoutResponse } from '@/types';
import { useState } from 'react';

export function useCheckout() {
  const [result, setResult] = useState<CheckoutResponse | null>(null);

  const mutation = useMutation({
    mutationFn: (request: CheckoutRequest) => apiClient.checkout(request),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setResult(response.data);
      }
    },
  });

  const checkout = (request: CheckoutRequest) => {
    mutation.mutate(request);
  };

  const reset = () => {
    setResult(null);
    mutation.reset();
  };

  return {
    checkout,
    reset,
    result,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
    requestId: mutation.data?.meta.requestId ?? null,
    isSuccess: mutation.isSuccess && result !== null,
  };
}
