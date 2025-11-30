import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
  showValue = false,
  className,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const starSize = sizeClasses[size];

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={cn(
              "transition-colors",
              !readonly && "hover:scale-110",
              readonly && "cursor-default"
            )}
            onClick={() => handleStarClick(star)}
            disabled={readonly}
          >
            <Star
              className={cn(
                starSize,
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-400"
              )}
            />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="ml-1 text-sm text-muted-foreground">
          {rating > 0 ? rating.toFixed(1) : "N/A"}
        </span>
      )}
    </div>
  );
}
