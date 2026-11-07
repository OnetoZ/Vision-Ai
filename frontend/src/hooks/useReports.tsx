import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { fetchApi } from '@/lib/api';

export interface Report {
  id: string;
  name: string;
  report_type: 'weekly' | 'monthly' | 'custom';
  description: string;
  last_generated: string | null;
  schedule: string | null;
  format: 'pdf' | 'csv' | 'json';
  created_at: string;
}

export const useReports = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const reportsQuery = useQuery({
    queryKey: ['reports', user?.id],
    queryFn: async () => {
      if (!user) return [];
      try {
        const response = await fetchApi('/reports');
        return response as Report[];
      } catch (err) {
        return [];
      }
    },
    enabled: !!user,
  });

  const generateReport = useMutation({
    mutationFn: async (data: Partial<Report>) => {
      return fetchApi('/reports', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report generated successfully!');
    },
    onError: (error: unknown) => {
      toast.error((error as Error).message || 'Failed to generate report');
    },
  });

  const reports = reportsQuery.data || [];

  return {
    reports,
    isLoading: reportsQuery.isLoading,
    generateReport,
    refetch: reportsQuery.refetch,
  };
};
