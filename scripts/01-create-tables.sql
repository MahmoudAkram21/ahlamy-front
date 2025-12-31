-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('dreamer', 'interpreter')) DEFAULT 'dreamer',
  avatar_url TEXT,
  bio TEXT,
  is_available BOOLEAN DEFAULT true,
  total_interpretations INTEGER DEFAULT 0,
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
  mood TEXT,
  dream_date DATE,
  status TEXT CHECK (status IN ('new', 'pending_inquiry', 'pending_interpretation', 'interpreted', 'returned')) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'interpretation', 'inquiry')) DEFAULT 'text',
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

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for dreams
CREATE POLICY "Users can view their own dreams" ON dreams FOR SELECT USING (
  auth.uid() = dreamer_id OR auth.uid() = interpreter_id OR auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'interpreter' AND is_available = true
  )
);
CREATE POLICY "Dreamers can insert dreams" ON dreams FOR INSERT WITH CHECK (auth.uid() = dreamer_id);
CREATE POLICY "Dreamers can update their own dreams" ON dreams FOR UPDATE USING (auth.uid() = dreamer_id);

-- Create RLS policies for messages
CREATE POLICY "Users can view messages for their dreams" ON messages FOR SELECT USING (
  auth.uid() IN (
    SELECT dreamer_id FROM dreams WHERE id = dream_id
    UNION
    SELECT interpreter_id FROM dreams WHERE id = dream_id
  )
);
CREATE POLICY "Users can insert messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Create RLS policies for comments
CREATE POLICY "Users can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
