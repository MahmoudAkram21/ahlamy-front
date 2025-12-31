-- Note: This script seeds demo data. In production, users will sign up through the auth system.
-- For testing purposes, we'll create some demo profiles and dreams.

-- Insert demo interpreter profile
INSERT INTO profiles (id, email, full_name, role, bio, is_available, total_interpretations, rating)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'interpreter@example.com',
  'أحمد المفسر',
  'interpreter',
  'مفسر أحلام متخصص بخبرة 10 سنوات',
  true,
  45,
  4.8
) ON CONFLICT DO NOTHING;

-- Insert demo dreamer profiles
INSERT INTO profiles (id, email, full_name, role, bio, is_available)
VALUES 
  ('00000000-0000-0000-0000-000000000002'::uuid, 'dreamer1@example.com', 'فاطمة', 'dreamer', 'مهتمة بتفسير الرؤى', true),
  ('00000000-0000-0000-0000-000000000003'::uuid, 'dreamer2@example.com', 'محمد', 'dreamer', 'أحب معرفة معاني أحلامي', true)
ON CONFLICT DO NOTHING;

-- Insert demo dreams
INSERT INTO dreams (id, dreamer_id, interpreter_id, title, content, status, dream_date, mood)
VALUES 
  (
    '10000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'رؤيا الطير الأبيض',
    'رأيت في حلمي طيراً أبيض جميلاً يحوم حول منزلي، كان يغرد بصوت عذب جداً، وكلما اقتربت منه ابتعد قليلاً ثم عاد. شعرت بسلام وهدوء غريب في الحلم.',
    'interpreted',
    '2025-10-15'::date,
    'peaceful'
  ),
  (
    '10000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000003'::uuid,
    NULL,
    'رؤيا الماء الصافي',
    'رأيت نفسي أسبح في ماء صافي جداً، الماء دافئ وجميل، والسماء زرقاء صافية. كنت أشعر بالحرية والسعادة.',
    'new',
    '2025-10-16'::date,
    'happy'
  ),
  (
    '10000000-0000-0000-0000-000000000003'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'رؤيا الجبل العالي',
    'كنت أتسلق جبلاً عالياً جداً، الطريق صعب لكن أشعر بقوة داخلي. عندما وصلت للقمة، رأيت منظراً خلاباً لا يوصف.',
    'pending_inquiry',
    '2025-10-14'::date,
    'determined'
  )
ON CONFLICT DO NOTHING;

-- Insert demo messages
INSERT INTO messages (id, dream_id, sender_id, content, message_type)
VALUES 
  (
    '20000000-0000-0000-0000-000000000001'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'السلام عليكم ورحمة الله وبركاته، شكراً لك على مشاركة هذه الرؤيا الجميلة. الطير الأبيض في الأحلام عادة ما يرمز إلى الخير والبشارة.',
    'interpretation'
  ),
  (
    '20000000-0000-0000-0000-000000000002'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid,
    'شكراً جزيلاً على التفسير الرائع، استفدت كثيراً من شرحك.',
    'text'
  )
ON CONFLICT DO NOTHING;
