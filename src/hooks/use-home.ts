import { useQuery } from '@tanstack/react-query';
import { api, ENDPOINTS } from '../lib/api-config';
import { HomeData, Category } from '../lib/types';

// Home page hooks
export const useHomeData = () => {
  return useQuery<HomeData>({
    queryKey: ['home-data'],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.HOME.DATA);
      return response.data;
    },
  });
};

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.HOME.CATEGORIES);
      return response.data;
    },
  });
};