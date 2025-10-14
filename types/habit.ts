export interface HabitEntry {
  id: string;
  habit_id: string;
  user_id: string;
  entry_date: string;
  completed: boolean;
  notes?: string;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly";
  target_count: number;
  color: string;
  icon: string;
  is_active: boolean;
  current_streak: number;
  best_streak: number;
  total_completions: number;
  created_at: string;
  updated_at: string;
  habit_entries: HabitEntry[];
}

export type HabitStatus = "all" | "active" | "completed" | "archived";
