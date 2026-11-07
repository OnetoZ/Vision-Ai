import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { fetchApi } from '@/lib/api';
import { useCompetitors } from './useCompetitors';

export interface ContentMonitorData {
  id: string;
  name: string;
  url: string;
  articleCount?: number;
  publishingFrequency?: string;
  momentum?: 'High' | 'Medium' | 'Low';
  feed?: any[];
}

export const useContentTracker = (competitorId?: string) => {
  const { user } = useAuth();
  const { competitors } = useCompetitors();

  return useQuery({
    queryKey: ['content-changes', competitorId, user?.id, competitors.length],
    queryFn: async () => {
      if (!user) return [];
      if (competitorId) {
        try {
          const response = await fetchApi(`/content/changes/${competitorId}`);
          return response.pages || [];
        } catch {
          return [];
        }
      }

      const items: ContentMonitorData[] = await Promise.all(
        (competitors || []).map(async (c) => {
          let pages = [];
          try {
            const response = await fetchApi(`/content/changes/${c.id}`);
            pages = response.pages || [];
          } catch {}
          return {
            id: c.id,
            name: c.name,
            url: c.url,
            articleCount: pages.length,
            publishingFrequency: pages.length > 5 ? '3-5 posts / week' : '1-2 posts / week',
            momentum: (pages.length > 5 ? 'High' : pages.length > 0 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
            feed: pages,
          };
        })
      );
      return items;
    },
    enabled: !!user,
  });
};
