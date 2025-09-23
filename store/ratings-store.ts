// lib/stores/ratings-store.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import {
  UserLevel,
  Achievement,
  UserAchievement,
  LeaderboardUser,
} from "@/types/ratings";

interface RatingsStore {
  // State
  userLevel: UserLevel | null;
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  leaderboard: LeaderboardUser[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUserLevel: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
  fetchUserAchievements: () => Promise<void>;
  fetchLeaderboard: (limit?: number) => Promise<void>;
  awardPoints: (points: number, reason: string) => Promise<void>;
  checkAchievements: () => Promise<void>;

  // Utilities
  clearError: () => void;
  calculateLevel: (points: number) => {
    level: number;
    current: number;
    next: number;
  };
}

export const useRatingsStore = create<RatingsStore>((set, get) => ({
  // Initial state
  userLevel: null,
  achievements: [],
  userAchievements: [],
  leaderboard: [],
  isLoading: false,
  error: null,

  // Fetch user level and points
  fetchUserLevel: async () => {
    set({ isLoading: true, error: null });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error("Profile not found");

      // Fetch or create user level
      let { data: userLevel, error: levelError } = await supabase
        .from("user_levels")
        .select("*")
        .eq("user_id", profile.id)
        .single();

      if (levelError && levelError.code === "PGRST116") {
        // Create user level record if it doesn't exist
        const { data: newLevel, error: createError } = await supabase
          .from("user_levels")
          .insert([{ user_id: profile.id }])
          .select()
          .single();

        if (createError) throw createError;
        userLevel = newLevel;
      } else if (levelError) {
        throw levelError;
      }

      set({ userLevel, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Fetch all available achievements
  fetchAchievements: async () => {
    try {
      const { data: achievements, error } = await supabase
        .from("achievements")
        .select("*")
        .order("points_reward", { ascending: true });

      if (error) throw error;
      set({ achievements: achievements || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Fetch user's earned achievements
  fetchUserAchievements: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

      if (profileError) throw profileError;

      const { data: userAchievements, error } = await supabase
        .from("user_achievements")
        .select(
          `
          *,
          achievement:achievements(*)
        `
        )
        .eq("user_id", profile.id)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      set({ userAchievements: userAchievements || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Fetch leaderboard
  fetchLeaderboard: async (limit = 50) => {
    set({ isLoading: true });

    try {
      const { data: leaderboard, error } = await supabase
        .from("user_levels")
        .select(
          `
          points,
          level,
          current_streak,
          profile:profiles!inner(email, first_name, last_name)
        `
        )
        .order("points", { ascending: false })
        .limit(limit);

      if (error) throw error;

      const rankedLeaderboard = (leaderboard || []).map((item, index) => ({
        user_id: item.profile.id,
        email: item.profile.email,
        first_name: item.profile.first_name,
        last_name: item.profile.last_name,
        points: item.points,
        level: item.level,
        current_streak: item.current_streak,
        rank: index + 1,
      }));

      set({ leaderboard: rankedLeaderboard, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Award points to user
  awardPoints: async (points: number, reason: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

      if (profileError) throw profileError;

      // Update user points
      const { data: updatedLevel, error } = await supabase.rpc(
        "increment_user_points",
        {
          user_id: profile.id,
          points_to_add: points,
          activity_reason: reason,
        }
      );

      if (error) throw error;

      // Update local state
      set((state) => ({
        userLevel: updatedLevel
          ? { ...state.userLevel, ...updatedLevel }
          : state.userLevel,
      }));

      // Check for new achievements
      get().checkAchievements();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Check and award achievements
  checkAchievements: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

      if (profileError) throw profileError;

      // This would call a PostgreSQL function to check and award achievements
      const { error } = await supabase.rpc("check_user_achievements", {
        user_id: profile.id,
      });

      if (error) throw error;

      // Refresh achievements
      get().fetchUserAchievements();
    } catch (error) {
      console.error("Error checking achievements:", error);
    }
  },

  // Calculate level based on points
  calculateLevel: (points: number) => {
    const basePoints = 100;
    const level = Math.floor(Math.sqrt(points / basePoints)) + 1;
    const currentLevelPoints = basePoints * Math.pow(level - 1, 2);
    const nextLevelPoints = basePoints * Math.pow(level, 2);

    return {
      level,
      current: points - currentLevelPoints,
      next: nextLevelPoints - currentLevelPoints,
    };
  },

  clearError: () => set({ error: null }),
}));
