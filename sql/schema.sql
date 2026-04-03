-- ============================================================
-- Freedom Journey — Supabase PostgreSQL Schema (SAFE VERSION)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  timezone TEXT DEFAULT 'UTC',
  daily_email_opt_in BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ADDICTIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addiction_type TEXT NOT NULL CHECK (addiction_type IN ('porn','gaming','substance','smoking','drinking')),
  last_use TIMESTAMPTZ,
  daily_spend NUMERIC(10,2) DEFAULT 0,
  daily_hours NUMERIC(5,2) DEFAULT 0,
  why_quit TEXT,
  triggers TEXT[] DEFAULT '{}',
  motivation_level INTEGER DEFAULT 5 CHECK (motivation_level BETWEEN 1 AND 10),
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, addiction_type)
);

-- ─── ADDICTION LIMIT FUNCTION ───────────────────────────────
CREATE OR REPLACE FUNCTION check_addiction_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM addictions WHERE user_id = NEW.user_id AND is_active = TRUE) >= 3 THEN
    RAISE EXCEPTION 'Maximum of 3 active addictions allowed per user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_addiction_limit ON addictions;
CREATE TRIGGER enforce_addiction_limit
BEFORE INSERT ON addictions
FOR EACH ROW EXECUTE FUNCTION check_addiction_limit();

-- ─── PLANS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  addiction_id UUID NOT NULL REFERENCES addictions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  overview TEXT,
  milestones JSONB DEFAULT '[]',
  days JSONB DEFAULT '[]',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (addiction_id)
);

-- ─── JOURNAL ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addiction_id UUID NOT NULL REFERENCES addictions(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  mood INTEGER CHECK (mood BETWEEN 1 AND 10),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CHECKINS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addiction_id UUID NOT NULL REFERENCES addictions(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 10),
  energy INTEGER CHECK (energy BETWEEN 1 AND 10),
  slept_well BOOLEAN DEFAULT FALSE,
  urge_level INTEGER DEFAULT 0 CHECK (urge_level BETWEEN 0 AND 10),
  completed_task BOOLEAN DEFAULT FALSE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, addiction_id, date)
);

-- ─── URGE LOGS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS urge_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addiction_id UUID NOT NULL REFERENCES addictions(id) ON DELETE CASCADE,
  intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 10),
  trigger TEXT,
  location TEXT,
  time_of_day TEXT,
  resisted BOOLEAN DEFAULT TRUE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RELAPSES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS relapses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addiction_id UUID NOT NULL REFERENCES addictions(id) ON DELETE CASCADE,
  streak_at_relapse INTEGER DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DAILY MOTIVATIONS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_motivations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addiction_id UUID NOT NULL REFERENCES addictions(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  day_number INTEGER,
  quote JSONB,
  message TEXT,
  recommendations JSONB,
  challenge TEXT,
  reflection_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, addiction_id, date)
);

-- ─── INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_addictions_user_id ON addictions(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_user_addiction ON journal_entries(user_id, addiction_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user_addiction_date ON checkins(user_id, addiction_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_urge_logs_user_addiction ON urge_logs(user_id, addiction_id);
CREATE INDEX IF NOT EXISTS idx_daily_motivations_date ON daily_motivations(user_id, addiction_id, date);

-- ─── RLS ────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE urge_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE relapses ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_motivations ENABLE ROW LEVEL SECURITY;

-- Drop policies first
DROP POLICY IF EXISTS "Users own their profile" ON profiles;
DROP POLICY IF EXISTS "Users own their addictions" ON addictions;
DROP POLICY IF EXISTS "Users own their plans" ON plans;
DROP POLICY IF EXISTS "Users own their journal" ON journal_entries;
DROP POLICY IF EXISTS "Users own their checkins" ON checkins;
DROP POLICY IF EXISTS "Users own their urge logs" ON urge_logs;
DROP POLICY IF EXISTS "Users own their relapses" ON relapses;
DROP POLICY IF EXISTS "Users own their motivations" ON daily_motivations;

-- Recreate policies
CREATE POLICY "Users own their profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users own their addictions" ON addictions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their plans" ON plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their journal" ON journal_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their checkins" ON checkins FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their urge logs" ON urge_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their relapses" ON relapses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their motivations" ON daily_motivations FOR ALL USING (auth.uid() = user_id);

-- ─── UPDATED_AT TRIGGER ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
DROP TRIGGER IF EXISTS set_updated_at_addictions ON addictions;

CREATE TRIGGER set_updated_at_profiles
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_addictions
BEFORE UPDATE ON addictions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── AUTO PROFILE CREATION ──────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();