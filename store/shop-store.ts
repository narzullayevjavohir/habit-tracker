// lib/stores/shop-store.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import { ShopItem, UserPurchase, ShoppingCartItem } from "@/types/shop";

interface ShopStore {
  // State
  shopItems: ShopItem[];
  userPurchases: UserPurchase[];
  cart: ShoppingCartItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchShopItems: () => Promise<void>;
  fetchUserPurchases: (clerkUserId: string) => Promise<void>;
  purchaseItem: (itemId: string, clerkUserId: string) => Promise<void>;
  addToCart: (item: ShopItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getUserPoints: (clerkUserId: string) => Promise<number>;

  // Utilities
  getRarityColor: (rarity: string) => string;
  getCategoryIcon: (category: string) => string;
  isItemPurchased: (itemId: string) => boolean;
  clearError: () => void;
}

export const useShopStore = create<ShopStore>((set, get) => ({
  // Initial state
  shopItems: [],
  userPurchases: [],
  cart: [],
  isLoading: false,
  error: null,

  // Fetch all shop items
  fetchShopItems: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data: shopItems, error } = await supabase
        .from("shop_items")
        .select("*")
        .order("price_points", { ascending: true });

      if (error) throw error;
      set({ shopItems: shopItems || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchUserPurchases: async (clerkUserId: string) => {
    if (!clerkUserId) {
      set({ userPurchases: [] });
      return;
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", clerkUserId)
        .single();

      if (profileError) throw profileError;

      const { data: purchases, error } = await supabase
        .from("user_purchases")
        .select(
          `
          *,
          shop_item:shop_items(*)
        `
        )
        .eq("user_id", profile.id)
        .order("purchase_date", { ascending: false });

      if (error) throw error;
      set({ userPurchases: purchases || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  purchaseItem: async (itemId: string, clerkUserId: string): Promise<void> => {
    if (!clerkUserId) throw new Error("User not authenticated");

    set({ isLoading: true, error: null });

    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", clerkUserId)
        .single();

      if (profileError) throw profileError;

      // Get item details
      const { data: shopItem, error: itemError } = await supabase
        .from("shop_items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (itemError) throw itemError;
      if (!shopItem) throw new Error("Item not found");

      // Check user points
      const { data: userLevel, error: levelError } = await supabase
        .from("user_levels")
        .select("points")
        .eq("user_id", profile.id)
        .single();

      if (levelError) throw levelError;

      if (userLevel.points < shopItem.price_points) {
        throw new Error("Insufficient points");
      }

      // For permanent items, check if already purchased
      if (!shopItem.duration_days) {
        const { data: existingPurchase } = await supabase
          .from("user_purchases")
          .select("id")
          .eq("user_id", profile.id)
          .eq("shop_item_id", itemId)
          .single();

        if (existingPurchase) {
          throw new Error("Item already purchased");
        }
      }

      // Calculate expiration date for temporary items
      let expires_at = null;
      if (shopItem.duration_days) {
        expires_at = new Date();
        expires_at.setDate(expires_at.getDate() + shopItem.duration_days);
      }

      // Use transaction for purchase
      const { error: purchaseError } = await supabase.rpc(
        "purchase_shop_item",
        {
          p_user_id: profile.id,
          p_item_id: itemId,
          p_points_cost: shopItem.price_points,
          p_expires_at: expires_at?.toISOString(),
        }
      );

      if (purchaseError) throw purchaseError;

      // Refresh data
      await get().fetchUserPurchases(clerkUserId);
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  // Cart management (unchanged)
  addToCart: (item: ShopItem) => {
    set((state) => {
      const existingItem = state.cart.find(
        (cartItem) => cartItem.shop_item.id === item.id
      );

      if (existingItem) {
        return {
          cart: state.cart.map((cartItem) =>
            cartItem.shop_item.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          ),
        };
      } else {
        return {
          cart: [...state.cart, { shop_item: item, quantity: 1 }],
        };
      }
    });
  },

  removeFromCart: (itemId: string) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.shop_item.id !== itemId),
    }));
  },

  clearCart: () => {
    set({ cart: [] });
  },

  getCartTotal: () => {
    const { cart } = get();
    return cart.reduce(
      (total, item) => total + item.shop_item.price_points * item.quantity,
      0
    );
  },

  getUserPoints: async (clerkUserId: string): Promise<number> => {
    if (!clerkUserId) return 0;

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", clerkUserId)
        .single();

      if (profileError) throw profileError;

      const { data: userLevel, error: levelError } = await supabase
        .from("user_levels")
        .select("points")
        .eq("user_id", profile.id)
        .single();

      if (levelError) throw levelError;

      return userLevel?.points || 0;
    } catch (error) {
      console.error("Error fetching user points:", error);
      return 0;
    }
  },

  // Utility functions (unchanged)
  getRarityColor: (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-300 bg-gray-50";
      case "rare":
        return "border-blue-300 bg-blue-50";
      case "epic":
        return "border-purple-300 bg-purple-50";
      case "legendary":
        return "border-yellow-300 bg-yellow-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  },

  getCategoryIcon: (category: string) => {
    switch (category) {
      case "feature":
        return "🚀";
      case "reward":
        return "🎁";
      case "customization":
        return "🎨";
      case "boost":
        return "⚡";
      default:
        return "📦";
    }
  },

  isItemPurchased: (itemId: string) => {
    const { userPurchases } = get();
    return userPurchases.some(
      (purchase) => purchase.shop_item_id === itemId && purchase.is_active
    );
  },

  clearError: () => set({ error: null }),
}));
