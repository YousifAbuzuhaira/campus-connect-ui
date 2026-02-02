import { useState, useEffect, useCallback, useRef } from 'react';

// --- Type Definitions ---
/**
 * Defines the possible categories for a listing.
 */
export type Category = 'Electronics' | 'Books' | 'Furniture' | 'Apparel' | 'Services' | 'Other';

/**
 * Defines the possible conditions for a listing.
 */
export type Condition = 'New' | 'Used - Like New' | 'Used - Good' | 'Used - Fair';

/**
 * Defines the possible locations for a listing.
 */
export type Location = 'On-Campus' | 'Off-Campus';

/**
 * Represents a single item listing in the marketplace.
 */
export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  condition: Condition;
  location: Location;
  imageUrl: string;
  postedDate: string; // ISO date string (e.g., '2023-10-26T10:00:00Z')
  sellerId: string;
}

/**
 * Defines the available filter options for listings.
 */
export interface FilterOptions {
  category?: Category | 'All';
  minPrice?: number;
  maxPrice?: number;
  condition?: Condition | 'All';
  location?: Location | 'All';
}

/**
 * Defines the fields by which listings can be sorted.
 */
export type SortField = 'price' | 'postedDate' | 'relevance' | 'title';

/**
 * Defines the sort order (ascending or descending).
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Defines the sorting criteria for listings.
 */
export interface SortOptions {
  field: SortField;
  order: SortOrder;
}

