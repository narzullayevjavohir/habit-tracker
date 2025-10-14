import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import {
  HabitWithEntries,
  CreateHabitData,
  UpdateHabitData,
  ToggleEntryData,
} from "@/types/habits";

interface HabitStore {
  // State
  habits: HabitWithEntries[];
  currentHabit: HabitWithEntries | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchHabits: () => Promise<void>;
  fetchHabit: (id: string) => Promise<void>;
  createHabit: (data: CreateHabitData) => Promise<void>;
  updateHabit: (id: string, data: UpdateHabitData) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitEntry: (data: ToggleEntryData) => Promise<void>;
  getTodaysHabits: () => HabitWithEntries[];
  getHabitStreak: (habitId: string) => number;

  // Utilities
  clearError: () => void;
  clearCurrentHabit: () => void;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  // Initial state
  habits: [],
  currentHabit: null,
  isLoading: false,
  error: null,

  // Fetch all habits for the current user
  fetchHabits: async () => {
    set({ isLoading: true, error: null });

    try {
      // Get current user from Supabase auth
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // First, get or create user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

      if (profileError && profileError.code === "PGRST116") {
        // Profile doesn't exist, create one
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert([
            {
              clerk_user_id: user.id,
              email: user.email!,
              first_name: user.user_metadata?.first_name,
              last_name: user.user_metadata?.last_name,
            },
          ])
          .select()
          .single();

        if (createError) throw createError;

        // Now fetch habits with the new profile
        await fetchHabitsWithProfile(newProfile.id);
      } else if (profileError) {
        throw profileError;
      } else if (profile) {
        await fetchHabitsWithProfile(profile.id);
      }

      async function fetchHabitsWithProfile(profileId: string) {
        const { data: habits, error } = await supabase
          .from("habits")
          .select(
            `
            *,
            habit_entries (*)
          `
          )
          .eq("user_id", profileId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        set({ habits: habits || [], isLoading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Fetch single habit
  fetchHabit: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data: habit, error } = await supabase
        .from("habits")
        .select(
          `
          *,
          habit_entries (*)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      set({ currentHabit: habit, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Create new habit
  createHabit: async (data: CreateHabitData) => {
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

      const habitData = {
        ...data,
        user_id: profile.id,
        frequency: data.frequency || "daily",
        target_count: data.target_count || 1,
        color: data.color || "#3B82F6",
        icon: data.icon || "✅",
      };

      const { data: habit, error } = await supabase
        .from("habits")
        .insert([habitData])
        .select(
          `
          *,
          habit_entries (*)
        `
        )
        .single();

      if (error) throw error;

      set((state) => ({
        habits: [habit, ...state.habits],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Update habit
  updateHabit: async (id: string, data: UpdateHabitData) => {
    set({ isLoading: true, error: null });

    try {
      const { data: habit, error } = await supabase
        .from("habits")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select(
          `
          *,
          habit_entries (*)
        `
        )
        .single();

      if (error) throw error;

      set((state) => ({
        habits: state.habits.map((h) => (h.id === id ? habit : h)),
        currentHabit:
          state.currentHabit?.id === id ? habit : state.currentHabit,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Delete habit
  deleteHabit: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase.from("habits").delete().eq("id", id);

      if (error) throw error;

      set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
        currentHabit: state.currentHabit?.id === id ? null : state.currentHabit,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Toggle habit entry (complete/incomplete)
  toggleHabitEntry: async ({ habitId, date, completed }: ToggleEntryData) => {
    try {
      // Check if entry exists
      const { data: existingEntry } = await supabase
        .from("habit_entries")
        .select("*")
        .eq("habit_id", habitId)
        .eq("entry_date", date)
        .single();

      if (existingEntry) {
        // Update existing entry
        const { data: entry, error } = await supabase
          .from("habit_entries")
          .update({ completed, notes: completed ? "Completed" : "Incomplete" })
          .eq("id", existingEntry.id)
          .select()
          .single();

        if (error) throw error;

        // Update local state
        updateHabitEntries(habitId, entry);
      } else {
        // Create new entry
        const { data: entry, error } = await supabase
          .from("habit_entries")
          .insert([
            {
              habit_id: habitId,
              entry_date: date,
              completed,
              notes: completed ? "Completed" : "Incomplete",
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // Update local state
        updateHabitEntries(habitId, entry);
      }

      function updateHabitEntries(habitId: string, newEntry: any) {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === habitId
              ? {
                  ...habit,
                  habit_entries: existingEntry
                    ? habit.habit_entries.map((e) =>
                        e.id === newEntry.id ? newEntry : e
                      )
                    : [...habit.habit_entries, newEntry],
                }
              : habit
          ),
          currentHabit:
            state.currentHabit?.id === habitId
              ? {
                  ...state.currentHabit,
                  habit_entries: existingEntry
                    ? state.currentHabit.habit_entries.map((e) =>
                        e.id === newEntry.id ? newEntry : e
                      )
                    : [...state.currentHabit.habit_entries, newEntry],
                }
              : state.currentHabit,
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Get today's habits
  getTodaysHabits: () => {
    const today = new Date().toISOString().split("T")[0];
    const { habits } = get();

    return habits.map((habit) => ({
      ...habit,
      habit_entries: habit.habit_entries.filter(
        (entry) => entry.entry_date === today
      ),
    }));
  },

  // Calculate habit streak
  getHabitStreak: (habitId: string) => {
    const { habits } = get();
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return 0;

    const completedEntries = habit.habit_entries
      .filter((entry) => entry.completed)
      .sort(
        (a, b) =>
          new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
      );

    if (completedEntries.length === 0) return 0;

    let streak = 1;
    let currentDate = new Date(completedEntries[0].entry_date);

    for (let i = 1; i < completedEntries.length; i++) {
      const entryDate = new Date(completedEntries[i].entry_date);
      const diffTime = currentDate.getTime() - entryDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
        currentDate = entryDate;
      } else {
        break;
      }
    }

    return streak;
  },

  // Utility functions
  clearError: () => set({ error: null }),
  clearCurrentHabit: () => set({ currentHabit: null }),
}));
