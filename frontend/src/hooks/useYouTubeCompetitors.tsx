import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { fetchApi } from '@/lib/api';

export interface YouTubeCompetitor {
  id: string;
  user_id: string;
  name: string;
  url: string;
  channel_id: string | null;
  subscriber_count?: number;
  video_count?: number;
  competitor_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface YouTubeGap {
  id: string;
  topic: string;
  description: string | null;
  competition_level: string;
  opportunity_score: number;
  evidence: any;
}

export const useYouTubeCompetitors = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const competitorsQuery = useQuery({
    queryKey: ['youtube-competitors', user?.id],
    queryFn: async () => {
      if (!user) return [];
      try {
        const data = await fetchApi('/youtube/competitors');
        return (data || []) as YouTubeCompetitor[];
      } catch {
        return [];
      }
    },
    enabled: !!user,
  });

  const addCompetitor = useMutation({
    mutationFn: async (url: string) => {
      return fetchApi('/youtube/competitors', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-competitors'] });
      toast.success('YouTube channel added! Analysis started in background.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add YouTube channel');
    },
  });

  const deleteCompetitor = useMutation({
    mutationFn: async (id: string) => {
      return fetchApi(`/youtube/competitors/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-competitors'] });
      toast.success('YouTube channel removed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove channel');
    },
  });

  const rescanCompetitor = useMutation({
    mutationFn: async (id: string) => {
      return fetchApi(`/youtube/competitors/${id}/rescan`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-competitors'] });
      toast.success('Channel rescan queued');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to rescan channel');
    },
  });

  const channels = competitorsQuery.data || [];

  return {
    competitors: channels,
    channels,
    isLoading: competitorsQuery.isLoading,
    isError: competitorsQuery.isError,
    addCompetitor,
    deleteCompetitor,
    rescanCompetitor,
    refetch: competitorsQuery.refetch,
  };
};


export const useYouTubeGaps = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['youtube-gaps', user?.id],
    queryFn: async (): Promise<YouTubeGap[]> => {
      if (!user) return [];
      try {
        const data = await fetchApi('/youtube/gaps');
        return Array.isArray(data) ? data : (data.gaps || []);
      } catch {
        return [];
      }
    },
    enabled: !!user,
  });

  const generateGaps = useMutation({
    mutationFn: async () => {
      return fetchApi('/youtube/gaps/generate', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-gaps'] });
      toast.success('YouTube gap discovery completed!');
    },
    onError: () => {
      toast.error('Failed to generate YouTube gaps');
    },
  });

  return {
    gaps: query.data || [],
    isLoading: query.isLoading,
    generateGaps,
    refetch: query.refetch,
  };
};

export const useYouTubeDashboardSummary = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['youtube-summary', user?.id],
    queryFn: async () => {
      if (!user) return null;
      try {
        return await fetchApi('/youtube/summary');
      } catch {
        return null;
      }
    },
    enabled: !!user,
  });
};
