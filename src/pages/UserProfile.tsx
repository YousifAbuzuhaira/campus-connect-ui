import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/layout/Navbar";
import { StarRating } from "@/components/ui/star-rating";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, Listing } from "@/hooks/useApi";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  ShieldCheck,
  Star,
  Package,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Eye,
  Tag,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface UserProfileData {
  user: {
    id: string;
    username: string;
    full_name: string;
    university: string;
    bio: string;
    created_at: string;
  };
  statistics: {
    total_listings: number;
    active_listings: number;
    sold_listings: number;
    average_rating: number | null;
    total_ratings: number;
  };
  listings: Listing[];
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [showAllListings, setShowAllListings] = useState(false);

  // Fetch user profile data
  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery<UserProfileData>({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      const response = await apiRequest(`/api/users/${userId}/profile`, {
        method: "GET",
      });
      return response;
    },
    enabled: !!userId,
  });

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  if (!userId) {
    navigate("/browse", { replace: true });
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex items-center justify-center py-20">
          <div className="flex items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-lg">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20">
          <Card className="mx-auto max-w-md p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold">Profile Not Found</h2>
            <p className="mb-6 text-muted-foreground">
              This user doesn't exist or their profile is not available.
            </p>
            <Link to="/browse">
              <Button>Back to Browse</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const { user, statistics, listings } = profileData;
  const displayedListings = showAllListings ? listings : listings.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <Link to="/browse">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center">
                <Avatar className="mx-auto h-20 w-20 mb-4">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {user.full_name?.charAt(0).toUpperCase() ||
                      user.username?.charAt(0).toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex items-center justify-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">
                    {user.full_name || user.username || "Anonymous User"}
                  </h1>
                  <ShieldCheck className="h-5 w-5 text-success" />
                </div>

                {user.username && user.full_name && (
                  <p className="text-muted-foreground mb-2">@{user.username}</p>
                )}

                {user.university && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{user.university}</span>
                  </div>
                )}

                {user.bio && (
                  <p className="text-sm text-muted-foreground mb-4 text-left">
                    {user.bio}
                  </p>
                )}

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {formatDate(user.created_at)}</span>
                </div>
              </div>
            </Card>

            {/* Statistics */}
            <Card className="mt-6 p-6">
              <h2 className="text-xl font-semibold mb-4">Seller Statistics</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Listings</span>
                  <Badge variant="outline">{statistics.total_listings}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Active Listings</span>
                  <Badge
                    variant="outline"
                    className="border-green-500/20 bg-green-500/10 text-green-600"
                  >
                    {statistics.active_listings}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Items Sold</span>
                  <Badge
                    variant="outline"
                    className="border-blue-500/20 bg-blue-500/10 text-blue-600"
                  >
                    {statistics.sold_listings}
                  </Badge>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Seller Rating</span>
                  <div className="flex items-center gap-2">
                    {statistics.average_rating ? (
                      <>
                        <StarRating
                          rating={statistics.average_rating}
                          size="sm"
                        />
                        <span className="text-sm font-medium">
                          {statistics.average_rating}/5
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({statistics.total_ratings})
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No ratings yet
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Listings */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {user.full_name || user.username}'s Listings
              </h2>
              {listings.length > 6 && (
                <Button
                  variant="outline"
                  onClick={() => setShowAllListings(!showAllListings)}
                >
                  {showAllListings
                    ? "Show Less"
                    : `View All ${listings.length}`}
                </Button>
              )}
            </div>

            {listings.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                <p className="text-muted-foreground">
                  This user hasn't posted any items for sale.
                </p>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {displayedListings.map((listing) => (
                  <Link key={listing.id} to={`/listing/${listing.id}`}>
                    <Card className="group overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img
                          src={
                            listing.images?.[0] ||
                            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400"
                          }
                          alt={listing.title}
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>

                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex gap-2">
                            <Badge variant="secondary">
                              {listing.category}
                            </Badge>
                            {listing.is_sold ? (
                              <Badge
                                variant="outline"
                                className="border-red-500/20 bg-red-500/10 text-red-600"
                              >
                                Sold
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-green-500/20 bg-green-500/10 text-green-600"
                              >
                                Available
                              </Badge>
                            )}
                          </div>
                        </div>

                        <h3 className="mb-2 line-clamp-2 font-semibold text-card-foreground group-hover:text-primary">
                          {listing.title}
                        </h3>

                        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{listing.pickup_location || "Campus"}</span>
                          <Eye className="h-3 w-3 ml-2" />
                          <span>{listing.views} views</span>
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

                        <div className="mt-3 text-xs text-muted-foreground">
                          Listed {formatDate(listing.created_at)}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
