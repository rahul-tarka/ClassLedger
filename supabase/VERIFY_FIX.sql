-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify everything is working
-- ============================================

-- 1. Check if all helper functions exist
SELECT 
  routine_name as function_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'is_product_admin',
    'get_user_school_id',
    'is_admin',
    'is_principal',
    'is_admin_or_principal',
    'get_user_classes',
    'schools_exist',
    'teachers_exist'
  )
ORDER BY routine_name;

-- 2. Check if all RLS policies exist
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'product_admins',
    'schools',
    'teachers',
    'students',
    'attendance_log',
    'audit_log',
    'whatsapp_log',
    'correction_requests',
    'school_allowed_emails'
  )
ORDER BY tablename, policyname;

-- 3. Check if Product Admin exists
SELECT 
  email,
  name,
  active,
  created_at
FROM product_admins
WHERE active = true;

-- 4. Check if any schools exist (for onboarding check)
SELECT 
  COUNT(*) as school_count
FROM schools;

-- 5. Verify RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'product_admins',
    'schools',
    'teachers',
    'students',
    'attendance_log',
    'audit_log',
    'whatsapp_log',
    'correction_requests',
    'school_allowed_emails'
  )
ORDER BY tablename;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Verification queries completed!';
  RAISE NOTICE '📝 Check the results above to confirm everything is set up correctly.';
  RAISE NOTICE '🎉 If all functions and policies are listed, you are ready for production!';
END $$;

