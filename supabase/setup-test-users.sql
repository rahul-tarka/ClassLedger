-- ============================================
-- SETUP TEST USERS FOR CLASSLEDGER
-- Product Admin: tarka@gmail.com
-- School Admin: mail.rahul.rathod@gmail.com
-- ============================================
-- IMPORTANT: Product Admin has NO connection to schools
-- - Product Admin is for product owner only
-- - Product Admin can manage ALL schools (multi-tenant)
-- - Product Admin does NOT have school_id
-- - School Admin is school-specific and has school_id
-- ============================================

DO $$
DECLARE
    product_admin_email VARCHAR := 'tarka.org@gmail.com';
    product_admin_name VARCHAR := 'Product Admin';
    
    school_admin_email VARCHAR := 'mail.rahul.rathod@gmail.com';
    school_admin_name VARCHAR := 'School Admin';
    
    school_id_val VARCHAR := 'SCH000001';  -- ⚠️ CHANGE THIS to your actual school_id if different
    
    product_admin_exists BOOLEAN := false;
    school_admin_exists BOOLEAN := false;
BEGIN
    -- Step 1: Check if Product Admin already exists
    SELECT EXISTS(
        SELECT 1 FROM product_admins WHERE email = product_admin_email
    ) INTO product_admin_exists;
    
    IF product_admin_exists THEN
        RAISE NOTICE '⚠️ Product Admin already exists: % - Skipping (not updated)', product_admin_email;
    ELSE
        -- Add Product Admin
        INSERT INTO product_admins (email, name, active)
        VALUES (product_admin_email, product_admin_name, true);
        
        RAISE NOTICE '✅ Added Product Admin: % (%)', product_admin_email, product_admin_name;
    END IF;
    
    -- Step 2: Check if School Admin already exists
    SELECT EXISTS(
        SELECT 1 FROM teachers WHERE email = school_admin_email
    ) INTO school_admin_exists;
    
    IF school_admin_exists THEN
        RAISE NOTICE '⚠️ School Admin already exists: % - Skipping (not updated)', school_admin_email;
    ELSE
        -- Check if school exists
        IF NOT EXISTS(SELECT 1 FROM schools WHERE school_id = school_id_val) THEN
            RAISE NOTICE '❌ School % does not exist! Please create school first or update school_id_val', school_id_val;
        ELSE
            -- Add School Admin
            INSERT INTO teachers (email, school_id, name, role, class_assigned, phone, active)
            VALUES (
                school_admin_email,
                school_id_val,
                school_admin_name,
                'admin',
                ARRAY[]::TEXT[],
                NULL,
                true
            );
            
            RAISE NOTICE '✅ Added School Admin: % (%) in School %', school_admin_email, school_admin_name, school_id_val;
        END IF;
    END IF;
    
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
    RAISE NOTICE '💡 IMPORTANT NOTES:';
    RAISE NOTICE '   - Product Admin is COMPLETELY INDEPENDENT of schools';
    RAISE NOTICE '   - Product Admin can manage ALL schools (multi-tenant)';
    RAISE NOTICE '   - Product Admin has NO school_id (not linked to any school)';
    RAISE NOTICE '   - School Admin is school-specific and has school_id';
    RAISE NOTICE '   - Product Admin dashboard: product-admin-dashboard.html';
    RAISE NOTICE '   - School Admin dashboard: admin-dashboard.html';
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
WHERE email = 'tarka.org@gmail.com'

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

