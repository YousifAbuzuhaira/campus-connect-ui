import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Navbar } from "@/components/layout/Navbar";
import { Filter, Star, MapPin, Loader2, Search, X } from "lucide-react";
import { useListings } from "@/hooks/useApi";
import { LISTING_CATEGORIES, TIME_FILTERS } from "@/lib/constants";
import { StarRating } from "@/components/ui/star-rating";

// Local constants for filters and sorting options
const CATEGORIES = LISTING_CATEGORIES; // Renamed for local use, still imported
const POSTED_TIME_FILTERS = TIME_FILTERS;

const CONDITION_FILTERS = [
  { label: "New", value: "new" },
  { label: "Used - Like New", value: "used_like_new" },
  { label: "Used - Good", value: "used_good" },
  { label: "Used - Fair", value: "used_fair" },
];

const SORT_OPTIONS = [
  { label: "Relevance", value: "relevance", sortBy: "relevance", sortOrder: "desc" },
  { label: "Newest First", value: "newest", sortBy: "created_at", sortOrder: "desc" },
  { label: "Price: Low to High", value: "price-low", sortBy: "price", sortOrder: "asc" },
  { label: "Price: High to Low", value: "price-high", sortBy: "price", sortOrder: "desc" },
];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // Changed to array for multi-select
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[1].value); // Default to "Newest First"
  const [postedFilter, setPostedFilter] = useState("All Time"); // Now passed to backend
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]); // New state for conditions
  const [selectedLocation, setSelectedLocation] = useState(""); // New state for location
  const [currentPage, setCurrentPage] = useState(1);

  // Debounced search to avoid too many API calls
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initialize state from URL parameters on mount
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");
    const sortParam = searchParams.get("sort");
    const pageParam = searchParams.get("page");
    const minPriceParam = searchParams.get("min_price");
    const maxPriceParam = searchParams.get("max_price");
    const conditionParam = searchParams.get("condition");
    const locationParam = searchParams.get("location");
    const postedWithinParam = searchParams.get("posted_within");

    if (categoryParam) {
      const labels = categoryParam
        .split(",")
        .map((val) => CATEGORIES.find((cat) => cat.value === val)?.label)
        .filter(Boolean) as string[];
      setSelectedCategories(labels);
    }

    if (searchParam) {
      setSearchQuery(searchParam);
    }

    if (sortParam) {
      const validSort = SORT_OPTIONS.find(opt => opt.value === sortParam);
      if (validSort) {
        setSortBy(validSort.value);
      }
    }

    if (pageParam) {
      setCurrentPage(parseInt(pageParam) || 1);
    }

    if (minPriceParam || maxPriceParam) {
      const min = parseInt(minPriceParam || "0");
      const max = parseInt(maxPriceParam || "1000");
      setPriceRange([min, max]);
    }

    if (conditionParam) {
      const labels = conditionParam
        .split(",")
        .map((val) => CONDITION_FILTERS.find((cond) => cond.value === val)?.label)
        .filter(Boolean) as string[];
      setSelectedConditions(labels);
    }

    if (locationParam) {
      setSelectedLocation(locationParam);
    }

    if (postedWithinParam) {
      switch (postedWithinParam) {
        case "day": setPostedFilter("Today"); break;
        case "week": setPostedFilter("This Week"); break;
        case "month": setPostedFilter("This Month"); break;
        default: setPostedFilter("All Time"); break;
      }
    }
  }, []); // Run only on mount

  // Update URL parameters when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();

    if (selectedCategories.length > 0) {
      const categoryValues = selectedCategories
        .map((label) => CATEGORIES.find((cat) => cat.label === label)?.value)
        .filter(Boolean);
      if (categoryValues.length > 0) {
        newParams.set("category", categoryValues.join(","));
      }
    }

    if (searchQuery.trim()) {
      newParams.set("search", searchQuery.trim());
    }

    // Only set sort param if it's not the default "newest"
    if (sortBy !== SORT_OPTIONS[1].value) {
      newParams.set("sort", sortBy);
    }

    if (currentPage > 1) {
      newParams.set("page", currentPage.toString());
    }

    if (priceRange[0] > 0) {
      newParams.set("min_price", priceRange[0].toString());
    }
    if (priceRange[1] < 1000) { // Assuming 1000 is the max value for the slider
      newParams.set("max_price", priceRange[1].toString());
    }

    if (selectedConditions.length > 0) {
      const conditionValues = selectedConditions
        .map((label) => CONDITION_FILTERS.find((cond) => cond.label === label)?.value)
        .filter(Boolean);
      if (conditionValues.length > 0) {
        newParams.set("condition", conditionValues.join(","));
      }
    }

    if (selectedLocation.trim()) {
      newParams.set("location", selectedLocation.trim());
    }

    if (postedFilter !== "All Time") {
      switch (postedFilter) {
        case "Today": newParams.set("posted_within", "day"); break;
        case "This Week": newParams.set("posted_within", "week"); break;
        case "This Month": newParams.set("posted_within", "month"); break;
      }
    }

    setSearchParams(newParams);
  }, [
    selectedCategories,
    searchQuery,
    sortBy,
    currentPage,
    priceRange,
    selectedConditions,
    selectedLocation,
    postedFilter,
    setSearchParams,
  ]);

  // Build API parameters for the useListings hook
  const apiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      per_page: 15,
    };

    if (selectedCategories.length > 0) {
      // Map selected category labels back to their backend values
      const categoryValues = selectedCategories
        .map((label) => CATEGORIES.find((cat) => cat.label === label)?.value)
        .filter(Boolean); // Remove any undefined values
      if (categoryValues.length > 0) {
        params.categories = categoryValues.join(","); // Send as comma-separated string
      }
    }

    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }

    if (priceRange[0] > 0) {
      params.min_price = priceRange[0];
    }

    if (priceRange[1] < 1000) { // Assuming 1000 is the max price
      params.max_price = priceRange[1];
    }

    if (selectedConditions.length > 0) {
      // Map selected condition labels back to their backend values
      const conditionValues = selectedConditions
        .map((label) => CONDITION_FILTERS.find((cond) => cond.label === label)?.value)
        .filter(Boolean);
      if (conditionValues.length > 0) {
        params.conditions = conditionValues.join(","); // Send as comma-separated string
      }
    }

    if (selectedLocation.trim()) {
      params.location = selectedLocation.trim();
    }

    // Map postedFilter to backend-friendly values
    if (postedFilter !== "All Time") {
      switch (postedFilter) {
        case "Today":
          params.posted_within = "day";
          break;
        case "This Week":
          params.posted_within = "week";
          break;
        case "This Month":
          params.posted_within = "month";
          break;
      }
    }

    // Map sortBy to backend sort_by and sort_order parameters
    const currentSortOption = SORT_OPTIONS.find(opt => opt.value === sortBy);
    if (currentSortOption) {
      params.sort_by = currentSortOption.sortBy;
      params.sort_order = currentSortOption.sortOrder;
    }

    return params;
  }, [
    currentPage,
    selectedCategories,
    debouncedSearch,
    priceRange,
    selectedConditions,
    selectedLocation,
    postedFilter,
    sortBy,
  ]);

  // Fetch listings with filters
  const { data: listingsData, isLoading, error } = useListings(apiParams);

  // All filtering and sorting is now handled by the backend API.
  // The filteredListings memo simply returns the data received.
  const filteredListings = useMemo(() => {
    return listingsData || [];
  }, [listingsData]);

  // Helper function to clear all filters
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 1000]);
    setSearchQuery("");
    setPostedFilter("All Time");
    setSortBy(SORT_OPTIONS[1].value); // Reset to default sort
    setSelectedConditions([]);
    setSelectedLocation("");
    setCurrentPage(1);
    setSearchParams({}); // Clear all URL parameters
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        {error && (
          <div className="mb-4 p-4 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-destructive font-medium">
              Error loading listings: {error.message}
            </p>
            {error.message.includes("422") && (
              <p className="text-sm text-destructive/80 mt-1">
                This might be due to invalid filter parameters. Try clearing all
                filters.
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
              >
                Clear Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for textbooks, electronics, furniture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedCategories.length > 0 ||
          searchQuery ||
          postedFilter !== "All Time" ||
          priceRange[0] > 0 ||
          priceRange[1] < 1000 ||
          selectedConditions.length > 0 ||
          selectedLocation) && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Active filters:</span>
            {selectedCategories.map((categoryLabel) => (
              <Badge key={categoryLabel} variant="secondary" className="flex items-center gap-1">
                {categoryLabel}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    setSelectedCategories(selectedCategories.filter((c) => c !== categoryLabel))
                  }
                />
              </Badge>
            ))}
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{searchQuery}"
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSearchQuery("")}
                />
              </Badge>
            )}
            {postedFilter !== "All Time" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Posted: {postedFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setPostedFilter("All Time")}
                />
              </Badge>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 1000) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Price: ${priceRange[0]} -{" "}
                {priceRange[1] === 1000 ? "$1000+" : `$${priceRange[1]}`}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setPriceRange([0, 1000])}
                />
              </Badge>
            )}
            {selectedConditions.map((conditionLabel) => (
              <Badge key={conditionLabel} variant="secondary" className="flex items-center gap-1">
                Condition: {conditionLabel}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    setSelectedConditions(selectedConditions.filter((c) => c !== conditionLabel))
                  }
                />
              </Badge>
            ))}
            {selectedLocation && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Location: "{selectedLocation}"
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSelectedLocation("")}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          </div>
        )}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Browse Listings
            </h1>
            <p className="text-muted-foreground">
              {isLoading
                ? "Loading..."
                : `${listingsData?.total_count || 0} items available`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Mobile Filter Toggle - Placeholder for future implementation */}
            <Button variant="outline" className="lg:hidden">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <Card className="sticky top-20 p-6">
              <div className="mb-6 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <h2 className="font-semibold">Filters</h2>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="mb-3 font-medium">Category</h3>
                  <div className="space-y-2">
                    {CATEGORIES.filter(cat => cat.value !== "all").map((category) => ( // Exclude "All" from individual checkboxes
                      <div
                        key={category.value}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          id={`category-${category.value}`}
                          checked={selectedCategories.includes(category.label)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, category.label]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== category.label));
                            }
                          }}
                        />
                        <Label htmlFor={`category-${category.value}`} className="text-sm">
                          {category.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="mb-3 font-medium">Price Range</h3>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000}
                    min={0}
                    step={5}
                    className="mb-3"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>
                      {priceRange[1] === 1000 ? "$1000+" : `$${priceRange[1]}`}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => {
                        const value = Math.max(
                          0,
                          parseInt(e.target.value) || 0
                        );
                        setPriceRange([value, priceRange[1]]);
                      }}
                      className="h-8 w-16 text-xs"
                    />
                    <span>to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1] === 1000 ? "" : priceRange[1]}
                      onChange={(e) => {
                        const value = Math.min(
                          1000,
                          parseInt(e.target.value) || 1000
                        );
                        setPriceRange([priceRange[0], value]);
                      }}
                      className="h-8 w-16 text-xs"
                    />
                  </div>
                </div>

                {/* Condition Filter */}
                <div>
                  <h3 className="mb-3 font-medium">Condition</h3>
                  <div className="space-y-2">
                    {CONDITION_FILTERS.map((condition) => (
                      <div
                        key={condition.value}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          id={`condition-${condition.value}`}
                          checked={selectedConditions.includes(condition.label)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedConditions([...selectedConditions, condition.label]);
                            } else {
                              setSelectedConditions(selectedConditions.filter(c => c !== condition.label));
                            }
                          }}
                        />
                        <Label htmlFor={`condition-${condition.value}`} className="text-sm">
                          {condition.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <h3 className="mb-3 font-medium">Location</h3>
                  <Input
                    placeholder="e.g., Campus, Dorm, Library"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Posted Date */}
                <div>
                  <h3 className="mb-3 font-medium">Posted</h3>
                  <div className="space-y-2">
                    {POSTED_TIME_FILTERS.map((time) => (
                      <div key={time} className="flex items-center gap-2">
                        <Checkbox
                          id={`posted-${time}`}
                          checked={postedFilter === time}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPostedFilter(time);
                            } else if (postedFilter === time) {
                              setPostedFilter("All Time");
                            }
                          }}
                        />
                        <Label htmlFor={`posted-${time}`} className="text-sm">
                          {time}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </Button>
              </div>
            </Card>
          </aside>

          {/* Listings Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading listings...</span>
                <p className="mt-2 text-sm text-muted-foreground">
                  Searching for the best deals...
                </p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  No listings found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms to find more
                  results.
                </p>
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredListings.map((listing) => (
                  <Link key={listing.id} to={`/listing/${listing.id}`}>
                    <Card className="group overflow-hidden transition-all hover:shadow-lg">
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img
                          src={
                            listing.images?.[0] ||
                            "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400"
                          }
                          alt={listing.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {listing.category}
                          </Badge>
                          {/* Assuming 'Verified' status is part of listing data */}
                          {listing.is_verified && (
                            <Badge
                              variant="outline"
                              className="border-success/20 bg-success/10 text-success text-xs"
                            >
                              Verified
                            </Badge>
                          )}
                        </div>
                        <h3 className="mb-2 line-clamp-2 font-semibold text-card-foreground group-hover:text-primary">
                          {listing.title}
                        </h3>
                        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{listing.pickup_location || "Campus"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">
                            ${listing.price}
                          </span>
                          <div className="flex items-center gap-1 text-sm">
                            {listing.average_rating ? (
                              <>
                                <StarRating
                                  rating={listing.average_rating}
                                  size="sm"
                                />
                                <span className="font-medium">
                                  {listing.average_rating}
                                </span>
                              </>
                            ) : (
                              <>
                                <StarRating rating={0} size="sm" />
                                <span className="font-medium text-muted-foreground">
                                  N/A
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Posted{" "}
                            {new Date(listing.created_at).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {listing.stock} available
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {listingsData && listingsData.total_pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                {/* Dynamically render page numbers around current page */}
                {Array.from({ length: listingsData.total_pages }, (_, i) => i + 1)
                  .filter(page =>
                    page === 1 ||
                    page === listingsData.total_pages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, index, arr) => (
                    <span key={page}>
                      {index > 0 && arr[index - 1] + 1 < page && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    </span>
                  ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage === listingsData.total_pages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}