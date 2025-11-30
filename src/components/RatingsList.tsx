import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { useRatings } from "@/hooks/useApi";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RatingsListProps {
  listingId: string;
}

export function RatingsList({ listingId }: RatingsListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [page, setPage] = useState(1);

  const {
    data: ratingsData,
    isLoading,
    error,
  } = useRatings(listingId, { page, per_page: isExpanded ? 10 : 3 });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading ratings...</span>
        </div>
      </Card>
    );
  }

  if (error || !ratingsData) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Failed to load ratings
        </p>
      </Card>
    );
  }

  if (ratingsData.ratings.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Customer Reviews</h3>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-2">No reviews yet</p>
          <p className="text-sm text-muted-foreground">
            Be the first to share your experience with this item
          </p>
        </div>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          {ratingsData.average_rating && (
            <div className="flex items-center gap-2">
              <StarRating rating={ratingsData.average_rating} size="sm" />
              <span className="text-sm font-medium">
                {ratingsData.average_rating}/5
              </span>
              <span className="text-sm text-muted-foreground">
                ({ratingsData.total_ratings}{" "}
                {ratingsData.total_ratings === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {ratingsData.ratings.map((rating) => (
          <div
            key={rating.id}
            className="border-b border-border/50 last:border-b-0 pb-4 last:pb-0"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {rating.user_name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {rating.user_name || "Anonymous"}
                  </span>
                  <StarRating rating={rating.rating} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(rating.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {rating.comment}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ratingsData.total > 3 && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Show All {ratingsData.total} Reviews
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}
