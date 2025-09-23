// types/ratings.ts
export interface UserLevel {
  id: string;
  user_id: string;
  points: number;
  level: number;
  current_level_points: number;
  next_level_points: number;
  total_habits_created: number;
  total_habits_completed: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_reward: number;
  requirement_type: "streak" | "habits_created" | "completions" | "level";
  requirement_value: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement: Achievement;
}

export interface LeaderboardUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  points: number;
  level: number;
  current_streak: number;
  rank: number;
}
