"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useShopStore } from "@/store/shop-store";
import { useRatingsStore } from "@/store/ratings-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShoppingCart, Coins, Check, Clock, Plus, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ShopItemDetails } from "@/components/shop/shop-item-details";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useToast } from "@/hooks/useToast";
import { ShopItem } from "@/types/shop";
import { cn } from "@/lib/utils";

export default function ShopPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const {
    shopItems,
    cart,
    isLoading,
    error,
    fetchShopItems,
    fetchUserPurchases,
    purchaseItem,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    getUserPoints,
    getRarityColor,
    getCategoryIcon,
    isItemPurchased,
  } = useShopStore();

  // New state for enhanced features
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 12;

  const { userLevel } = useRatingsStore();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [userPoints, setUserPoints] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const loadUserPoints = async () => {
    try {
      const points = await getUserPoints();
      setUserPoints(points);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to load points",
        "error"
      );
      setUserPoints(0);
    }
  };

  // Infinite scroll setup
  const loadMoreItems = async () => {
    const nextPage = page + 1;
    const start = (nextPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    if (end >= filteredItems.length) {
      setHasMore(false);
    } else {
      setPage(nextPage);
    }
  };

  const { ref: infiniteScrollRef, isLoading: isLoadingMore } =
    useInfiniteScroll(loadMoreItems, hasMore);

  useEffect(() => {
    const initializeShop = async () => {
      try {
        if (!isLoaded) return;

        if (!isSignedIn) {
          router.push("/sign-in");
          return;
        }

        // Initialize shop data only if user is authenticated
        await Promise.all([
          fetchShopItems(),
          fetchUserPurchases(),
          loadUserPoints(),
        ]);
      } catch (error) {
        showToast(
          error instanceof Error ? error.message : "Failed to load shop data",
          "error"
        );
      }
    };

    initializeShop();
  }, [
    isLoaded,
    isSignedIn,
    router,
    fetchShopItems,
    fetchUserPurchases,
    showToast,
  ]);

  const filteredItems = shopItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === "all" ? true : item.category === activeTab;

    return matchesSearch && matchesTab;
  });

  const categories = [
    { id: "all", name: "All Items", icon: "📦" },
    { id: "feature", name: "Features", icon: "🚀" },
    { id: "boost", name: "Boosts", icon: "⚡" },
    { id: "customization", name: "Customizations", icon: "🎨" },
    { id: "reward", name: "Rewards", icon: "🎁" },
  ];

  const handlePurchase = async (itemId: string) => {
    try {
      setIsPurchasing(true);
      await purchaseItem(itemId);
      await loadUserPoints(); // Refresh points
      showToast("Item purchased successfully!", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to purchase item",
        "error"
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCartPurchase = async () => {
    try {
      setIsPurchasing(true);
      for (const cartItem of cart) {
        for (let i = 0; i < cartItem.quantity; i++) {
          await purchaseItem(cartItem.shop_item.id);
        }
      }
      await loadUserPoints();
      clearCart();
      showToast("All items purchased successfully!", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to purchase items",
        "error"
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const getCategoryCount = (category: string) => {
    return shopItems.filter(
      (item) => category === "all" || item.category === category
    ).length;
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <ShopItemDetails
        item={selectedItem}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onAddToCart={(item) => {
          addToCart(item);
          showToast("Added to cart!", "success");
          setIsDetailsOpen(false);
        }}
        isPurchased={selectedItem ? isItemPurchased(selectedItem.id) : false}
        userPoints={userPoints}
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

      {/* Points Display */}
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
              Level {userLevel?.level || 1}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Categories and Cart */}
        <div className="lg:col-span-1 space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                    activeTab === category.id
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

          {/* Shopping Cart */}
          {cart.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Cart ({cart.reduce((total, item) => total + item.quantity, 0)}
                  )
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.shop_item.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{item.shop_item.icon}</span>
                      <div>
                        <div className="font-medium text-sm">
                          {item.shop_item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.shop_item.price_points} pts × {item.quantity}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.shop_item.id)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
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

        {/* Main Content - Shop Items */}
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

          {/* Shop Items Grid */}
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
                    onClick={() => {
                      setSelectedItem(item);
                      setIsDetailsOpen(true);
                    }}
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
                    ></div>

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl transform transition-transform group-hover:scale-110">
                            {item.icon}
                          </span>
                          <div>
                            <CardTitle className="text-lg">
                              {item.name}
                            </CardTitle>
                            <Badge
                              variant="secondary"
                              className="mt-1 transition-colors hover:bg-primary/20"
                            >
                              {getCategoryIcon(item.category)} {item.category}
                            </Badge>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize transition-colors",
                            item.rarity === "common"
                              ? "hover:bg-gray-500"
                              : item.rarity === "rare"
                              ? "hover:bg-blue-500"
                              : item.rarity === "epic"
                              ? "hover:bg-purple-500"
                              : "hover:bg-yellow-500"
                          )}
                        >
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
                          <Badge
                            variant="default"
                            className="bg-green-500 animate-in fade-in duration-300"
                          >
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
                                showToast("Added to cart!", "success");
                              }}
                              disabled={!canAfford}
                              className="hover:scale-105 transition-transform"
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
                              className="hover:scale-105 transition-transform"
                            >
                              {isPurchasing ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                  Buying...
                                </div>
                              ) : (
                                "Buy Now"
                              )}
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
