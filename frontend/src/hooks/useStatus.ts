import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { AutomationStatus } from '@/types';

interface UseStatusOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useStatus(requestId: string | null, options: UseStatusOptions = {}) {
  const { enabled = true, refetchInterval = 1000 } = options;

  const query = useQuery({
    queryKey: ['status', requestId],
    queryFn: async () => {
      if (!requestId) throw new Error('No request ID');
      const response = await apiClient.getStatus(requestId);
      if (!response.success) throw new Error(response.error?.message);
      return response.data as AutomationStatus;
    },
    enabled: enabled && requestId !== null,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.currentStep === 'completed' || data?.currentStep === 'failed') {
        return false;
      }
      return refetchInterval;
    },
  });

  return {
    status: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    isCompleted: query.data?.currentStep === 'completed',
    isFailed: query.data?.currentStep === 'failed',
    isFinished: query.data?.currentStep === 'completed' || query.data?.currentStep === 'failed',
  };
}
