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

-- Add shopping-related tables to your schema
CREATE TABLE IF NOT EXISTS shop_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'feature', 'reward', 'customization', 'boost'
  price_points INTEGER NOT NULL,
  image_url TEXT,
  icon TEXT NOT NULL,
  rarity TEXT DEFAULT 'common' NOT NULL, -- 'common', 'rare', 'epic', 'legendary'
  is_available BOOLEAN DEFAULT true NOT NULL,
  effect_type TEXT, -- 'streak_protection', 'point_boost', 'custom_icon', etc.
  effect_value INTEGER,
  duration_days INTEGER, -- NULL for permanent items
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User purchases table
CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  shop_item_id UUID REFERENCES shop_items(id) ON DELETE CASCADE NOT NULL,
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true NOT NULL,
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, shop_item_id) -- Prevent duplicate purchases for permanent items
);

-- Pre-populate shop items
INSERT INTO shop_items (name, description, category, price_points, icon, rarity, effect_type, effect_value, duration_days) VALUES
-- Features
('Premium Analytics', 'Unlock advanced habit analytics and insights', 'feature', 500, '📊', 'rare', 'premium_analytics', 1, NULL),
('Custom Habit Themes', 'Personalize your habit tracking with custom themes', 'feature', 300, '🎨', 'common', 'custom_themes', 1, NULL),
('Export Data', 'Export your habit data to CSV/PDF', 'feature', 200, '📤', 'common', 'data_export', 1, NULL),

-- Boosts
('Double Points Day', 'Earn double points for all completed habits today', 'boost', 150, '⚡', 'common', 'point_boost', 2, 1),
('Streak Protector', 'Protect your current streak from breaking once', 'boost', 400, '🛡️', 'rare', 'streak_protection', 1, NULL),
('Focus Mode', 'Remove distractions for 24 hours', 'boost', 250, '🎯', 'common', 'focus_mode', 1, 1),

-- Customizations
('Golden Habit Icon', 'Exclusive golden icon for your favorite habit', 'customization', 100, '⭐', 'rare', 'custom_icon', 1, NULL),
('Animated Celebrations', 'Special animations when completing habits', 'customization', 350, '🎉', 'epic', 'animations', 1, NULL),
('Custom Notification Sounds', 'Personalized sounds for habit reminders', 'customization', 200, '🔔', 'common', 'custom_sounds', 1, NULL),

-- Real-world Rewards
('Coffee Treat', 'Redeem for a coffee at partner cafes', 'reward', 1000, '☕', 'common', 'coffee_voucher', 1, 30),
('Book Voucher', '$10 book store voucher', 'reward', 2000, '📚', 'rare', 'book_voucher', 10, 30),
('Meditation App Subscription', '1-month premium subscription', 'reward', 3000, '🧘', 'epic', 'app_subscription', 1, 30),
('Fitness Tracker', 'Basic fitness tracker device', 'reward', 10000, '⌚', 'legendary', 'fitness_tracker', 1, NULL);

-- Add this function to your Supabase SQL editor
CREATE OR REPLACE FUNCTION decrement_user_points(
  user_id UUID,
  points_to_deduct INTEGER
) RETURNS user_levels AS $$
DECLARE
  updated_user_level user_levels;
BEGIN
  UPDATE user_levels 
  SET 
    points = GREATEST(0, points - points_to_deduct),
    updated_at = NOW()
  WHERE user_levels.user_id = decrement_user_points.user_id
  RETURNING * INTO updated_user_level;

  RETURN updated_user_level;
END;
$$ LANGUAGE plpgsql;

-- Community and events tables
CREATE TABLE IF NOT EXISTS community_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'webinar', 'workshop', 'challenge', 'meetup', 'qna'
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_participants INTEGER,
  is_online BOOLEAN DEFAULT true NOT NULL,
  meeting_url TEXT,
  location TEXT,
  cover_image_url TEXT,
  is_recurring BOOLEAN DEFAULT false NOT NULL,
  recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly'
  price_points INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event participants
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES community_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Chat rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  room_type TEXT NOT NULL, -- 'public', 'private', 'event'
  event_id UUID REFERENCES community_events(id) ON DELETE CASCADE,
  max_members INTEGER,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' NOT NULL, -- 'text', 'image', 'system'
  attachment_url TEXT,
  replied_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  is_edited BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room members
CREATE TABLE IF NOT EXISTS room_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT DEFAULT 'member' NOT NULL, -- 'member', 'moderator', 'admin'
  UNIQUE(room_id, user_id)
);

-- Pre-populate with some default chat rooms
INSERT INTO chat_rooms (name, description, room_type, created_by, max_members) VALUES
('General Discussion', 'Talk about habits, productivity, and general topics', 'public', (SELECT id FROM profiles LIMIT 1), 1000),
('Daily Accountability', 'Share your daily progress and get support', 'public', (SELECT id FROM profiles LIMIT 1), 500),
('New Habit Ideas', 'Discuss and share new habit ideas', 'public', (SELECT id FROM profiles LIMIT 1), 500),
('Challenge Participants', 'For participants of current challenges', 'public', (SELECT id FROM profiles LIMIT 1), 200);