// --- Mock Data (for demonstration purposes) ---
// In a real application, this data would be fetched from a backend API.
const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Textbook: Introduction to Algorithms',
    description: 'Used textbook for CS 101. Good condition, some highlighting.',
    price: 50.00,
    category: 'Books',
    condition: 'Used - Good',
    location: 'On-Campus',
    imageUrl: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Textbook',
    postedDate: '2023-10-26T10:00:00Z',
    sellerId: 'user1',
  },
  {
    id: '2',
    title: 'Gaming Monitor 27 inch',
    description: 'Almost new gaming monitor, 144Hz, 1ms response time.',
    price: 250.00,
    category: 'Electronics',
    condition: 'Used - Like New',
    location: 'Off-Campus',
    imageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Monitor',
    postedDate: '2023-10-25T14:30:00Z',
    sellerId: 'user2',
  },
  {
    id: '3',
    title: 'Desk Chair',
    description: 'Comfortable office chair, minor wear and tear.',
    price: 75.00,
    category: 'Furniture',
    condition: 'Used - Fair',
    location: 'On-Campus',
    imageUrl: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Chair',
    postedDate: '2023-10-24T11:00:00Z',
    sellerId: 'user1',
  },
  {
    id: '4',
    title: 'Bluetooth Headphones',
    description: 'Brand new, still in box. Unwanted gift.',
    price: 120.00,
    category: 'Electronics',
    condition: 'New',
    location: 'On-Campus',
    imageUrl: 'https://via.placeholder.com/150/FFFF00/000000?text=Headphones',
    postedDate: '2023-10-26T15:00:00Z',
    sellerId: 'user3',
  },
  {
    id: '5',
    title: 'Mini Fridge',
    description: 'Perfect for dorm room. Clean and functional.',
    price: 100.00,
    category: 'Furniture',
    condition: 'Used - Good',
    location: 'Off-Campus',
    imageUrl: 'https://via.placeholder.com/150/FF00FF/FFFFFF?text=Fridge',
    postedDate: '2023-10-23T09:00:00Z',
    sellerId: 'user2',
  },
  {
    id: '6',
    title: 'Laptop Charger (USB-C)',
    description: 'Universal USB-C charger, 65W. Compatible with most modern laptops.',
    price: 30.00,
    category: 'Electronics',
    condition: 'Used - Like New',
    location: 'On-Campus',
    imageUrl: 'https://via.placeholder.com/150/00FFFF/000000?text=Charger',
    postedDate: '2023-10-22T16:00:00Z',
    sellerId: 'user4',
  },
  {
    id: '7',
    title: 'Winter Coat (Men\'s Large)',
    description: 'Warm winter coat, hardly worn. Great for cold weather.',
    price: 80.00,
    category: 'Apparel',
    condition: 'Used - Like New',
    location: 'Off-Campus',
    imageUrl: 'https://via.placeholder.com/150/800000/FFFFFF?text=Coat',
    postedDate: '2023-10-21T12:00:00Z',
    sellerId: 'user5',
  },
  {
    id: '8',
    title: 'Electric Kettle',
    description: 'Fast boiling electric kettle, 1.7L capacity.',
    price: 25.00,
    category: 'Electronics',
    condition: 'Used - Good',
    location: 'On-Campus',
    imageUrl: 'https://via.placeholder.com/150/808000/FFFFFF?text=Kettle',
    postedDate: '2023-10-20T08:00:00Z',
    sellerId: 'user1',
  },
  {
    id: '9',
    title: 'Graphic Design Services',
    description: 'Offering custom logo design, flyers, and social media graphics.',
    price: 150.00, // Price can be a starting point for services
    category: 'Services',
    condition: 'New', // N/A for services, but for type consistency
    location: 'On-Campus',
    imageUrl: 'https://via.placeholder.com/150/008080/FFFFFF?text=Design',
    postedDate: '2023-10-19T17:00:00Z',
    sellerId: 'user6',
  },
  {
    id: '10',
    title: 'Bicycle (Mountain Bike)',
    description: 'Good condition mountain bike, 21 speeds. Needs a tune-up.',
    price: 180.00,
    category: 'Other',
    condition: 'Used - Fair',
    location: 'Off-Campus',
    imageUrl: 'https://via.placeholder.com/150/C0C0C0/000000?text=Bike',
    postedDate: '2023-10-18T10:00:00Z',
    sellerId: 'user7',
  },
  {
    id: '11',
    title: 'Ergonomic Keyboard',
    description: 'Split ergonomic keyboard, great for long typing sessions.',
    price: 90.00,
    category: 'Electronics',
    condition: 'Used - Like New',
    location: 'On-Campus',
    imageUrl: 'https://via.placeholder.com/150/A020F0/FFFFFF?text=Keyboard',
    postedDate: '2023-10-27T09:00:00Z',
    sellerId: 'user8',
  },
  {
    id: '12',
    title: 'Coffee Maker',
    description: 'Standard drip coffee maker, 12-cup capacity.',
    price: 40.00,
    category: 'Electronics',
    condition: 'Used - Good',
    location: 'On-Campus',
    imageUrl: 'https://via.placeholder.com/150/FFD700/000000?text=Coffee',
    postedDate: '2023-10-27T11:00:00Z',
    sellerId: 'user9',
  },
  {
    id: '13',
    title: 'Digital Camera (Mirrorless)',
    description: 'Entry-level mirrorless camera with kit lens. Great for beginners.',
    price: 400.00,
    category: 'Electronics',
    condition: 'Used - Good',
    location: 'Off-Campus',
    imageUrl: 'https://via.placeholder.com/150/ADD8E6/000000?text=Camera',
    postedDate: '2023-10-26T18:00:00Z',
    sellerId: 'user10',
  },
  {
    id: '14',
    title: 'Study Lamp',
    description: 'Adjustable desk lamp with LED light. Perfect for late-night studying.',
    price: 20.00,
    category: 'Furniture',
    condition: 'New',
    location: 'On-Campus',
    imageUrl: 'https://via.placeholder.com/150/90EE90/000000?text=Lamp',
    postedDate: '2023-10-25T09:30:00Z',
    sellerId: 'user1',
  },
  {
    id: '15',
    title: 'Running Shoes (Size 10)',
    description: 'Lightly used running shoes, good for casual jogs.',
    price: 60.00,
    category: 'Apparel',
    condition: 'Used - Good',
    location: 'On-Campus',
    imageUrl: 'https://via.placeholder.com/150/DDA0DD/000000?text=Shoes',
    postedDate: '2023-10-24T14:00:00Z',
    sellerId: 'user2',
  },
];

// --- Mock API Call Simulation ---
interface FetchListingsParams {
  searchQuery?: string;
  filters?: FilterOptions;
  sortOptions?: SortOptions;
  page?: number;
  itemsPerPage?: number;
  signal?: AbortSignal;
}

