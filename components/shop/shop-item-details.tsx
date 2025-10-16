import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Coins } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { ShopItem } from "@/types/shop";
import { useShopStore } from "@/store/shop-store";

interface ShopItemDetailsProps {
  item: ShopItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: ShopItem) => void;
  isPurchased: boolean;
  userPoints: number;
}

export function ShopItemDetails({
  item,
  isOpen,
  onClose,
  onAddToCart,
  isPurchased,
  userPoints,
}: ShopItemDetailsProps) {
  const { getRarityColor, getCategoryIcon } = useShopStore();

  if (!item) return null;

  const canAfford = userPoints >= item.price_points;
  const timeAgo = formatDistanceToNow(new Date(item.created_at), {
    addSuffix: true,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>Added to shop {timeAgo}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {item.image_url && (
            <div className="aspect-square w-full relative rounded-lg overflow-hidden">
              <img
                src={item.image_url}
                alt={item.name}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-500">{item.description}</p>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <span className="mr-1">{getCategoryIcon(item.category)}</span>
                {item.category}
              </Badge>
              <Badge
                variant="outline"
                className={`capitalize ${getRarityColor(item.rarity)}`}
              >
                {item.rarity}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-lg font-semibold">
              <Coins className="w-5 h-5" />
              <span>{item.price_points}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          {isPurchased ? (
            <Button disabled>Already Owned</Button>
          ) : (
            <Button
              onClick={() => onAddToCart(item)}
              disabled={!canAfford}
              className="w-full"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {canAfford ? "Add to Cart" : "Not Enough Points"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
