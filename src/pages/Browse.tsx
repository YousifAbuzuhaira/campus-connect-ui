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

const CATEGORIES = LISTING_CATEGORIES;

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [sortBy, setSortBy] = useState("newest");
  const [postedFilter, setPostedFilter] = useState("All Time");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounced search to avoid too many API calls
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL parameters when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();

    if (selectedCategory !== "All") {
      // Find the backend value for the selected category to store in URL
      const categoryObj = CATEGORIES.find(
        (cat) => cat.label === selectedCategory
      );
      if (categoryObj && categoryObj.value !== "All") {
        newParams.set("category", categoryObj.value);
      }
    }

    if (searchQuery.trim()) {
      newParams.set("search", searchQuery.trim());
    }

    if (sortBy !== "newest") {
      newParams.set("sort", sortBy);
    }

    if (currentPage > 1) {
      newParams.set("page", currentPage.toString());
    }

    setSearchParams(newParams);
  }, [selectedCategory, searchQuery, sortBy, currentPage, setSearchParams]);

  // Initialize state from URL parameters on mount
  useEffect(() => {
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const page = searchParams.get("page");

    if (category && category !== selectedCategory) {
      // Find the label for the backend category value
      const categoryObj = CATEGORIES.find((cat) => cat.value === category);
      if (categoryObj) {
        setSelectedCategory(categoryObj.label);
      }
    }
    if (search && search !== searchQuery) {
      setSearchQuery(search);
    }
    if (sort && sort !== sortBy) {
      setSortBy(sort);
    }
    if (page && parseInt(page) !== currentPage) {
      setCurrentPage(parseInt(page));
    }
  }, []); // Only run on mount  // Build API parameters
  const apiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      per_page: 15,
    };

    if (selectedCategory !== "All") {
      const categoryObj = CATEGORIES.find(
        (cat) => cat.label === selectedCategory
      );
      if (categoryObj && categoryObj.value !== "All") {
        params.category = categoryObj.value;
      }
    }

    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }

    if (priceRange[0] > 0) {
      params.min_price = priceRange[0];
    }

    if (priceRange[1] < 1000) {
      params.max_price = priceRange[1];
    }

    return params;
  }, [selectedCategory, debouncedSearch, priceRange, currentPage]);

  // Fetch listings with filters
  const { data: listingsData, isLoading, error } = useListings(apiParams);

  // Sort and filter listings based on client-side filters (for things not handled by backend)
  const filteredListings = useMemo(() => {
    if (!listingsData) return [];

    let filtered = [...listingsData];

    // Apply posted date filter (not handled by backend)
    if (postedFilter !== "All Time") {
      const now = new Date();
      const cutoffDate = new Date();

      switch (postedFilter) {
        case "Today":
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case "This Week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "This Month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(
        (listing) => new Date(listing.created_at) >= cutoffDate
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    return filtered;
  }, [listingsData, postedFilter, sortBy]);

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
                onClick={() => {
                  setSelectedCategory("All");
                  setPriceRange([0, 1000]);
                  setSearchQuery("");
                  setPostedFilter("All Time");
                  setSortBy("newest");
                  setCurrentPage(1);
                  setSearchParams({});
                }}
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
        {(selectedCategory !== "All" ||
          searchQuery ||
          postedFilter !== "All Time" ||
          priceRange[0] > 0 ||
          priceRange[1] < 1000) && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Active filters:</span>
            {selectedCategory !== "All" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedCategory}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSelectedCategory("All")}
                />
              </Badge>
            )}
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
                {postedFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setPostedFilter("All Time")}
                />
              </Badge>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 1000) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                ${priceRange[0]} -{" "}
                {priceRange[1] === 1000 ? "$1000+" : `$${priceRange[1]}`}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setPriceRange([0, 1000])}
                />
              </Badge>
            )}
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
                : `${filteredListings.length} items available`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Mobile Filter Toggle */}
            <Button variant="outline" className="lg:hidden">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
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
                    {CATEGORIES.map((category) => (
                      <div
                        key={category.value}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          id={category.value}
                          checked={selectedCategory === category.label}
                          onCheckedChange={() =>
                            setSelectedCategory(category.label)
                          }
                        />
                        <Label htmlFor={category.value} className="text-sm">
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

                {/* Posted Date */}
                <div>
                  <h3 className="mb-3 font-medium">Posted</h3>
                  <div className="space-y-2">
                    {TIME_FILTERS.map((time) => (
                      <div key={time} className="flex items-center gap-2">
                        <Checkbox
                          id={time}
                          checked={postedFilter === time}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPostedFilter(time);
                            } else if (postedFilter === time) {
                              setPostedFilter("All Time");
                            }
                          }}
                        />
                        <Label htmlFor={time} className="text-sm">
                          {time}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedCategory("All");
                    setPriceRange([0, 1000]);
                    setSearchQuery("");
                    setPostedFilter("All Time");
                    setSortBy("newest");
                    setCurrentPage(1);
                    setSearchParams({});
                  }}
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
                  onClick={() => {
                    setSelectedCategory("All");
                    setPriceRange([0, 1000]);
                    setSearchQuery("");
                    setPostedFilter("All Time");
                  }}
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
                          <Badge
                            variant="outline"
                            className="border-success/20 bg-success/10 text-success text-xs"
                          >
                            Verified
                          </Badge>
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
            {filteredListings.length >= 15 && (
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

                {/* Page numbers - simplified for now */}
                {[1, 2, 3].map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={filteredListings.length < 15}
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
