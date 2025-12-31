-- Update the role check constraint to allow 'admin' role
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('dreamer', 'interpreter', 'admin'));

-- Set the existing admin user as super admin
UPDATE profiles SET is_super_admin = true WHERE email = 'admin@mubasharat.com';
