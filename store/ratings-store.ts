// lib/stores/ratings-store.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";

interface UserLevel {
  id: string;
  user_id: string;
  level: number;
  points: number;
  experience: number;
  created_at: string;
  updated_at: string;
}

interface RatingsStore {
  // State
  userLevel: UserLevel | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUserLevel: (clerkUserId: string) => Promise<void>;
  addPoints: (clerkUserId: string, points: number) => Promise<void>;
  addExperience: (clerkUserId: string, experience: number) => Promise<void>;
  levelUp: (clerkUserId: string) => Promise<void>;

  // Utilities
  getLevelProgress: () => number;
  getNextLevelExperience: () => number;
  clearError: () => void;
}

export const useRatingsStore = create<RatingsStore>((set, get) => ({
  // Initial state
  userLevel: null,
  isLoading: false,
  error: null,

  // Fetch user level data
  fetchUserLevel: async (clerkUserId: string) => {
    if (!clerkUserId) return;

    set({ isLoading: true, error: null });

    try {
      // First get profile ID from clerk_user_id
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", clerkUserId)
        .single();

      if (profileError) throw profileError;

      // Then get user level data
      const { data: userLevel, error: levelError } = await supabase
        .from("user_levels")
        .select("*")
        .eq("user_id", profile.id)
        .single();

      if (levelError) {
        // If no level record exists, create one
        if (levelError.code === "PGRST116") {
          const { data: newLevel, error: createError } = await supabase
            .from("user_levels")
            .insert([
              {
                user_id: profile.id,
                level: 1,
                points: 0,
                experience: 0,
              },
            ])
            .select()
            .single();

          if (createError) throw createError;
          set({ userLevel: newLevel, isLoading: false });
          return;
        }
        throw levelError;
      }

      set({ userLevel, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Add points to user
  addPoints: async (clerkUserId: string, points: number) => {
    if (!clerkUserId || points <= 0) return;

    set({ isLoading: true, error: null });

    try {
      // Get profile ID
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", clerkUserId)
        .single();

      if (profileError) throw profileError;

      // Add points using RPC function
      const { error: pointsError } = await supabase.rpc("add_user_points", {
        user_id: profile.id,
        points_to_add: points,
      });

      if (pointsError) throw pointsError;

      // Refresh user level data
      await get().fetchUserLevel(clerkUserId);
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  // Add experience to user
  addExperience: async (clerkUserId: string, experience: number) => {
    if (!clerkUserId || experience <= 0) return;

    set({ isLoading: true, error: null });

    try {
      // Get profile ID
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", clerkUserId)
        .single();

      if (profileError) throw profileError;

      // Add experience using RPC function
      const { error: expError } = await supabase.rpc("add_user_experience", {
        user_id: profile.id,
        exp_to_add: experience,
      });

      if (expError) throw expError;

      // Check if user should level up
      const { userLevel } = get();
      if (userLevel) {
        const nextLevelExp = get().getNextLevelExperience();
        if (userLevel.experience + experience >= nextLevelExp) {
          await get().levelUp(clerkUserId);
        } else {
          // Refresh user level data
          await get().fetchUserLevel(clerkUserId);
        }
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  // Level up user
  levelUp: async (clerkUserId: string) => {
    if (!clerkUserId) return;

    set({ isLoading: true, error: null });

    try {
      // Get profile ID
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", clerkUserId)
        .single();

      if (profileError) throw profileError;

      // Level up using RPC function
      const { error: levelUpError } = await supabase.rpc("level_up_user", {
        user_id: profile.id,
      });

      if (levelUpError) throw levelUpError;

      // Refresh user level data
      await get().fetchUserLevel(clerkUserId);
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  // Utility functions
  getLevelProgress: () => {
    const { userLevel } = get();
    if (!userLevel) return 0;

    const currentLevelExp = (userLevel.level - 1) * 100; // Base experience for current level
    const currentExpInLevel = userLevel.experience - currentLevelExp;
    const expNeededForNextLevel = 100; // Fixed 100 exp per level

    return (currentExpInLevel / expNeededForNextLevel) * 100;
  },

  getNextLevelExperience: () => {
    const { userLevel } = get();
    if (!userLevel) return 100;

    return userLevel.level * 100; // Each level requires 100 more experience
  },

  clearError: () => set({ error: null }),
}));
