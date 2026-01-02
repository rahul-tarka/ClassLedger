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

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS recursion fix applied successfully!';
  RAISE NOTICE '📝 Authentication should now work without infinite recursion.';
END $$;

