"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShoppingCart, Coins, Check, Clock, Plus, Minus } from "lucide-react";

/**
 * Standalone ShopPage (no external stores, no Clerk).
 * - Mock data for items, cart, user points, levels
 * - Local state for categories, search, cart, purchases
 * - Inline ShopItemDetails modal
 */

/* ---------------------- Types ---------------------- */
type Rarity = "common" | "rare" | "epic" | "legendary";
type Category = "feature" | "boost" | "customization" | "reward";

type ShopItem = {
  id: string;
  name: string;
  description: string;
  category: Category;
  price_points: number;
  rarity: Rarity;
  duration_days: number | null; // null => permanent
  meeting_url?: string | null;
};

/* ---------------------- Mock Data ---------------------- */
const MOCK_USER_INITIAL_POINTS = 1250;
const MOCK_USER_LEVEL = { level: 5 };

const MOCK_CATEGORIES = [
  { id: "all", name: "All Items", icon: "📦" },
  { id: "feature", name: "Features", icon: "🚀" },
  { id: "boost", name: "Boosts", icon: "⚡" },
  { id: "customization", name: "Customizations", icon: "🎨" },
  { id: "reward", name: "Rewards", icon: "🎁" },
];

const MOCK_ITEMS: ShopItem[] = [
  {
    id: "s1",
    name: "Pro Habit Analytics",
    description: "Unlock advanced analytics to track deeper trends.",
    category: "feature",
    price_points: 700,
    rarity: "rare",
    duration_days: null,
  },
  {
    id: "s2",
    name: "2× XP Boost (7 days)",
    description: "Double points from activities for 7 days.",
    category: "boost",
    price_points: 300,
    rarity: "epic",
    duration_days: 7,
  },
  {
    id: "s3",
    name: "Custom Profile Theme",
    description: "Personalize your profile with an exclusive theme.",
    category: "customization",
    price_points: 250,
    rarity: "common",
    duration_days: null,
  },
  {
    id: "s4",
    name: "Meditation Pack (3 days)",
    description: "A curated set of guided meditations.",
    category: "reward",
    price_points: 150,
    rarity: "common",
    duration_days: 3,
  },
  {
    id: "s5",
    name: "Priority Support",
    description: "Get faster support responses for your account.",
    category: "feature",
    price_points: 900,
    rarity: "legendary",
    duration_days: null,
  },
  {
    id: "s6",
    name: "Focus Mode (30 days)",
    description: "Remove distractions inside the app for 30 days.",
    category: "boost",
    price_points: 500,
    rarity: "epic",
    duration_days: 30,
  },
];

/* ---------------------- Helpers ---------------------- */
const getRarityColor = (rarity: Rarity) => {
  switch (rarity) {
    case "common":
      return "bg-white"; // subtle
    case "rare":
      return "bg-blue-50";
    case "epic":
      return "bg-purple-50";
    case "legendary":
      return "bg-yellow-50";
    default:
      return "bg-white";
  }
};

const getCategoryIcon = (category: Category) => {
  switch (category) {
    case "feature":
      return "🚀";
    case "boost":
      return "⚡";
    case "customization":
      return "🎨";
    case "reward":
      return "🎁";
    default:
      return "📦";
  }
};

