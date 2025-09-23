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
  created_at: string;
  updated_at: string;
}

export interface HabitEntry {
  id: string;
  habit_id: string;
  entry_date: string;
  completed: boolean;
  notes?: string;
  created_at: string;
}

export interface HabitWithEntries extends Habit {
  habit_entries: HabitEntry[];
}

export interface CreateHabitData {
  title: string;
  description?: string;
  frequency?: "daily" | "weekly" | "monthly";
  target_count?: number;
  color?: string;
  icon?: string;
}

export interface UpdateHabitData extends Partial<CreateHabitData> {
  is_active?: boolean;
}

export interface ToggleEntryData {
  habitId: string;
  date: string;
  completed: boolean;
}
