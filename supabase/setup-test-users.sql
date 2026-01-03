-- ============================================
-- SETUP TEST USERS FOR CLASSLEDGER
-- Product Admin: tarka@gmail.com
-- School Admin: mail.rahul.rathod@gmail.com
-- ============================================

DO $$
DECLARE
    product_admin_email VARCHAR := 'tarka@gmail.com';
    product_admin_name VARCHAR := 'Rahul Rathod';
    
    school_admin_email VARCHAR := 'mail.rahul.rathod@gmail.com';
    school_admin_name VARCHAR := 'School Admin';
    
    school_id_val VARCHAR := 'SCH000001';  -- ⚠️ CHANGE THIS to your actual school_id if different
BEGIN
    -- Step 1: Add Product Admin
    INSERT INTO product_admins (email, name, active)
    VALUES (product_admin_email, product_admin_name, true)
    ON CONFLICT (email) DO UPDATE SET 
        name = product_admin_name,
        active = true;
    
    RAISE NOTICE '✅ Added Product Admin: % (%)', product_admin_email, product_admin_name;
    
    -- Step 2: Add School Admin
    -- First, check if school exists, if not we'll need to create it
    -- For now, assuming school_id_val exists
    
    INSERT INTO teachers (email, school_id, name, role, class_assigned, phone, active)
    VALUES (
        school_admin_email,
        school_id_val,
        school_admin_name,
        'admin',
        ARRAY[]::TEXT[],
        NULL,
        true
    )
    ON CONFLICT (email) DO UPDATE SET 
        name = school_admin_name,
        role = 'admin',
        school_id = school_id_val,
        active = true;
    
    RAISE NOTICE '✅ Added School Admin: % (%) in School %', school_admin_email, school_admin_name, school_id_val;
    
    RAISE NOTICE '';
    RAISE NOTICE '📋 SETUP COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE '👤 Product Admin:';
    RAISE NOTICE '   Email: %', product_admin_email;
    RAISE NOTICE '   Name: %', product_admin_name;
    RAISE NOTICE '   Dashboard: product-admin-dashboard.html';
    RAISE NOTICE '';
    RAISE NOTICE '👤 School Admin:';
    RAISE NOTICE '   Email: %', school_admin_email;
    RAISE NOTICE '   Name: %', school_admin_name;
    RAISE NOTICE '   School ID: %', school_id_val;
    RAISE NOTICE '   Dashboard: admin-dashboard.html';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Login Priority:';
    RAISE NOTICE '   Product Admin > School Admin > Teacher/Principal';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Note:';
    RAISE NOTICE '   - Product Admin can access product-admin-dashboard.html';
    RAISE NOTICE '   - School Admin can access admin-dashboard.html';
    RAISE NOTICE '   - Both can login with Google OAuth using their respective emails';
    RAISE NOTICE '   - Make sure school_id_val (%) exists in schools table', school_id_val;
END $$;

-- ============================================
-- VERIFY USERS WERE CREATED
-- ============================================
-- Run this to verify:

SELECT 
    'Product Admin' as role_type,
    email,
    name,
    active,
    NULL as school_id,
    NULL as role
FROM product_admins 
WHERE email = 'tarka@gmail.com'

UNION ALL

SELECT 
    'School Admin' as role_type,
    email,
    name,
    active,
    school_id,
    role
FROM teachers 
WHERE email = 'mail.rahul.rathod@gmail.com'

ORDER BY role_type;

