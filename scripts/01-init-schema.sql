-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('dreamer', 'interpreter', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  is_available BOOLEAN DEFAULT true,
  total_interpretations INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create dreams table
CREATE TABLE IF NOT EXISTS dreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dreamer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interpreter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'pending_inquiry', 'pending_interpretation', 'interpreted', 'returned')),
  interpretation TEXT,
  notes TEXT,
  dream_date DATE,
  mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table for chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'interpretation', 'inquiry')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for dreams
CREATE POLICY "Dreamers can view their own dreams" ON dreams FOR SELECT USING (auth.uid() = dreamer_id OR auth.uid() = interpreter_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Dreamers can insert their own dreams" ON dreams FOR INSERT WITH CHECK (auth.uid() = dreamer_id);
CREATE POLICY "Dreamers can update their own dreams" ON dreams FOR UPDATE USING (auth.uid() = dreamer_id OR auth.uid() = interpreter_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Dreamers can delete their own dreams" ON dreams FOR DELETE USING (auth.uid() = dreamer_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages for their dreams" ON messages FOR SELECT USING (
  auth.uid() IN (
    SELECT dreamer_id FROM dreams WHERE id = dream_id
    UNION
    SELECT interpreter_id FROM dreams WHERE id = dream_id
  ) OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Users can insert messages for their dreams" ON messages FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT dreamer_id FROM dreams WHERE id = dream_id
    UNION
    SELECT interpreter_id FROM dreams WHERE id = dream_id
  )
);

-- RLS Policies for comments
CREATE POLICY "Users can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments on their dreams" ON comments FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT dreamer_id FROM dreams WHERE id = dream_id
    UNION
    SELECT interpreter_id FROM dreams WHERE id = dream_id
  ) OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Create indexes for performance
CREATE INDEX idx_dreams_dreamer_id ON dreams(dreamer_id);
CREATE INDEX idx_dreams_interpreter_id ON dreams(interpreter_id);
CREATE INDEX idx_dreams_status ON dreams(status);
CREATE INDEX idx_messages_dream_id ON messages(dream_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_comments_dream_id ON comments(dream_id);
