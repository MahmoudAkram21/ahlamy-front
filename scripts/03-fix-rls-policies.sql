-- ============================================
-- Fix RLS Policies for Profile Creation
-- ============================================

-- Drop all existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to view all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Create permissive policies that allow signup
CREATE POLICY "profiles_view_all" ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- Create Test Accounts (Profiles)
-- ============================================

-- Test Interpreter Account
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

-- Test Dreamer Account
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
-- Create Sample Dreams
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
-- Create Sample Messages
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
  AND m.content LIKE '%النقاء%'
);
