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

  const { userLevel } = useRatingsStore();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [userPoints, setUserPoints] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchShopItems();
      fetchUserPurchases();
      loadUserPoints();
    }
  }, [isLoaded, isSignedIn, fetchShopItems, fetchUserPurchases]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const loadUserPoints = async () => {
    const points = await getUserPoints();
    setUserPoints(points);
  };

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
    setIsPurchasing(true);
    const success = await purchaseItem(itemId);
    if (success) {
      await loadUserPoints(); // Refresh points
    }
    setIsPurchasing(false);
  };

  const handleCartPurchase = async () => {
    setIsPurchasing(true);
    for (const cartItem of cart) {
      for (let i = 0; i < cartItem.quantity; i++) {
        await purchaseItem(cartItem.shop_item.id);
      }
    }
    clearCart();
    await loadUserPoints();
    setIsPurchasing(false);
  };

  const getCategoryCount = (category: string) => {
    return shopItems.filter(
      (item) => category === "all" || item.category === category
    ).length;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) return null;

  return (
    <div className="container mx-auto px-4 py-6">
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
                    className={`relative overflow-hidden ${getRarityColor(
                      item.rarity
                    )}`}
                  >
                    {/* Rarity Border */}
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
                          <span className="text-3xl">{item.icon}</span>
                          <div>
                            <CardTitle className="text-lg">
                              {item.name}
                            </CardTitle>
                            <Badge variant="secondary" className="mt-1">
                              {getCategoryIcon(item.category)} {item.category}
                            </Badge>
                          </div>
                        </div>
                        <Badge
                          className={
                            item.rarity === "common"
                              ? "bg-gray-500"
                              : item.rarity === "rare"
                              ? "bg-blue-500"
                              : item.rarity === "epic"
                              ? "bg-purple-500"
                              : "bg-yellow-500"
                          }
                        >
                          {item.rarity}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-gray-600 text-sm">
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
                        <div className="font-bold text-lg text-yellow-600">
                          {item.price_points} points
                        </div>
                        {isPurchased ? (
                          <Badge variant="default" className="bg-green-500">
                            <Check className="w-3 h-3 mr-1" />
                            Purchased
                          </Badge>
                        ) : (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addToCart(item)}
                              disabled={!canAfford}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handlePurchase(item.id)}
                              disabled={!canAfford || isPurchasing}
                              size="sm"
                            >
                              Buy Now
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
