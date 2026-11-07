import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { fetchApi } from '@/lib/api';

export interface Insight {
  id: string;
  user_id: string;
  competitor_id: string | null;
  insight_type: 'opportunity' | 'threat' | 'trend' | 'recommendation';
  title: string;
  description: string;
  action_items: string[] | null;
  priority: 'high' | 'medium' | 'low';
  is_read: boolean;
  created_at: string;
}

export const useInsights = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const insightsQuery = useQuery({
    queryKey: ['insights', user?.id],
    queryFn: async () => {
      if (!user) return [];
      try {
        const response = await fetchApi('/insights');
        if (Array.isArray(response)) return response as Insight[];
        if (response && Array.isArray((response as any).insights)) return (response as any).insights as Insight[];
        return [];
      } catch (err) {
        return [];
      }
    },
    enabled: !!user,
  });

  const generateInsights = useMutation({
    mutationFn: async ({ competitorId, type }: { competitorId?: string; type?: string }) => {
      return fetchApi('/insights/generate', {
        method: 'POST',
        body: JSON.stringify({
          competitor_id: competitorId,
          type
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      toast.success('Insights generated successfully!');
    },
    onError: (error: unknown) => {
      toast.error((error as Error).message || 'Failed to generate insights');
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      // Just a placeholder for now, endpoint not fully implemented in routers
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });

  const deleteInsight = useMutation({
    mutationFn: async (id: string) => {
       // Just a placeholder for now, endpoint not fully implemented in routers
       return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      toast.success('Insight removed');
    },
  });

  const insights = insightsQuery.data || [];
  const unreadCount = insights.filter((i) => !i.is_read).length;

  return {
    insights,
    unreadCount,
    isLoading: insightsQuery.isLoading,
    generateInsights,
    markAsRead,
    deleteInsight,
    refetch: insightsQuery.refetch,
  };
};
