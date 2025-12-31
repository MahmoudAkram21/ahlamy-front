-- Add is_super_admin column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Create admin account (you'll need to sign up first, then run this to make them admin)
-- UPDATE profiles SET is_super_admin = true WHERE email = 'admin@mubasharat.com';
