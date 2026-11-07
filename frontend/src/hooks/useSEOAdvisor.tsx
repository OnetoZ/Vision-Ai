import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { fetchApi } from '@/lib/api';

export interface SEOAdvisorData {
  id: string;
  name: string;
  url: string;
  scores: {
    onPage: number;
    technical: number;
    content: number;
    overall: number;
  };
  suggestions?: string[];
  details: {
    onPage: { checks: any[] };
    technical: { checks: any[] };
    content: { checks: any[] };
  };
}

export const useSEOAdvisor = (competitorId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['seo-scores', competitorId, user?.id],
    queryFn: async (): Promise<SEOAdvisorData[]> => {
      if (!user) return [];
      try {
        const url = competitorId ? `/seo/scores/${competitorId}` : '/seo/overview';
        const response = await fetchApi(url);
        // The API returns { "seo_data": [...] }
        return response.seo_data || [];
      } catch (err) {
        return [];
      }
    },
    enabled: !!user,
  });
};
