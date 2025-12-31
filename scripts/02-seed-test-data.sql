-- Insert test users (you need to create these in Supabase Auth first)
-- For now, we'll create profiles for testing

-- Note: These UUIDs are placeholders. You'll need to replace them with actual user IDs from Supabase Auth
-- To get the user IDs, sign up with these emails first, then update the UUIDs below

-- Test Interpreter
INSERT INTO profiles (id, email, full_name, role, bio, is_available, total_interpretations)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'interpreter@example.com',
  'أحمد المفسر',
  'interpreter',
  'مفسر أحلام متخصص بخبرة 10 سنوات',
  true,
  45
) ON CONFLICT (id) DO NOTHING;

-- Test Dreamer
INSERT INTO profiles (id, email, full_name, role, bio, is_available)
VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  'dreamer@example.com',
  'محمد الرائي',
  'dreamer',
  'أبحث عن تفسير رؤيتي',
  true
) ON CONFLICT (id) DO NOTHING;

-- Insert sample dreams
INSERT INTO dreams (dreamer_id, interpreter_id, title, content, mood, dream_date, status)
VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'رؤية الماء الصافي',
  'رأيت نفسي أسبح في ماء صافي جداً وزرقاء اللون، والشمس تشرق من خلفي، شعرت بسلام وهدوء عميق',
  'peaceful',
  '2024-01-15',
  'interpreted'
),
(
  '00000000-0000-0000-0000-000000000002'::uuid,
  NULL,
  'رؤية الطيران',
  'كنت أطير فوق مدينة جميلة جداً، أرى البيوت والشوارع من الأعلى، لكن فجأة بدأت أسقط',
  'anxious',
  '2024-01-16',
  'new'
);

-- Insert sample messages
INSERT INTO messages (dream_id, sender_id, content, message_type)
VALUES (
  (SELECT id FROM dreams WHERE title = 'رؤية الماء الصافي' LIMIT 1),
  '00000000-0000-0000-0000-000000000001'::uuid,
  'السلام عليكم، هذه رؤية جميلة جداً. الماء الصافي يرمز إلى النقاء والصفاء',
  'interpretation'
),
(
  (SELECT id FROM dreams WHERE title = 'رؤية الماء الصافي' LIMIT 1),
  '00000000-0000-0000-0000-000000000002'::uuid,
  'شكراً لك على التفسير الجميل',
  'text'
);
