import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/star-rating";
import { useCreateRating } from "@/hooks/useApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RatingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
}

export function RatingDialog({
  isOpen,
  onOpenChange,
  listingId,
  listingTitle,
}: RatingDialogProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const createRatingMutation = useCreateRating();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please provide a comment");
      return;
    }

    try {
      await createRatingMutation.mutateAsync({
        listingId,
        rating,
        comment: comment.trim(),
      });

      toast.success("Rating submitted successfully!");
      onOpenChange(false);
      setRating(0);
      setComment("");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit rating";
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setRating(0);
    setComment("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rate this item</DialogTitle>
          <DialogDescription>
            Share your experience with "{listingTitle}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating *</label>
            <div className="flex items-center gap-2">
              <StarRating
                rating={rating}
                interactive
                onRatingChange={setRating}
                size="lg"
              />
              <span className="text-sm text-muted-foreground">
                ({rating}/5)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Comment *
            </label>
            <Textarea
              id="comment"
              placeholder="Share your thoughts about this item..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Required</span>
              <span>{comment.length}/1000</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createRatingMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createRatingMutation.isPending ||
                rating === 0 ||
                !comment.trim()
              }
            >
              {createRatingMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit Rating
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
