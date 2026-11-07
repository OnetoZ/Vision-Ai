import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { fetchApi } from '@/lib/api';

export const usePriceMonitor = (competitorId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pricing', competitorId, user?.id],
    queryFn: async () => {
      if (!user || !competitorId) return null;
      try {
        const response = await fetchApi(`/pricing/${competitorId}`);
        return response.pricing;
      } catch (err) {
        return null;
      }
    },
    enabled: !!user && !!competitorId,
  });
};
