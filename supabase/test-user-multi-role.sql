-- ============================================
-- TEST USER - MULTIPLE ROLES SETUP
-- Add same email ID to multiple roles for testing
-- IMPORTANT: Email is PRIMARY KEY in teachers table
-- So same email can be: Product Admin + School Admin (different tables)
-- But same email CANNOT be both Admin and Teacher in SAME school
-- ============================================

-- ============================================
-- QUICK SETUP SCRIPT (Replace values)
-- ============================================

DO $$
DECLARE
    test_email VARCHAR := 'test@example.com';  -- ⚠️ CHANGE THIS to your email
    test_name VARCHAR := 'Test User';          -- ⚠️ CHANGE THIS
    school_id_val VARCHAR := 'SCH000001';      -- ⚠️ CHANGE THIS to your school_id
    school_id_2 VARCHAR := 'SCH000002';        -- ⚠️ Optional: Second school for testing
BEGIN
    -- Step 1: Add as Product Admin (can have multiple product admins)
    INSERT INTO product_admins (email, name, active)
    VALUES (test_email, test_name, true)
    ON CONFLICT (email) DO UPDATE SET active = true;
    
    RAISE NOTICE '✅ Added as Product Admin';
    
    -- Step 2: Add as School Admin in School 1 (can have multiple school admins per school)
    INSERT INTO teachers (email, school_id, name, role, class_assigned, phone, active)
    VALUES (
        test_email,
        school_id_val,
        test_name || ' (Admin)',
        'admin',
        ARRAY[]::TEXT[],
        NULL,
        true
    )
    ON CONFLICT (email) DO UPDATE SET 
        role = 'admin',
        school_id = school_id_val,
        active = true;
    
    RAISE NOTICE '✅ Added as School Admin in School %', school_id_val;
    
    -- Step 3: Add as Principal in same school (can have multiple principals per school)
    -- Note: Since email is PRIMARY KEY, we need to use a different approach
    -- Option: Add as principal in a different school OR change role manually
    
    -- Step 4: Add as Teacher in same school
    -- Note: This will replace the admin role since email is PRIMARY KEY
    -- To test teacher role, either:
    --   a) Change role manually: UPDATE teachers SET role = 'teacher' WHERE email = test_email;
    --   b) Use different school_id
    
    RAISE NOTICE '';
    RAISE NOTICE '📧 Email: %', test_email;
    RAISE NOTICE '🏫 School ID: %', school_id_val;
    RAISE NOTICE '';
    RAISE NOTICE '💡 IMPORTANT NOTES:';
    RAISE NOTICE '   1. Email is PRIMARY KEY in teachers table';
    RAISE NOTICE '   2. Same email = ONE role per school (admin OR teacher OR principal)';
    RAISE NOTICE '   3. BUT: Same email CAN be Product Admin + School Admin (different tables)';
    RAISE NOTICE '   4. Multiple admins/principals allowed per school (different emails)';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Login Priority:';
    RAISE NOTICE '   Product Admin > School Admin > Teacher/Principal';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 To Test Different Roles:';
    RAISE NOTICE '   1. Product Admin: Already added ✓';
    RAISE NOTICE '   2. School Admin: Already added ✓';
    RAISE NOTICE '   3. Teacher: Run: UPDATE teachers SET role = ''teacher'' WHERE email = ''%'';', test_email;
    RAISE NOTICE '   4. Principal: Run: UPDATE teachers SET role = ''principal'' WHERE email = ''%'';', test_email;
END $$;

-- ============================================
-- CHECK CURRENT ROLES
-- ============================================
-- Run this to see what roles your email has:
/*
SELECT 
    'Product Admin' as role_type,
    email,
    name,
    active,
    NULL as school_id,
    NULL as role
FROM product_admins 
WHERE email = 'test@example.com'  -- ⚠️ CHANGE THIS

UNION ALL

SELECT 
    'School User' as role_type,
    email,
    name,
    active,
    school_id,
    role
FROM teachers 
WHERE email = 'test@example.com'  -- ⚠️ CHANGE THIS

ORDER BY role_type, school_id;
*/

-- ============================================
-- MANUALLY SWITCH ROLES FOR TESTING
-- ============================================
-- To test as Teacher:
-- UPDATE teachers SET role = 'teacher', class_assigned = ARRAY['Class 1'] WHERE email = 'test@example.com';

-- To test as Principal:
-- UPDATE teachers SET role = 'principal', class_assigned = ARRAY[]::TEXT[] WHERE email = 'test@example.com';

-- To test as School Admin again:
-- UPDATE teachers SET role = 'admin', class_assigned = ARRAY[]::TEXT[] WHERE email = 'test@example.com';

