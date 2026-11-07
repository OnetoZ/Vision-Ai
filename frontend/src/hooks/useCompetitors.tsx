import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { fetchApi } from '@/lib/api';

export interface Competitor {
  id: string;
  user_id: string;
  url: string;
  name: string;
  industry: string | null;
  competitor_type: string;
  status: 'active' | 'paused' | 'error' | 'crawling' | 'analyzing' | 'queued';
  scan_frequency: string | null;
  last_scanned_at: string | null;
  created_at: string;
  updated_at: string;
  latest_crawl_status?: string | null;
  metadata?: any;
}

export interface CrawlRun {
  id: string;
  competitor_id: string;
  status: string;
  pages_discovered: number;
  pages_analyzed: number;
  pages_failed: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface SEOGap {
  id: string;
  issue_type: string;
  issue_description: string;
  recommendation: string;
  severity: string;
  impact_score: number;
  competitor_scans?: {
    competitor_id?: string;
    competitors?: { name?: string };
  };
  created_at?: string;
}

export const useCompetitors = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const competitorsQuery = useQuery({
    queryKey: ['competitors', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const data = await fetchApi('/competitors');
      return data as Competitor[];
    },
    enabled: !!user,
  });

  const addCompetitor = useMutation({
    mutationFn: async (data: { name: string; url: string; industry?: string }) => {
      return await fetchApi('/competitors', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
      toast.success('Competitor added successfully!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to add competitor');
    },
  });

  const deleteCompetitor = useMutation({
    mutationFn: async (id: string) => {
      return await fetchApi(`/competitors/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
      toast.success('Competitor deleted');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete competitor');
    },
  });

  const rescanCompetitor = useMutation({
    mutationFn: async (competitor: any) => {
      const id = typeof competitor === 'string' ? competitor : competitor.id;
      return await fetchApi(`/competitors/${id}/rescan`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
      toast.success('Rescan started successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to rescan competitor');
    },
  });

  return {
    competitors: competitorsQuery.data || [],
    isLoading: competitorsQuery.isLoading,
    isError: competitorsQuery.isError,
    refetch: competitorsQuery.refetch,
    addCompetitor,
    deleteCompetitor,
    rescanCompetitor,
    analyzeCompetitor: rescanCompetitor,
  };
};

export const useSEOGaps = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['seo-gaps', user?.id],
    queryFn: async () => {
      try {
        const data = await fetchApi('/seo/gaps');
        return data as SEOGap[];
      } catch {
        return [];
      }
    },
    enabled: !!user,
  });
};

export const useCompetitorScans = (competitorId?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['scans', competitorId, user?.id],
    queryFn: async () => {
      try {
        const data = await fetchApi(`/crawls/${competitorId}`);
        return data as CrawlRun[];
      } catch {
        return [];
      }
    },
    enabled: !!user && !!competitorId,
  });
};
