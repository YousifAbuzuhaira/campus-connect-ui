import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ENDPOINTS, authHelpers } from '../lib/api-config';

export interface WishlistItem {
  id: string;
  listing_id: string;
  user_id: string;
  saved_price: number;
  saved_at: string;
  listing: any;
  price_changed: boolean;
  current_price: number;
}

const WISHLIST_ENDPOINTS = {
  ALL: '/wishlist',
  TOGGLE: (listingId: string) => `/wishlist/${listingId}`,
  CHECK: (listingId: string) => `/wishlist/check/${listingId}`,
  PRICE_DROPS: '/wishlist/price-drops',
};

export const useWishlistItems = () => {
  const token = authHelpers.getToken();

  return useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const response = await api.get(WISHLIST_ENDPOINTS.ALL);
      return response.data.items || response.data || [];
    },
    enabled: !!token,
    retry: false,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string): Promise<{ saved: boolean }> => {
      const response = await api.post(WISHLIST_ENDPOINTS.TOGGLE(listingId));
      return response.data;
    },
    onSuccess: (_data, listingId) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-check', listingId] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-count'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-price-drops'] });
    },
  });
};

export const useCheckWishlist = (listingId: string) => {
  const token = authHelpers.getToken();

  return useQuery<boolean>({
    queryKey: ['wishlist-check', listingId],
    queryFn: async () => {
      const response = await api.get(WISHLIST_ENDPOINTS.CHECK(listingId));
      return response.data.saved || false;
    },
    enabled: !!listingId && !!token,
    retry: false,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useWishlistCount = () => {
  const token = authHelpers.getToken();
  const { data: items } = useWishlistItems();

  if (!token) return 0;

  return items?.length || 0;
};

export const usePriceDrops = () => {
  const token = authHelpers.getToken();

  return useQuery<WishlistItem[]>({
    queryKey: ['wishlist-price-drops'],
    queryFn: async () => {
      const response = await api.get(WISHLIST_ENDPOINTS.PRICE_DROPS);
      return response.data.items || response.data || [];
    },
    enabled: !!token,
    retry: false,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};