/* ---------------------- Inline Modal: ShopItemDetails ---------------------- */
function ShopItemDetails({
  item,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  userPoints,
  isOwned,
}: {
  item: ShopItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: ShopItem) => void;
  onBuyNow: (item: ShopItem) => Promise<void>;
  userPoints: number;
  isOwned: boolean;
}) {
  if (!isOpen || !item) return null;

  const canAfford = userPoints >= item.price_points;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-1">{item.name}</h3>
              <div className="text-sm text-gray-600 mb-3">
                {item.description}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="flex items-center gap-2">
                  <span className="text-lg">
                    {getCategoryIcon(item.category)}
                  </span>
                  <span className="capitalize">{item.category}</span>
                </span>
                {item.duration_days && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {item.duration_days} day
                    {item.duration_days !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-2 font-bold text-lg text-yellow-600">
                <Coins className="w-5 h-5" />
                <span>{item.price_points}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Rarity: {item.rarity}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => onAddToCart(item)}
              disabled={isOwned}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to cart
            </Button>

            <Button
              onClick={() => onBuyNow(item)}
              disabled={!canAfford || isOwned}
            >
              {isOwned ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" /> Owned
                </span>
              ) : (
                "Buy Now"
              )}
            </Button>

            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Main Component ---------------------- */
export default function ShopPage() {
  // UI state
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local "user" state (mock)
  const [userPoints, setUserPoints] = useState<number>(
    MOCK_USER_INITIAL_POINTS
  );
  const [userLevel] = useState(MOCK_USER_LEVEL);

  // Shop state
  const [items] = useState<ShopItem[]>(MOCK_ITEMS);
  const [ownedItemIds, setOwnedItemIds] = useState<string[]>([]);
  const [cart, setCart] = useState<{ shop_item: ShopItem; quantity: number }[]>(
    []
  );

  // Details modal
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Derived lists
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        activeCategory === "all" ? true : item.category === activeCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, searchTerm]);

  const getCategoryCount = (categoryId: string) =>
    items.filter((it) =>
      categoryId === "all" ? true : it.category === categoryId
    ).length;

  const getCartTotal = () =>
    cart.reduce((sum, c) => sum + c.quantity * c.shop_item.price_points, 0);

  const isItemPurchased = (id: string) => ownedItemIds.includes(id);

  /* ---------------------- Actions (local) ---------------------- */

  // Add item to cart (local)
  const addToCart = (item: ShopItem) => {
    setCart((prev) => {
      const found = prev.find((p) => p.shop_item.id === item.id);
      if (found) {
        return prev.map((p) =>
          p.shop_item.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { shop_item: item, quantity: 1 }];
    });
  };

  // Remove one qty or remove entry
  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const found = prev.find((p) => p.shop_item.id === itemId);
      if (!found) return prev;
      if (found.quantity > 1) {
        return prev.map((p) =>
          p.shop_item.id === itemId ? { ...p, quantity: p.quantity - 1 } : p
        );
      }
      return prev.filter((p) => p.shop_item.id !== itemId);
    });
  };

  const clearCart = () => setCart([]);

  // Simulated single-item purchase
  const handlePurchase = async (itemId: string) => {
    try {
      const item = items.find((i) => i.id === itemId);
      if (!item) throw new Error("Item not found");
      if (isItemPurchased(itemId)) return;
      if (userPoints < item.price_points) {
        setError("Not enough points");
        return;
      }

      setIsPurchasing(true);
      // simulating latency
      await new Promise((r) => setTimeout(r, 600));

      setUserPoints((p) => p - item.price_points);
      setOwnedItemIds((prev) => [...prev, itemId]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setIsPurchasing(false);
    }
  };

  // Purchase all items in cart (simulate)
  const handleCartPurchase = async () => {
    try {
      const total = getCartTotal();
      if (total === 0) return;
      if (userPoints < total) {
        setError("Not enough points to buy everything in cart");
        return;
      }

      setIsPurchasing(true);
      await new Promise((r) => setTimeout(r, 700));

      // Mark all cart items as owned
      const newOwned = cart.map((c) => c.shop_item.id);
      setOwnedItemIds((prev) => Array.from(new Set([...prev, ...newOwned])));

      // Deduct points
      setUserPoints((p) => p - total);

      clearCart();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cart purchase failed");
    } finally {
      setIsPurchasing(false);
    }
  };

  // Open item modal
  const openDetails = (item: ShopItem) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  useEffect(() => {
    // Clear transient error after few seconds
    if (!error) return;
    const t = setTimeout(() => setError(null), 3600);
    return () => clearTimeout(t);
  }, [error]);

  /* ---------------------- Render ---------------------- */
  return (
    <div className="container mx-auto px-4 py-6">
      <ShopItemDetails
        item={selectedItem}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedItem(null);
        }}
        onAddToCart={(item) => {
          addToCart(item);
          setIsDetailsOpen(false);
        }}
        onBuyNow={async (item) => {
          await handlePurchase(item.id);
          setIsDetailsOpen(false);
        }}
        userPoints={userPoints}
        isOwned={selectedItem ? isItemPurchased(selectedItem.id) : false}
      />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
          <ShoppingCart className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Habit Shop</h1>
        <p className="text-xl text-gray-600">
          Spend your hard-earned points on awesome rewards
        </p>
      </div>

      {/* Points */}
      <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-500 rounded-full p-3">
                <Coins className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {userPoints} Points
                </h3>
                <p className="text-gray-600">Available to spend</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Level {userLevel.level}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="mb-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {MOCK_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                    activeCategory === category.id
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <Badge variant="secondary">
                    {getCategoryCount(category.id)}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Cart (local) */}
          {cart.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Cart ({cart.reduce((t, i) => t + i.quantity, 0)})
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {cart.map((c) => (
                  <div
                    key={c.shop_item.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {getCategoryIcon(c.shop_item.category)}
                      </span>
                      <div>
                        <div className="font-medium text-sm">
                          {c.shop_item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {c.shop_item.price_points} pts × {c.quantity}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(c.shop_item.id)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold mb-3">
                    <span>Total:</span>
                    <span>{getCartTotal()} points</span>
                  </div>
                  <Button
                    onClick={handleCartPurchase}
                    disabled={getCartTotal() > userPoints || isPurchasing}
                    className="w-full"
                  >
                    {isPurchasing ? "Purchasing..." : "Purchase All"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Grid */}
        <div className="lg:col-span-3">
          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Items */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or browse different categories
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const isPurchased = isItemPurchased(item.id);
                const canAfford = userPoints >= item.price_points;
                const isTemporary = item.duration_days !== null;

                return (
                  <Card
                    key={item.id}
                    className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${getRarityColor(
                      item.rarity
                    )}`}
                    onClick={() => openDetails(item)}
                  >
                    <div
                      className={`absolute top-0 left-0 w-full h-1 ${
                        item.rarity === "common"
                          ? "bg-gray-400"
                          : item.rarity === "rare"
                          ? "bg-blue-400"
                          : item.rarity === "epic"
                          ? "bg-purple-400"
                          : "bg-yellow-400"
                      }`}
                    />

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">
                            {getCategoryIcon(item.category)}
                          </span>
                          <div>
                            <CardTitle className="text-lg">
                              {item.name}
                            </CardTitle>
                            <Badge variant="secondary" className="mt-1">
                              {item.category}
                            </Badge>
                          </div>
                        </div>

                        <Badge variant="outline" className="capitalize">
                          {item.rarity}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {item.description}
                      </p>

                      {isTemporary && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {item.duration_days} day
                          {item.duration_days !== 1 ? "s" : ""}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 font-bold text-lg text-yellow-600">
                          <Coins className="w-5 h-5" />
                          <span>{item.price_points}</span>
                        </div>

                        {isPurchased ? (
                          <Badge variant="default" className="bg-green-500">
                            <Check className="w-3 h-3 mr-1" />
                            Owned
                          </Badge>
                        ) : (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(item);
                              }}
                              disabled={!canAfford}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>

                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePurchase(item.id);
                              }}
                              disabled={!canAfford || isPurchasing}
                              size="sm"
                            >
                              {isPurchasing ? "Buying..." : "Buy Now"}
                            </Button>
                          </div>
                        )}
                      </div>

                      {!canAfford && !isPurchased && (
                        <div className="text-sm text-red-500 text-center">
                          Need {item.price_points - userPoints} more points
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
