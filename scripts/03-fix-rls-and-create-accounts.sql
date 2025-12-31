-- ============================================
-- STEP 1: Disable RLS temporarily to fix policies
-- ============================================

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to view all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- ============================================
-- STEP 2: Create new RLS policies that work
-- ============================================

-- Allow anyone to view all profiles
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- STEP 3: Create test accounts in auth.users
-- ============================================

-- Note: In Supabase, you need to use the auth.users table
-- We'll create profiles for existing users

-- ============================================
-- STEP 4: Create test profiles
-- ============================================

-- Interpreter profile (using a test UUID)
INSERT INTO profiles (id, email, full_name, role, bio, is_available, total_interpretations)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'interpreter@test.com',
  'أحمد المفسر',
  'interpreter',
  'مفسر أحلام متخصص بخبرة 10 سنوات',
  true,
  45
)
ON CONFLICT (id) DO NOTHING;

-- Dreamer profile (using a test UUID)
INSERT INTO profiles (id, email, full_name, role, bio, is_available)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'dreamer@test.com',
  'محمد الرائي',
  'dreamer',
  'أبحث عن تفسير رؤيتي',
  true
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 5: Create sample dreams
-- ============================================

INSERT INTO dreams (dreamer_id, interpreter_id, title, content, mood, dream_date, status)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'رؤية الماء الصافي',
  'رأيت نفسي أسبح في ماء صافي جداً وزرقاء اللون، والشمس تشرق من خلفي، شعرت بسلام وهدوء عميق',
  'peaceful',
  '2024-01-15',
  'interpreted'
)
ON CONFLICT DO NOTHING;

INSERT INTO dreams (dreamer_id, title, content, mood, dream_date, status)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'رؤية الطيران',
  'كنت أطير فوق مدينة جميلة جداً، أرى البيوت والشوارع من الأعلى، لكن فجأة بدأت أسقط',
  'anxious',
  '2024-01-16',
  'new'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 6: Create sample messages
-- ============================================

INSERT INTO messages (dream_id, sender_id, content, message_type)
SELECT 
  d.id,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'السلام عليكم، هذه رؤية جميلة جداً. الماء الصافي يرمز إلى النقاء والصفاء',
  'interpretation'
FROM dreams d
WHERE d.title = 'رؤية الماء الصافي'
AND NOT EXISTS (
  SELECT 1 FROM messages m 
  WHERE m.dream_id = d.id 
  AND m.content = 'السلام عليكم، هذه رؤية جميلة جداً. الماء الصافي يرمز إلى النقاء والصفاء'
);
