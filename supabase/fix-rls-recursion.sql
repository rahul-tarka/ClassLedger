-- Fix: Infinite Recursion in RLS Policy for product_admins
-- This script fixes the RLS policy that causes infinite recursion

-- Step 1: Create a SECURITY DEFINER function to check product admin status
-- This function bypasses RLS for authentication checks
CREATE OR REPLACE FUNCTION is_product_admin(check_email VARCHAR)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM product_admins 
    WHERE email = check_email AND active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Step 2: Drop the old recursive policy
DROP POLICY IF EXISTS "Product admins can view all" ON product_admins;

-- Step 3: Create new policy - allow users to check their own status (for login)
-- This is the most important one for authentication
CREATE POLICY "Users can check own product admin status" ON product_admins
  FOR SELECT
  USING (
    email = auth.jwt() ->> 'email'
  );

-- Step 4: Create policy for product admins to view all (using function to avoid recursion)
CREATE POLICY "Product admins can view all" ON product_admins
  FOR SELECT
  USING (
    is_product_admin(auth.jwt() ->> 'email')
  );

-- Step 5: Update other policies that check product_admins to use the function
DROP POLICY IF EXISTS "Users can view their school" ON schools;
CREATE POLICY "Users can view their school" ON schools
  FOR SELECT
  USING (
    is_product_admin(auth.jwt() ->> 'email')
    OR school_id IN (
      SELECT school_id FROM teachers 
      WHERE email = auth.jwt() ->> 'email' AND active = true
    )
  );

DROP POLICY IF EXISTS "Product admins can manage schools" ON schools;
CREATE POLICY "Product admins can manage schools" ON schools
  FOR ALL
  USING (
    is_product_admin(auth.jwt() ->> 'email')
  );

-- Step 6: Fix teachers table recursion
-- The issue: schools policy checks teachers, teachers policy checks teachers (recursion)
-- Solution: Use SECURITY DEFINER function to get user's school_id

-- Create function to get user's school_id (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS VARCHAR(50) AS $$
  SELECT school_id FROM teachers 
  WHERE email = auth.jwt() ->> 'email' 
  AND active = true 
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Update schools policy to use function instead of direct query
DROP POLICY IF EXISTS "Users can view their school" ON schools;
CREATE POLICY "Users can view their school" ON schools
  FOR SELECT
  USING (
    is_product_admin(auth.jwt() ->> 'email')
    OR school_id = get_user_school_id()
  );

-- Update teachers policy to allow users to check their own record
DROP POLICY IF EXISTS "Users can view teachers in their school" ON teachers;
CREATE POLICY "Users can view teachers in their school" ON teachers
  FOR SELECT
  USING (
    email = auth.jwt() ->> 'email'  -- Users can see their own record
    OR school_id = get_user_school_id()  -- Users can see teachers in their school
    OR NOT EXISTS (SELECT 1 FROM teachers) -- Allow first teacher creation
  );

-- Update teachers admin policy to use function
DROP POLICY IF EXISTS "Admin can manage teachers" ON teachers;
CREATE POLICY "Admin can manage teachers" ON teachers
  FOR ALL
  USING (
    is_admin()  -- Use existing function
    OR NOT EXISTS (SELECT 1 FROM teachers) -- Allow first admin creation
  );

-- Update students policy to use function
DROP POLICY IF EXISTS "Teachers can view students in their classes" ON students;
CREATE POLICY "Teachers can view students in their classes" ON students
  FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND (
      EXISTS (
        SELECT 1 FROM teachers t
        WHERE t.email = auth.jwt() ->> 'email'
        AND students.class = ANY(t.class_assigned)
      )
      OR is_admin()  -- Use function instead of direct query
      OR EXISTS (
        SELECT 1 FROM teachers 
        WHERE email = auth.jwt() ->> 'email' 
        AND role = 'principal' AND active = true
      )
    )
  );

-- Update attendance policies to use functions
DROP POLICY IF EXISTS "Users can view attendance" ON attendance_log;
CREATE POLICY "Users can view attendance" ON attendance_log
  FOR SELECT
  USING (
    school_id = get_user_school_id()
  );

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS recursion fix applied successfully!';
  RAISE NOTICE '📝 Authentication and dashboard should now work without infinite recursion.';
END $$;

