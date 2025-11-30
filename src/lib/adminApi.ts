import { User, Listing, AdminStats, SuccessResponse } from '@/lib/types';
import { API_CONFIG } from '@/lib/api-config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Admin user management
export const adminApi = {
  // Get all users
  getUsers: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    is_banned?: boolean;
  }): Promise<User[]> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_banned !== undefined) queryParams.append('is_banned', params.is_banned.toString());

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/admin/users?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch users');
    }

    return response.json();
  },

  // Ban user
  banUser: async (userId: string): Promise<SuccessResponse> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/admin/users/${userId}/ban`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to ban user');
    }

    return response.json();
  },

  // Unban user
  unbanUser: async (userId: string): Promise<SuccessResponse> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/admin/users/${userId}/unban`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to unban user');
    }

    return response.json();
  },

  // Delete user account
  deleteUser: async (userId: string): Promise<SuccessResponse> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete user');
    }

    return response.json();
  },

  // Get all listings (including hidden)
  getListings: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    include_hidden?: boolean;
  }): Promise<Listing[]> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.include_hidden) queryParams.append('include_hidden', params.include_hidden.toString());

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/admin/listings?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch listings');
    }

    return response.json();
  },

  // Delete listing
  deleteListing: async (listingId: string): Promise<SuccessResponse> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/admin/listings/${listingId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete listing');
    }

    return response.json();
  },

  // Get admin statistics
  getStats: async (): Promise<AdminStats> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/admin/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch admin stats');
    }

    return response.json();
  },

  // Get specific user profile (admin only)
  getUserProfile: async (userId: string): Promise<User> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/admin/users/${userId}/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch user profile');
    }

    return response.json();
  },
};