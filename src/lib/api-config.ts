// API Configuration for Campus Connect Frontend
import axios from 'axios';

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    // Authentication
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me',
    },
    // Users
    USERS: {
      PROFILE: '/api/users/profile',
      BY_ID: (id: string) => `/api/users/${id}`,
      DELETE_ACCOUNT: '/api/users/account',
    },
    // Listings/Products
    LISTINGS: {
      ALL: '/api/listings/',
      BY_ID: (id: string) => `/api/listings/${id}`,
      CREATE: '/api/listings/',
      UPDATE: (id: string) => `/api/listings/${id}`,
      DELETE: (id: string) => `/api/listings/${id}`,
      MY_LISTINGS: '/api/listings/user/my-listings',
    },
    // Chat
    CHAT: {
      ALL: '/api/chat/',
      CREATE: '/api/chat/',
      MESSAGES: (chatId: string) => `/api/chat/${chatId}/messages`,
      SEND_MESSAGE: (chatId: string) => `/api/chat/${chatId}/messages`,
      MARK_READ: (chatId: string) => `/api/chat/${chatId}/mark-read`,
    },
    // Reports
    REPORTS: {
      CREATE: '/api/reports/',
      MY_REPORTS: '/api/reports/my-reports',
      BY_ID: (id: string) => `/api/reports/${id}`,
    },
    // Home
    HOME: {
      DATA: '/api/home/',
      CATEGORIES: '/api/home/categories',
    },
    // Ratings
    RATINGS: {
      BY_LISTING_ID: (listingId: string) => `/api/ratings/${listingId}`,
      CREATE: (listingId: string) => `/api/ratings/${listingId}`,
      UPDATE: (listingId: string, ratingId: string) => `/api/ratings/${listingId}/${ratingId}`,
      DELETE: (listingId: string, ratingId: string) => `/api/ratings/${listingId}/${ratingId}`,
    },
  },
} as const;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value.toString());
    });
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// Auth token helpers
export const authHelpers = {
  setToken: (token: string) => localStorage.setItem('token', token),
  getToken: () => localStorage.getItem('token'),
  removeToken: () => localStorage.removeItem('token'),
  getAuthHeaders: () => {
    const token = authHelpers.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

// Create axios instance
export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
api.interceptors.request.use(
  (config) => {
    const token = authHelpers.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to prevent infinite redirects
let isRedirecting = false;

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      authHelpers.removeToken();
      
      // Only redirect if we're not already on the auth page
      if (window.location.pathname !== '/auth') {
        console.warn('Authentication failed, redirecting to login...');
        window.location.replace('/auth');
      }
      
      // Reset flag after a delay
      setTimeout(() => {
        isRedirecting = false;
      }, 1000);
    }
    return Promise.reject(error);
  }
);

// Export endpoints for easy access
export const ENDPOINTS = API_CONFIG.ENDPOINTS;

export default API_CONFIG;