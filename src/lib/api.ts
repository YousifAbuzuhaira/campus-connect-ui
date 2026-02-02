/**
 * src/lib/api.ts
 *
 * This file provides functions for interacting with the marketplace API,
 * specifically for fetching listings with advanced search, filtering, and sorting capabilities.
 * It encapsulates the logic for constructing API requests and handling responses.
 */

// --- Interfaces ---

/**
 * Represents a single listing item in the marketplace.
 * This interface defines the expected structure of a listing object returned by the API.
 */
export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'New' | 'Used - Like New' | 'Used - Good' | 'Used - Fair' | 'For Parts';
  location: string; // e.g., "Campus Dorm A", "Library", "Off-Campus Apartment"
  imageUrl: string; // URL to the primary image of the listing
  postedDate: string; // ISO 8601 date string, e.g., "2023-10-27T10:00:00Z"
  sellerId: string; // ID of the user who posted the listing
  // Additional fields can be added here as the application evolves
}

/**
 * Parameters for searching, filtering, and sorting listings.
 * This interface defines all possible criteria that can be sent to the API
 * to refine the listing results.
 */
export interface SearchListingsParams {
  query?: string; // Full-text search query string (e.g., "textbook", "bike")
  categories?: string[]; // Filter by one or more specific categories (e.g., ["Electronics", "Books"])
  minPrice?: number; // Minimum price for listings
  maxPrice?: number; // Maximum price for listings
  conditions?: Array<Listing['condition']>; // Filter by one or more conditions (e.g., ["New", "Used - Like New"])
  location?: string; // Filter by a specific location (e.g., "Campus Dorm A")
  sortBy?: 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc' | 'relevance'; // Sorting criteria
  page?: number; // Current page number for pagination (1-indexed)
  limit?: number; // Number of items per page for pagination
}

/**
 * Generic interface for a paginated API response.
 * This structure is common for API endpoints that return a list of items
 * along with pagination metadata.
 */
export interface PaginatedResponse<T> {
  data: T[]; // The array of items for the current page
  total: number; // Total number of items across all pages
  page: number; // The current page number
  limit: number; // The number of items requested per page
  totalPages: number; // Total number of pages available
}

// --- API Configuration ---

// Base URL for the API. It's good practice to load this from environment variables
// to allow for different API endpoints in development, staging, and production.
// Using `import.meta.env.VITE_API_BASE_URL` is common in Vite-based projects.
// Fallback to `/api` for development or if the variable is not set.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// --- API Functions ---

/**
 * Fetches listings from the marketplace API with advanced search, filtering, and sorting capabilities.
 * This function constructs a URL with appropriate query parameters based on the provided `params` object.
 *
 * @param params - An object containing search query, filter options (categories, price range, condition, location),
 *                 sorting criteria, and pagination settings. Defaults to an empty object if not provided.
 * @returns A Promise that resolves to a `PaginatedResponse<Listing>` containing the fetched listings
 *          and pagination metadata.
 * @throws An `Error` if the API request fails (e.g., network error, non-2xx HTTP status, or invalid response).
 */
export async function searchListings(
  params: SearchListingsParams = {}
): Promise<PaginatedResponse<Listing>> {
  try {
    // Initialize URLSearchParams to build the query string dynamically.
    // This handles proper URL encoding of parameter values.
    const queryParams = new URLSearchParams();

    // Append search query if provided
    if (params.query) {
      queryParams.append('q', params.query);
    }

    // Append category filters. Multiple categories are sent as multiple 'category' parameters.
    if (params.categories && params.categories.length > 0) {
      params.categories.forEach(cat => queryParams.append('category', cat));
    }

    // Append price range filters
    if (params.minPrice !== undefined) {
      queryParams.append('minPrice', params.minPrice.toString());
    }
    if (params.maxPrice !== undefined) {
      queryParams.append('maxPrice', params.maxPrice.toString());
    }

    // Append condition filters. Multiple conditions are sent as multiple 'condition' parameters.
    if (params.conditions && params.conditions.length > 0) {
      params.conditions.forEach(cond => queryParams.append('condition', cond));
    }

    // Append location filter
    if (params.location) {
      queryParams.append('location', params.location);
    }

    // Append sorting criteria
    if (params.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }

    // Append pagination parameters
    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }

    // Construct the full API URL for the listings endpoint
    const url = `${API_BASE_URL}/listings?${queryParams.toString()}`;

    // Perform the HTTP GET request using the native Fetch API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add any necessary authentication headers here, e.g.:
        // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
    });

    // Check if the HTTP response status indicates an error (e.g., 4xx or 5xx)
    if (!response.ok) {
      // Attempt to parse a detailed error message from the response body
      let errorMessage = `API request failed with status ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && typeof errorData === 'object' && 'message' in errorData) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch (parseError) {
        // If parsing JSON fails, log it but proceed with the default error message
        console.warn('Failed to parse error response JSON:', parseError);
      }
      // Throw a new Error with the determined message
      throw new Error(errorMessage);
    }

    // Parse the successful JSON response into the PaginatedResponse<Listing> format
    const data: PaginatedResponse<Listing> = await response.json();
    return data;

  } catch (error) {
    // Catch any errors that occur during the fetch operation (e.g., network issues, JSON parsing errors)
    console.error('Error fetching listings:', error);

    // Re-throw a more generalized error message for the caller, ensuring it's an Error instance.
    if (error instanceof Error) {
      throw new Error(`Failed to retrieve listings: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while fetching listings.');
    }
  }
}