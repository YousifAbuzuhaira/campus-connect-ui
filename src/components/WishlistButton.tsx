import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCheckWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/AuthContext";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  listingId: string;
  size?: "sm" | "md";
}

export function WishlistButton({ listingId, size = "md" }: WishlistButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: isSaved, isLoading } = useCheckWishlist(listingId);
  const toggleMutation = useToggleWishlist();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please log in to save listings");
      navigate("/auth");
      return;
    }

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    try {
      await toggleMutation.mutateAsync(listingId);
      toast.success(isSaved ? "Removed from saved listings" : "Added to saved listings");
    } catch (error: unknown) {
      toast.error(
        (error as any)?.response?.data?.detail || "Failed to update wishlist"
      );
    }
  };

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const buttonSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        buttonSize,
        "rounded-full transition-all",
        isSaved
          ? "text-red-500 hover:text-red-600 hover:bg-red-50"
          : "text-muted-foreground hover:text-red-500 hover:bg-red-50",
        isAnimating && "scale-125"
      )}
      onClick={handleToggle}
      disabled={isLoading || toggleMutation.isPending}
      aria-label={isSaved ? "Remove from saved listings" : "Save listing"}
    >
      <Heart
        className={cn(
          iconSize,
          "transition-all",
          isSaved && "fill-current"
        )}
      />
    </Button>
  );
}