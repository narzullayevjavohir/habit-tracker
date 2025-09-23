export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: "feature" | "reward" | "customization" | "boost";
  price_points: number;
  image_url?: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  is_available: boolean;
  effect_type?: string;
  effect_value?: number;
  duration_days?: number;
  created_at: string;
}

export interface UserPurchase {
  id: string;
  user_id: string;
  shop_item_id: string;
  purchase_date: string;
  is_active: boolean;
  expires_at?: string;
  shop_item: ShopItem;
}

export interface ShoppingCartItem {
  shop_item: ShopItem;
  quantity: number;
}
