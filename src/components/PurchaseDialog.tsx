import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Loader2 } from "lucide-react";

interface PurchaseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  listing: {
    id: string;
    title: string;
    price: number;
    stock: number;
    seller_name?: string;
  };
  userBalance: number;
  onConfirmPurchase: (quantity: number) => void;
  isLoading?: boolean;
}

export function PurchaseDialog({
  isOpen,
  onOpenChange,
  listing,
  userBalance,
  onConfirmPurchase,
  isLoading = false,
}: PurchaseDialogProps) {
  const [quantity, setQuantity] = useState(1);

  const totalCost = listing.price * quantity;
  const canAfford = userBalance >= totalCost;
  const maxQuantity = Math.min(
    listing.stock,
    Math.floor(userBalance / listing.price)
  );

  const handlePurchase = () => {
    if (quantity > 0 && quantity <= listing.stock && canAfford) {
      onConfirmPurchase(quantity);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Confirm Purchase
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                You're about to purchase <strong>{listing.title}</strong>
                {listing.seller_name && (
                  <span>
                    {" "}
                    from <strong>{listing.seller_name}</strong>
                  </span>
                )}
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Price per item:</span>
                  <Badge variant="outline">${listing.price}</Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={maxQuantity}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Available: {listing.stock} | You can afford: {maxQuantity}
                  </p>
                </div>

                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Your balance:</span>
                    <span
                      className={
                        userBalance >= totalCost
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      ${userBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>After purchase:</span>
                    <span
                      className={
                        userBalance >= totalCost
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      ${(userBalance - totalCost).toFixed(2)}
                    </span>
                  </div>
                </div>

                {!canAfford && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-sm text-red-600">
                      Insufficient funds. You need $
                      {(totalCost - userBalance).toFixed(2)} more.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handlePurchase}
            disabled={
              !canAfford ||
              quantity <= 0 ||
              quantity > listing.stock ||
              isLoading
            }
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Purchase $${totalCost.toFixed(2)}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
