// API Hooks using TanStack Query for Campus Connect
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildApiUrl, authHelpers, API_CONFIG } from '@/lib/api-config';
import { useAuth } from '@/contexts/AuthContext';

// Types (you can expand these based on your backend schemas)
export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  university?: string;
  phone?: string;
  balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition?: string;
  pickup_location?: string;
  stock?: number;
  buyer_ids?: string[];
  is_sold: boolean;
  is_reported: boolean;
  is_hidden: boolean;
  images?: string[];
  tags?: string[];
  views: number;
  created_at: string;
  updated_at: string;
  seller_email?: string;
  seller_name?: string;
  average_rating?: number;
  total_ratings?: number;
}

export interface Rating {
  id: string;
  listing_id: string;
  user_id: string;
  rating: number;
  comment: string;
  user_name: string;
  created_at: string;
  updated_at: string;
}

export interface RatingsResponse {
  ratings: Rating[];
  total: number;
  average_rating?: number;
  total_ratings: number;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// API Functions
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint);
  const headers = {
    'Content-Type': 'application/json',
    ...authHelpers.getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
};

// Auth API calls
export const authAPI = {
  login: async (credentials: { email: string; password: string }) =>
    apiRequest(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    
  register: async (userData: {
    email: string;
    password: string;
    username: string;
    full_name: string;
    university?: string;
    phone?: string;
  }) =>
    apiRequest(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    
  getMe: async (): Promise<User> =>
    apiRequest(API_CONFIG.ENDPOINTS.AUTH.ME),
};

// Listings API calls
export const listingsAPI = {
  getListings: async (params?: {
    page?: number;
    per_page?: number;
    category?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
  }): Promise<ListingsResponse> => {
    const endpoint = params 
      ? `${API_CONFIG.ENDPOINTS.LISTINGS.ALL}?${new URLSearchParams(
          Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== undefined) acc[key] = value.toString();
            return acc;
          }, {} as Record<string, string>)
        )}`
      : API_CONFIG.ENDPOINTS.LISTINGS.ALL;
    
    return apiRequest(endpoint);
  },
  
  getListing: async (id: string): Promise<Listing> =>
    apiRequest(API_CONFIG.ENDPOINTS.LISTINGS.BY_ID(id)),
    
  createListing: async (listingData: {
    title: string;
    description: string;
    price: number;
    category: string;
    condition?: string;
    location?: string;
    images?: string[];
    tags?: string[];
  }) =>
    apiRequest(API_CONFIG.ENDPOINTS.LISTINGS.CREATE, {
      method: 'POST',
      body: JSON.stringify(listingData),
    }),
    
  updateListing: async (id: string, listingData: Partial<{
    title: string;
    description: string;
    price: number;
    category: string;
    condition: string;
    location: string;
    images: string[];
    tags: string[];
    status: string;
  }>) =>
    apiRequest(API_CONFIG.ENDPOINTS.LISTINGS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(listingData),
    }),
    
  deleteListing: async (id: string) =>
    apiRequest(API_CONFIG.ENDPOINTS.LISTINGS.DELETE(id), {
      method: 'DELETE',
    }),
    
  getMyListings: async (params?: { page?: number; per_page?: number }): Promise<ListingsResponse> => {
    const endpoint = params 
      ? `${API_CONFIG.ENDPOINTS.LISTINGS.MY_LISTINGS}?${new URLSearchParams(
          Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== undefined) acc[key] = value.toString();
            return acc;
          }, {} as Record<string, string>)
        )}`
      : API_CONFIG.ENDPOINTS.LISTINGS.MY_LISTINGS;
    
    return apiRequest(endpoint);
  },
  
  purchaseListing: async (id: string, purchaseData: { quantity: number }) =>
    apiRequest(`${API_CONFIG.ENDPOINTS.LISTINGS.BY_ID(id)}/purchase`, {
      method: 'POST',
      body: JSON.stringify(purchaseData),
    }),
};

// Ratings API calls
export const ratingsAPI = {
  getRatings: async (listingId: string, params?: {
    page?: number;
    per_page?: number;
  }): Promise<RatingsResponse> => {
    const endpoint = params 
      ? `${API_CONFIG.ENDPOINTS.RATINGS.BY_LISTING_ID(listingId)}?${new URLSearchParams(
          Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== undefined) acc[key] = value.toString();
            return acc;
          }, {} as Record<string, string>)
        )}`
      : API_CONFIG.ENDPOINTS.RATINGS.BY_LISTING_ID(listingId);
    
    return apiRequest(endpoint);
  },
  
  createRating: async (listingId: string, ratingData: {
    rating: number;
    comment: string;
  }) =>
    apiRequest(API_CONFIG.ENDPOINTS.RATINGS.CREATE(listingId), {
      method: 'POST',
      body: JSON.stringify(ratingData),
    }),
    
  updateRating: async (listingId: string, ratingId: string, ratingData: {
    rating?: number;
    comment?: string;
  }) =>
    apiRequest(API_CONFIG.ENDPOINTS.RATINGS.UPDATE(listingId, ratingId), {
      method: 'PUT',
      body: JSON.stringify(ratingData),
    }),
    
  deleteRating: async (listingId: string, ratingId: string) =>
    apiRequest(API_CONFIG.ENDPOINTS.RATINGS.DELETE(listingId, ratingId), {
      method: 'DELETE',
    }),
};

// React Query Hooks

// Auth hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      authHelpers.setToken(data.access_token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authAPI.register,
  });
};

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: authAPI.getMe,
    enabled: !!authHelpers.getToken(),
    retry: false,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      authHelpers.removeToken();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

// Listings hooks
export const useListings = (params?: {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
}) => {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: async () => {
      const response = await listingsAPI.getListings(params);
      // Backend returns { listings: [...], total, page, per_page, total_pages }
      // Frontend expects just the listings array
      return response.listings;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useListing = (id: string) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsAPI.getListing(id),
    enabled: !!id,
  });
};

export const useCreateListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: listingsAPI.createListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof listingsAPI.updateListing>[1] }) =>
      listingsAPI.updateListing(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: listingsAPI.deleteListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
};

export const useMyListings = (params?: { page?: number; per_page?: number }) => {
  return useQuery({
    queryKey: ['myListings', params],
    queryFn: () => listingsAPI.getMyListings(params),
    enabled: !!authHelpers.getToken(),
  });
};

export const usePurchaseListing = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      listingsAPI.purchaseListing(id, { quantity }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // Refresh user data in AuthContext to update balance in navbar
      refreshUser();
    },
  });
};

// Ratings hooks
export const useRatings = (listingId: string, params?: { page?: number; per_page?: number }) => {
  return useQuery({
    queryKey: ['ratings', listingId, params],
    queryFn: () => ratingsAPI.getRatings(listingId, params),
    enabled: !!listingId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateRating = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listingId, rating, comment }: { listingId: string; rating: number; comment: string }) =>
      ratingsAPI.createRating(listingId, { rating, comment }),
    onSuccess: (_, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: ['ratings', listingId] });
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
};

export const useUpdateRating = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listingId, ratingId, rating, comment }: { 
      listingId: string; 
      ratingId: string; 
      rating?: number; 
      comment?: string; 
    }) =>
      ratingsAPI.updateRating(listingId, ratingId, { rating, comment }),
    onSuccess: (_, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: ['ratings', listingId] });
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
};

export const useDeleteRating = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listingId, ratingId }: { listingId: string; ratingId: string }) =>
      ratingsAPI.deleteRating(listingId, ratingId),
    onSuccess: (_, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: ['ratings', listingId] });
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
};