interface FetchListingsResponse {
  listings: Listing[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Simulates an API call to fetch listings with search, filter, sort, and pagination capabilities.
 * In a real application, this would be an actual API call to a backend endpoint
 * that accepts these parameters and returns processed data.
 *
 * @param params - Parameters for fetching listings.
 * @returns A promise that resolves to FetchListingsResponse.
 */
const fetchListingsApi = async ({
  searchQuery = '',
  filters = {},
  sortOptions = { field: 'postedDate', order: 'desc' },
  page = 1,
  itemsPerPage = 10,
  signal,
}: FetchListingsParams): Promise<FetchListingsResponse> => {
  // Simulate network delay to mimic a real API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Check if the request was aborted during the delay
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  let filteredListings = [...mockListings];

  // 1. Apply Search: Filter by title, description, or category
  if (searchQuery) {
    const lowerCaseQuery = searchQuery.toLowerCase();
    filteredListings = filteredListings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(lowerCaseQuery) ||
        listing.description.toLowerCase().includes(lowerCaseQuery) ||
        listing.category.toLowerCase().includes(lowerCaseQuery)
    );
  }

  // 2. Apply Filters: Filter by category, condition, location, and price range
  if (filters.category && filters.category !== 'All') {
    filteredListings = filteredListings.filter((listing) => listing.category === filters.category);
  }
  if (filters.condition && filters.condition !== 'All') {
    filteredListings = filteredListings.filter((listing) => listing.condition === filters.condition);
  }
  if (filters.location && filters.location !== 'All') {
    filteredListings = filteredListings.filter((listing) => listing.location === filters.location);
  }
  if (filters.minPrice !== undefined) {
    filteredListings = filteredListings.filter((listing) => listing.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    filteredListings = filteredListings.filter((listing) => listing.price <= filters.maxPrice!);
  }

  // 3. Apply Sorting
  filteredListings.sort((a, b) => {
    let comparison = 0;
    switch (sortOptions.field) {
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'postedDate':
        comparison = new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'relevance':
      default:
        // For 'relevance', a real backend would use a sophisticated algorithm.
        // Here, we'll prioritize listings whose title contains the search query,
        // then fall back to newest posted date if no search query or titles are equally relevant.
        if (searchQuery) {
          const aMatches = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0;
          const bMatches = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0;
          comparison = bMatches - aMatches; // Prioritize exact title matches
          if (comparison === 0) { // If title match is same, fall back to date
            comparison = new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
          }
        } else {
          comparison = new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime(); // Default to newest first
        }
        break;
    }

    // Apply sort order (asc/desc)
    return sortOptions.order === 'asc' ? comparison : -comparison;
  });

  // 4. Apply Pagination
  const totalCount = filteredListings.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedListings = filteredListings.slice(startIndex, endIndex);

  return {
    listings: paginatedListings,
    totalCount,
    currentPage: page,
    totalPages,
  };
};

// --- Custom Debounce Hook ---
/**
 * Custom hook to debounce a value.
 * Useful for delaying state updates, e.g., for search inputs, to prevent
 * excessive re-renders or API calls while the user is typing.
 *
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function: clear the timeout if the value or delay changes
    // before the timeout fires, or if the component unmounts.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-run if value or delay changes

  return debouncedValue;
}

// --- Main useListings Hook ---
/**
 * Defines the return type of the `useListings` hook, providing listings data
 * and functions to control search, filtering, sorting, and pagination.
 */
interface UseListingsResult {
  listings: Listing[];
  totalListings: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: FilterOptions;
  setFilters: (filters: FilterOptions | ((prevFilters: FilterOptions) => FilterOptions)) => void;
  sortOptions: SortOptions;
  setSortOptions: (options: SortOptions | ((prevOptions: SortOptions) => SortOptions)) => void;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
}

/**
 * A React hook for fetching, searching, filtering, and sorting listings.
 * It manages state for listings, loading status, errors, search query, filters,
 * sort options, and pagination, providing a comprehensive interface for listing discovery.
 *
 * @param initialItemsPerPage The initial number of items to display per page. Defaults to 10.
 * @param debounceDelay The delay in milliseconds for debouncing the search query. Defaults to 300ms.
 * @returns An object containing listings data and control functions.
 */
export const useListings = (initialItemsPerPage: number = 10, debounceDelay: number = 300): UseListingsResult => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [totalListings, setTotalListings] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortOptions, setSortOptions] = useState<SortOptions>({ field: 'postedDate', order: 'desc' });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(initialItemsPerPage);

