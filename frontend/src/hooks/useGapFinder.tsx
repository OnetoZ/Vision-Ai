import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { fetchApi } from '@/lib/api';

export interface GapItem {
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  company?: string;
}

export interface GapAnalysisResponse {
  status?: string;
  feature_gaps: GapItem[];
  pricing_gaps: GapItem[];
}

export const useGapFinder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['gap-analysis', user?.id],
    queryFn: async (): Promise<GapAnalysisResponse> => {
      if (!user) return { feature_gaps: [], pricing_gaps: [] };
      try {
        const response = await fetchApi('/gap-finder/analysis');
        return response;
      } catch (err) {
        console.error("Failed to fetch gap analysis", err);
        return { feature_gaps: [], pricing_gaps: [] };
      }
    },
    enabled: !!user,
  });

  const generateMutation = useMutation({
    mutationFn: async (): Promise<GapAnalysisResponse> => {
      const response = await fetchApi('/gap-finder/analysis/generate', {
        method: 'POST',
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['gap-analysis', user?.id], data);
    },
  });

  return {
    ...query,
    generateAnalysis: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
  };
};
