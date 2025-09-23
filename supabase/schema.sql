-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (links to Clerk users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL DEFAULT 'daily',
  target_count INTEGER DEFAULT 1,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT '✅',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create habit entries (completions)
CREATE TABLE IF NOT EXISTS habit_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  entry_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, entry_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_entries_habit_id ON habit_entries(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_entries_date ON habit_entries(entry_date);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own habits" ON habits
  FOR ALL USING (auth.uid()::text IN (
    SELECT clerk_user_id FROM profiles WHERE id = user_id
  ));

CREATE POLICY "Users can manage own habit entries" ON habit_entries
  FOR ALL USING (EXISTS (
    SELECT 1 FROM habits 
    WHERE habits.id = habit_entries.habit_id 
    AND auth.uid()::text IN (
      SELECT clerk_user_id FROM profiles WHERE id = habits.user_id
    )
  ));

  -- Add to your existing schema
-- User levels and points table
CREATE TABLE IF NOT EXISTS user_levels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  points INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  current_level_points INTEGER DEFAULT 0 NOT NULL,
  next_level_points INTEGER DEFAULT 100 NOT NULL,
  total_habits_created INTEGER DEFAULT 0 NOT NULL,
  total_habits_completed INTEGER DEFAULT 0 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points_reward INTEGER DEFAULT 0 NOT NULL,
  requirement_type TEXT NOT NULL, -- 'streak', 'habits_created', 'completions', 'level'
  requirement_value INTEGER NOT NULL,
  rarity TEXT DEFAULT 'common' NOT NULL -- 'common', 'rare', 'epic', 'legendary'
);

-- User achievements junction table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Pre-populate achievements
INSERT INTO achievements (name, description, icon, points_reward, requirement_type, requirement_value, rarity) VALUES
-- Streak achievements
('First Steps', 'Complete your first habit', '🚶', 10, 'streak', 1, 'common'),
('Consistency King', '7-day streak', '🔥', 50, 'streak', 7, 'common'),
('Habit Master', '30-day streak', '🏆', 200, 'streak', 30, 'rare'),
('Unstoppable', '90-day streak', '💎', 500, 'streak', 90, 'epic'),
('Legendary', '365-day streak', '👑', 1000, 'streak', 365, 'legendary'),

-- Habit creation achievements
('Habit Architect', 'Create 5 habits', '🏗️', 30, 'habits_created', 5, 'common'),
('Habit Collector', 'Create 15 habits', '📚', 100, 'habits_created', 15, 'rare'),
('Habit Creator', 'Create 30 habits', '🌟', 300, 'habits_created', 30, 'epic'),

-- Completion achievements
('Dedicated', 'Complete 50 habits', '✅', 40, 'completions', 50, 'common'),
('Productive', 'Complete 200 habits', '⚡', 150, 'completions', 200, 'rare'),
('Achiever', 'Complete 500 habits', '🎯', 400, 'completions', 500, 'epic'),

-- Level achievements
('Rookie', 'Reach level 5', '🌱', 50, 'level', 5, 'common'),
('Pro', 'Reach level 15', '🚀', 200, 'level', 15, 'rare'),
('Expert', 'Reach level 30', '🧠', 500, 'level', 30, 'epic'),
('Master', 'Reach level 50', '🏅', 1000, 'level', 50, 'legendary');

-- Function to increment user points
CREATE OR REPLACE FUNCTION increment_user_points(
  user_id UUID,
  points_to_add INTEGER,
  activity_reason TEXT
) RETURNS user_levels AS $$
DECLARE
  updated_user_level user_levels;
BEGIN
  UPDATE user_levels 
  SET 
    points = points + points_to_add,
    updated_at = NOW()
  WHERE user_levels.user_id = increment_user_points.user_id
  RETURNING * INTO updated_user_level;

  -- Update level based on new points
  UPDATE user_levels 
  SET 
    level = FLOOR(SQRT(points / 100)) + 1,
    current_level_points = points - (100 * FLOOR(SQRT(points / 100)) * FLOOR(SQRT(points / 100))),
    next_level_points = (100 * (FLOOR(SQRT(points / 100)) + 1) * (FLOOR(SQRT(points / 100)) + 1)) - (100 * FLOOR(SQRT(points / 100)) * FLOOR(SQRT(points / 100)))
  WHERE user_levels.user_id = increment_user_points.user_id
  RETURNING * INTO updated_user_level;

  RETURN updated_user_level;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_user_achievements(user_id UUID)
RETURNS void AS $$
BEGIN
  -- Award achievements based on user's current stats
  INSERT INTO user_achievements (user_id, achievement_id)
  SELECT 
    user_id, 
    a.id 
  FROM achievements a
  WHERE a.id NOT IN (
    SELECT ua.achievement_id 
    FROM user_achievements ua 
    WHERE ua.user_id = check_user_achievements.user_id
  )
  AND (
    (a.requirement_type = 'streak' AND EXISTS (
      SELECT 1 FROM user_levels ul 
      WHERE ul.user_id = check_user_achievements.user_id 
      AND ul.current_streak >= a.requirement_value
    ))
    OR (a.requirement_type = 'habits_created' AND EXISTS (
      SELECT 1 FROM user_levels ul 
      WHERE ul.user_id = check_user_achievements.user_id 
      AND ul.total_habits_created >= a.requirement_value
    ))
    OR (a.requirement_type = 'completions' AND EXISTS (
      SELECT 1 FROM user_levels ul 
      WHERE ul.user_id = check_user_achievements.user_id 
      AND ul.total_habits_completed >= a.requirement_value
    ))
    OR (a.requirement_type = 'level' AND EXISTS (
      SELECT 1 FROM user_levels ul 
      WHERE ul.user_id = check_user_achievements.user_id 
      AND ul.level >= a.requirement_value
    ))
  );
END;
$$ LANGUAGE plpgsql;