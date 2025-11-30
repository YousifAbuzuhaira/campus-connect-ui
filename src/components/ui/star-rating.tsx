import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  className,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starIndex = index + 1;
        const isFilled = starIndex <= rating;
        const isHalfFilled = starIndex - 0.5 <= rating && starIndex > rating;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(starIndex)}
            className={cn(
              "relative",
              interactive &&
                "cursor-pointer hover:scale-110 transition-transform",
              !interactive && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled || isHalfFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300",
                interactive && "hover:text-yellow-400"
              )}
            />
            {isHalfFilled && (
              <Star
                className={cn(
                  sizeClasses[size],
                  "absolute inset-0 fill-yellow-400 text-yellow-400"
                )}
                style={{
                  clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
