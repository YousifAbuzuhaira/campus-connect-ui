import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { WishlistButton } from "@/components/WishlistButton";
import { useWishlistItems, usePriceDrops, useToggleWishlist, WishlistItem } from "@/hooks/useWishlist";
import { toast } from "sonner";
import {
  Heart,
  Loader2,
  ShoppingBag,
  TrendingDown,
  MapPin,
  Tag,
  Trash2,
  ArrowRight,
} from "lucide-react";

export function SavedListings() {
  return <SavedListingsPage />;
}

function SavedListingsPage() {
  const { data: wishlistItems, isLoading, error } = useWishlistItems();
  const { data: priceDropItems } = usePriceDrops();
  const toggleMutation = useToggleWishlist();

  const handleRemoveFromWishlist = async (listingId: string) => {
    try {
      await toggleMutation.mutateAsync(listingId);
      toast.success("Removed from saved listings");
    } catch (err: unknown) {
      toast.error(
        (err as any)?.response?.data?.detail || "Failed to remove from wishlist"
      );
    }
  };

  const priceDropListingIds = new Set(
    priceDropItems?.map((item) => item.listing_id) || []
  );

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex items-center justify-center py-20">
          <div className="flex items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-lg">Loading saved listings...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20">
          <Card className="mx-auto max-w-md p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold">Something went wrong</h2>
            <p className="mb-6 text-muted-foreground">
              Failed to load your saved listings. Please try again later.
            </p>
            <Link to="/browse">
              <Button>Browse Listings</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  // Empty state
  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20">
          <Card className="mx-auto max-w-lg p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-muted p-6">
                <Heart className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <h2 className="mb-3 text-2xl font-bold">No saved listings yet</h2>
            <p className="mb-8 text-muted-foreground">
              Browse the marketplace and click the heart icon on listings you
              love to save them here. You'll also get notified when prices drop!
            </p>
            <Link to="/browse">
              <Button size="lg">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Browse Marketplace
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Saved Listings</h1>
          <p className="mt-2 text-muted-foreground">
            {wishlistItems.length}{" "}
            {wishlistItems.length === 1 ? "item" : "items"} saved
            {priceDropItems && priceDropItems.length > 0 && (
              <span className="ml-2 text-green-600 font-medium">
                • {priceDropItems.length} price{" "}
                {priceDropItems.length === 1 ? "drop" : "drops"}!
              </span>
            )}
          </p>
        </div>

        {/* Price Drops Banner */}
        {priceDropItems && priceDropItems.length > 0 && (
          <Card className="mb-8 border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <TrendingDown className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-800">
                  Price Drops Detected!
                </h3>
                <p className="text-sm text-green-700">
                  {priceDropItems.length} of your saved{" "}
                  {priceDropItems.length === 1 ? "item has" : "items have"}{" "}
                  dropped in price since you saved{" "}
                  {priceDropItems.length === 1 ? "it" : "them"}.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Listings Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((item: WishlistItem) => {
            const listing = item.listing;
            if (!listing) return null;

            const hasPriceDrop = priceDropListingIds.has(item.listing_id);
            const images =
              listing.images && listing.images.length > 0
                ? listing.images
                : [
                    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
                  ];

            return (
              <Card
                key={item.id}
                className="group overflow-hidden transition-all hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <Link to={`/listing/${item.listing_id}`}>
                    <img
                      src={images[0]}
                      alt={listing.title || "Listing"}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </Link>

                  {/* Wishlist Button Overlay */}
                  <div className="absolute right-2 top-2">
                    <WishlistButton listingId={item.listing_id} size="sm" />
                  </div>

                  {/* Price Drop Badge */}
                  {hasPriceDrop && (
                    <div className="absolute left-2 top-2">
                      <Badge className="bg-green-600 text-white hover:bg-green-700">
                        <TrendingDown className="mr-1 h-3 w-3" />
                        Price Drop
                      </Badge>
                    </div>
                  )}

                  {/* Sold Badge */}
                  {listing.is_sold && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Badge
                        variant="destructive"
                        className="text-lg px-4 py-2"
                      >
                        Sold
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <Link to={`/listing/${item.listing_id}`}>
                    <h3 className="mb-1 font-semibold line-clamp-1 hover:text-primary transition-colors">
                      {listing.title || "Untitled Listing"}
                    </h3>
                  </Link>

                  {/* Price Info */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      ${item.current_price ?? listing.price}
                    </span>
                    {hasPriceDrop && item.saved_price > (item.current_price ?? listing.price) && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${item.saved_price}
                      </span>
                    )}
                  </div>

                  {/* Category & Condition */}
                  <div className="mb-2 flex flex-wrap gap-1">
                    {listing.category && (
                      <Badge variant="secondary" className="text-xs">
                        {listing.category}
                      </Badge>
                    )}
                    {listing.condition && (
                      <Badge variant="outline" className="text-xs">
                        <Tag className="mr-1 h-3 w-3" />
                        {listing.condition}
                      </Badge>
                    )}
                  </div>

                  {/* Location */}
                  {listing.pickup_location && (
                    <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">
                        {listing.pickup_location}
                      </span>
                    </div>
                  )}

                  {/* Saved date */}
                  <p className="mb-3 text-xs text-muted-foreground">
                    Saved {formatDate(item.saved_at)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/listing/${item.listing_id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveFromWishlist(item.listing_id)}
                      disabled={toggleMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Browse More CTA */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-muted-foreground">
            Looking for more items?
          </p>
          <Link to="/browse">
            <Button variant="outline" size="lg">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Browse Marketplace
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SavedListingsPage;