  // Debounce the search query to prevent excessive API calls while the user is typing.
  const debouncedSearchQuery = useDebounce(searchQuery, debounceDelay);

  // Ref to store the AbortController for cancelling previous fetch requests.
  // This helps prevent race conditions and ensures only the latest request's data is used.
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Effect hook to fetch listings whenever relevant dependencies change.
   * This includes the debounced search query, filters, sort options, current page, and items per page.
   * It handles loading states, errors, and request cancellation.
   */
  useEffect(() => {
    const fetchListings = async () => {
      // Abort any ongoing fetch request before starting a new one
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller; // Store the new controller

      setLoading(true);
      setError(null); // Clear previous errors

      try {
        const response = await fetchListingsApi({
          searchQuery: debouncedSearchQuery,
          filters,
          sortOptions,
          page: currentPage,
          itemsPerPage,
          signal: controller.signal, // Pass signal to allow cancellation
        });

        // Only update state if the request was not aborted
        if (!controller.signal.aborted) {
          setListings(response.listings);
          setTotalListings(response.totalCount);
          setTotalPages(response.totalPages);

          // Adjust current page if it's no longer valid after filtering/sorting
          // (e.g., if current page is 5 but new filters result in only 3 pages)
          if (currentPage > response.totalPages && response.totalPages > 0) {
            setCurrentPage(response.totalPages);
          } else if (response.totalPages === 0) {
            setCurrentPage(1); // Reset to page 1 if no results are found
          }
        }
      } catch (err) {
        // Handle aborted requests gracefully without showing an error to the user
        if (err instanceof DOMException && err.name === 'AbortError') {
          console.log('Fetch aborted:', err.message);
        } else {
          // Log and display other types of errors
          console.error('Failed to fetch listings:', err);
          setError('Failed to load listings. Please try again.');
          setListings([]); // Clear listings on error
          setTotalListings(0);
          setTotalPages(1);
        }
      } finally {
        // Ensure loading state is reset only if the request was not aborted
        if (!controller.signal.aborted) {
          setLoading(false);
          abortControllerRef.current = null; // Clear ref after request completes
        }
      }
    };

    fetchListings();

    // Cleanup function: abort any pending request if the component unmounts or
    // if the effect dependencies change (triggering a new fetch).
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedSearchQuery, filters, sortOptions, currentPage, itemsPerPage]);

  /**
   * Effect hook to reset the current page to 1 whenever the search query,
   * filters, or sort options change. This ensures that new search/filter
   * criteria always start from the first page of results.
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filters, sortOptions]);


  // Memoize setter functions to prevent unnecessary re-renders in consuming components
  const memoizedSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const memoizedSetFilters = useCallback((newFilters: FilterOptions | ((prevFilters: FilterOptions) => FilterOptions)) => {
    setFilters(newFilters);
  }, []);

  const memoizedSetSortOptions = useCallback((newOptions: SortOptions | ((prevOptions: SortOptions) => SortOptions)) => {
    setSortOptions(newOptions);
  }, []);

  const memoizedSetCurrentPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const memoizedSetItemsPerPage = useCallback((count: number) => {
    setItemsPerPage(count);
    setCurrentPage(1); // Reset to the first page when items per page changes
  }, []);

  return {
    listings,
    totalListings,
    currentPage,
    totalPages,
    loading,
    error,
    searchQuery,
    setSearchQuery: memoizedSetSearchQuery,
    filters,
    setFilters: memoizedSetFilters,
    sortOptions,
    setSortOptions: memoizedSetSortOptions,
    setCurrentPage: memoizedSetCurrentPage,
    itemsPerPage,
    setItemsPerPage: memoizedSetItemsPerPage,
  };
};