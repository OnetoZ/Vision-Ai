import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { fetchApi } from '@/lib/api';

export interface Product {
  id: string;
  competitor_id: string;
  name: string;
  description?: string;
  category?: string;
  price?: string | number;
  currency?: string;
  features?: string[];
  url?: string;
  image_url?: string;
  created_at?: string;
}

export const useProducts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['products', user?.id],
    queryFn: async (): Promise<Product[]> => {
      if (!user) return [];
      try {
        const response = await fetchApi('/products');
        return Array.isArray(response) ? response : (response.products || []);
      } catch (err) {
        return [];
      }
    },
    enabled: !!user,
  });
};

