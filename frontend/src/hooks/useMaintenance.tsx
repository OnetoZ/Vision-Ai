import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';

export interface MaintenanceFinding {
  id: string;
  competitorId: string;
  competitorName: string;
  competitorUrl: string;
  pageUrl: string;
  rule: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
  date: string | null;
}

export const useMaintenance = () => {
  return useQuery({
    queryKey: ['maintenance'],
    queryFn: async (): Promise<{ findings: MaintenanceFinding[] }> => {
      const data = await fetchApi('/maintenance');
      return data;
    },
  });
};
