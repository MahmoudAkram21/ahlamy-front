-- Add is_super_admin column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_plans table
CREATE TABLE IF NOT EXISTS user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  interpreter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default plans
INSERT INTO plans (name, description, price, features, is_active) VALUES
  ('مجاني', 'خطة مجانية للمبتدئين', 0, '["تفسير واحد شهريا", "دعم البريد الإلكتروني"]'::jsonb, true),
  ('أساسي', 'خطة أساسية للمستخدمين العاديين', 9.99, '["5 تفسيرات شهريا", "دعم الأولوية", "الوصول إلى الأرشيف"]'::jsonb, true),
  ('احترافي', 'خطة احترافية للمستخدمين المتقدمين', 29.99, '["تفسيرات غير محدودة", "دعم 24/7", "تحليلات متقدمة"]'::jsonb, true),
  ('بريميوم', 'خطة بريميوم مع جميع الميزات', 99.99, '["تفسيرات غير محدودة", "دعم شخصي", "تحليلات متقدمة", "أولوية عالية"]'::jsonb, true)
ON CONFLICT DO NOTHING;

-- Create admin user (you'll need to update this with actual admin email)
-- First, create a test admin profile
INSERT INTO profiles (id, email, full_name, role, is_super_admin)
VALUES ('00000000-0000-0000-0000-000000000099'::uuid, 'admin@mubasharat.com', 'مسؤول النظام', 'admin', true)
ON CONFLICT (email) DO NOTHING;
