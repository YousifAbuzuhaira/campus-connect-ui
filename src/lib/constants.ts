// Shared constants for the Campus Connect application
// This ensures consistency between different components and pages

export const LISTING_CATEGORIES = [
  { label: "All", value: "All" },
  { label: "Books", value: "Books" },
  { label: "Electronics", value: "Electronics" },
  { label: "Furniture", value: "Furniture" },
  { label: "Clothing", value: "Clothing" },
  { label: "Sports", value: "Sports" },
  { label: "Transportation", value: "Transportation" },
  { label: "Other", value: "Other" },
] as const;

// Extract just the category values for forms (excluding "All")
export const CATEGORY_VALUES = LISTING_CATEGORIES
  .filter(cat => cat.value !== "All")
  .map(cat => cat.value);

// Extract just the labels for display
export const CATEGORY_LABELS = LISTING_CATEGORIES.map(cat => cat.label);

export const LISTING_CONDITIONS = [
  "New", 
  "Like New", 
  "Good", 
  "Fair"
] as const;

export const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
] as const;

export const TIME_FILTERS = [
  "Today",
  "This Week", 
  "This Month",
  "All Time"
] as const;