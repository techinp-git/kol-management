-- ==========================================
-- View auth.users table
-- ==========================================
-- Note: auth.users is a Supabase built-in table
-- You can query it but cannot modify it directly
-- ==========================================

-- View all users (with limited fields for security)
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  raw_user_meta_data,
  raw_app_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- View user count
SELECT COUNT(*) as total_users FROM auth.users;

-- View users with their profiles
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  p.full_name,
  p.role,
  p.account_id,
  p.kol_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- View specific user (replace with actual UUID)
-- SELECT * FROM auth.users WHERE id = 'user-uuid-here';

-- ==========================================
-- Note: 
-- - Password is stored as encrypted_password (hashed)
-- - You cannot see the actual password
-- - Password is managed by Supabase Auth system
-- ==========================================

