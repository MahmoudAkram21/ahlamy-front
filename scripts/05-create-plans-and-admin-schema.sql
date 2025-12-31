-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_days INTEGER NOT NULL,
  max_dreams INTEGER,
  max_interpretations INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_plans table (tracks which plan each user has)
CREATE TABLE IF NOT EXISTS user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, plan_id)
);

-- Update profiles table to add admin role and plan tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_plan_id UUID REFERENCES plans(id) ON DELETE SET NULL;

-- Create requests table (for dream interpretation requests)
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  dreamer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interpreter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
  title TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create chat_messages table (for interpreter-dreamer communication)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'interpretation', 'inquiry', 'file')) DEFAULT 'text',
  file_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_logs table (for tracking admin actions)
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on new tables
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for plans (public read)
CREATE POLICY "Anyone can view active plans" ON plans
  FOR SELECT USING (is_active = true);

-- Create RLS policies for user_plans
CREATE POLICY "Users can view their own plans" ON user_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans" ON user_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for requests
CREATE POLICY "Users can view their requests" ON requests
  FOR SELECT USING (
    auth.uid() = dreamer_id OR 
    auth.uid() = interpreter_id OR
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true OR is_super_admin = true)
  );

CREATE POLICY "Dreamers can create requests" ON requests
  FOR INSERT WITH CHECK (auth.uid() = dreamer_id);

CREATE POLICY "Interpreters can update assigned requests" ON requests
  FOR UPDATE USING (auth.uid() = interpreter_id OR auth.uid() = dreamer_id);

-- Create RLS policies for chat_messages
CREATE POLICY "Users can view chat messages for their requests" ON chat_messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT dreamer_id FROM requests WHERE id = request_id
      UNION
      SELECT interpreter_id FROM requests WHERE id = request_id
    )
  );

CREATE POLICY "Users can send messages in their requests" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IN (
      SELECT dreamer_id FROM requests WHERE id = request_id
      UNION
      SELECT interpreter_id FROM requests WHERE id = request_id
    )
  );

-- Create RLS policies for admin_logs (admins only)
CREATE POLICY "Admins can view logs" ON admin_logs
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true OR is_super_admin = true)
  );

CREATE POLICY "Admins can create logs" ON admin_logs
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true OR is_super_admin = true)
  );

-- Insert default plans
INSERT INTO plans (name, description, price, duration_days, max_dreams, max_interpretations, features, is_active)
VALUES 
  ('مجاني', 'خطة مجانية للبدء', 0, 30, 3, 1, '["رؤية واحدة", "تفسير واحد"]'::jsonb, true),
  ('أساسي', 'خطة أساسية للمستخدمين العاديين', 9.99, 30, 10, 5, '["10 رؤى", "5 تفسيرات", "دعم البريد الإلكتروني"]'::jsonb, true),
  ('احترافي', 'خطة احترافية مع ميزات متقدمة', 29.99, 30, 50, 20, '["50 رؤية", "20 تفسير", "دعم الأولوية", "تحليلات متقدمة"]'::jsonb, true),
  ('مميز', 'خطة مميزة مع جميع الميزات', 99.99, 30, 999, 999, '["رؤى غير محدودة", "تفسيرات غير محدودة", "دعم 24/7", "تحليلات متقدمة", "تقارير شهرية"]'::jsonb, true)
ON CONFLICT (name) DO NOTHING;
