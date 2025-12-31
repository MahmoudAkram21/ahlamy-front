-- Disable RLS on profiles table to allow profile creation during signup
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to view all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Disable RLS on other tables as well for testing
ALTER TABLE dreams DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- Drop policies from other tables
DROP POLICY IF EXISTS "Users can view their own dreams" ON dreams;
DROP POLICY IF EXISTS "Dreamers can insert dreams" ON dreams;
DROP POLICY IF EXISTS "Dreamers can update their own dreams" ON dreams;
DROP POLICY IF EXISTS "Users can view messages for their dreams" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
