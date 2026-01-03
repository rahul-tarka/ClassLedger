-- ============================================
-- DUMMY DATA GENERATOR FOR CLASSLEDGER
-- Generates 500+ rows for each table with all combinations
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. PRODUCT ADMINS (5 rows)
-- ============================================
INSERT INTO product_admins (email, name, active) VALUES
('admin1@tarka.com', 'Vandana Rathod', true),
('admin2@tarka.com', 'Rahul Rathod', true),
('admin3@tarka.com', 'Product Admin 3', true),
('admin4@tarka.com', 'Product Admin 4', true),
('admin5@tarka.com', 'Product Admin 5', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. SCHOOLS (20 schools)
-- ============================================
DO $$
DECLARE
    i INTEGER;
    school_id_val VARCHAR(50);
    school_names TEXT[] := ARRAY[
        'Delhi Public School', 'Modern School', 'Kendriya Vidyalaya', 'D.A.V. Public School',
        'St. Mary''s School', 'Ryan International School', 'Amity International School',
        'The Doon School', 'La Martiniere', 'St. Xavier''s School', 'Vidya Mandir',
        'Bharatiya Vidya Bhavan', 'Sanskriti School', 'The Heritage School',
        'Pathways School', 'Shri Ram School', 'Vasant Valley School', 'Bluebells School',
        'Tagore International School', 'Lotus Valley International School'
    ];
    addresses TEXT[] := ARRAY[
        '123 Education Street, New Delhi', '456 Learning Avenue, Mumbai', '789 Knowledge Road, Bangalore',
        '321 Wisdom Lane, Chennai', '654 Scholar Drive, Kolkata', '987 Study Circle, Hyderabad',
        '147 Academy Way, Pune', '258 Campus Road, Ahmedabad', '369 Institute Street, Jaipur',
        '741 College Avenue, Lucknow', '852 University Road, Chandigarh', '963 School Lane, Bhopal',
        '159 Education Park, Indore', '357 Learning Hub, Nagpur', '468 Knowledge Center, Surat',
        '579 Wisdom Square, Vadodara', '680 Scholar Plaza, Coimbatore', '791 Study Point, Visakhapatnam',
        '802 Academy Center, Patna', '913 Campus Square, Ludhiana'
    ];
    phones TEXT[] := ARRAY[
        '011-12345678', '022-23456789', '080-34567890', '044-45678901', '033-56789012',
        '040-67890123', '020-78901234', '079-89012345', '0141-90123456', '0522-01234567',
        '0172-12345678', '0755-23456789', '0731-34567890', '0712-45678901', '0713-56789012',
        '0261-67890123', '0422-78901234', '0891-89012345', '0612-90123456', '0161-01234567'
    ];
BEGIN
    FOR i IN 1..20 LOOP
        school_id_val := 'SCH' || LPAD(i::TEXT, 6, '0');
        INSERT INTO schools (school_id, school_name, address, phone, email, product_admin_email, active)
        VALUES (
            school_id_val,
            school_names[i],
            addresses[i],
            phones[i],
            'info@' || LOWER(REPLACE(school_names[i], ' ', '')) || '.com',
            'admin1@tarka.com',
            CASE WHEN i <= 18 THEN true ELSE false END
        ) ON CONFLICT (school_id) DO NOTHING;
    END LOOP;
END $$;

-- ============================================
-- 3. TEACHERS (500+ rows - all combinations)
-- ============================================
DO $$
DECLARE
    i INTEGER;
    j INTEGER;
    teacher_email VARCHAR(255);
    teacher_name TEXT;
    school_id_val VARCHAR(50);
    role_val VARCHAR(50);
    class_assigned_val TEXT[];
    roles TEXT[] := ARRAY['teacher', 'admin', 'principal'];
    first_names TEXT[] := ARRAY[
        'Raj', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rohit', 'Kavita', 'Suresh', 'Meera',
        'Arjun', 'Divya', 'Karan', 'Pooja', 'Manish', 'Ritu', 'Nikhil', 'Shreya', 'Aman', 'Neha',
        'Vivek', 'Swati', 'Gaurav', 'Richa', 'Harsh', 'Anita', 'Ravi', 'Sunita', 'Deepak', 'Kiran',
        'Sandeep', 'Monika', 'Ajay', 'Rekha', 'Pankaj', 'Jyoti', 'Manoj', 'Sarita', 'Vinod', 'Lata'
    ];
    last_names TEXT[] := ARRAY[
        'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Yadav', 'Jain', 'Shah', 'Mehta',
        'Reddy', 'Rao', 'Nair', 'Iyer', 'Menon', 'Pillai', 'Nair', 'Krishnan', 'Subramanian', 'Venkatesh'
    ];
    classes TEXT[] := ARRAY['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
BEGIN
    -- Generate teachers for each school
    FOR i IN 1..20 LOOP
        school_id_val := 'SCH' || LPAD(i::TEXT, 6, '0');
        
        -- 1 Principal per school
        teacher_name := first_names[1 + ((i - 1) % array_length(first_names, 1))] || ' ' || last_names[1 + ((i - 1) % array_length(last_names, 1))];
        teacher_email := LOWER(REPLACE(teacher_name, ' ', '.')) || '.principal' || i || '@school' || i || '.com';
        -- Ensure email is not null
        IF teacher_email IS NULL OR teacher_name IS NULL THEN
            teacher_name := 'Principal ' || i;
            teacher_email := 'principal' || i || '@school' || i || '.com';
        END IF;
        INSERT INTO teachers (email, school_id, name, role, class_assigned, phone, active)
        VALUES (
            teacher_email,
            school_id_val,
            teacher_name || ' (Principal)',
            'principal',
            ARRAY[]::TEXT[],
            '9' || LPAD((i * 1000000 + 1)::TEXT, 9, '0'),
            true
        ) ON CONFLICT (email) DO NOTHING;
        
        -- 1 Admin per school
        teacher_name := first_names[1 + (i % array_length(first_names, 1))] || ' ' || last_names[1 + (i % array_length(last_names, 1))];
        teacher_email := LOWER(REPLACE(teacher_name, ' ', '.')) || '.admin' || i || '@school' || i || '.com';
        -- Ensure email is not null
        IF teacher_email IS NULL OR teacher_name IS NULL THEN
            teacher_name := 'Admin ' || i;
            teacher_email := 'admin' || i || '@school' || i || '.com';
        END IF;
        INSERT INTO teachers (email, school_id, name, role, class_assigned, phone, active)
        VALUES (
            teacher_email,
            school_id_val,
            teacher_name || ' (Admin)',
            'admin',
            ARRAY[]::TEXT[],
            '9' || LPAD((i * 1000000 + 2)::TEXT, 9, '0'),
            true
        ) ON CONFLICT (email) DO NOTHING;
        
        -- 20-25 Teachers per school (500 total)
        FOR j IN 1..25 LOOP
            teacher_name := first_names[1 + ((i * 25 + j - 1) % array_length(first_names, 1))] || ' ' || 
                           last_names[1 + ((i * 25 + j - 1) % array_length(last_names, 1))];
            teacher_email := LOWER(REPLACE(teacher_name, ' ', '.')) || j || '@school' || i || '.com';
            
            -- Ensure email and name are not null
            IF teacher_email IS NULL OR teacher_name IS NULL THEN
                teacher_name := 'Teacher ' || i || '-' || j;
                teacher_email := 'teacher' || i || '_' || j || '@school' || i || '.com';
            END IF;
            
            -- Assign 1-3 random classes
            class_assigned_val := ARRAY(
                SELECT classes[1 + floor(random() * array_length(classes, 1))::int]
                FROM generate_series(1, 1 + floor(random() * 2)::int)
            );
            
            INSERT INTO teachers (email, school_id, name, role, class_assigned, phone, active)
            VALUES (
                teacher_email,
                school_id_val,
                teacher_name,
                'teacher',
                class_assigned_val,
                '9' || LPAD((i * 1000000 + j + 10)::TEXT, 9, '0'),
                CASE WHEN j <= 23 THEN true ELSE false END
            ) ON CONFLICT (email) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- ============================================
-- 4. STUDENTS (500+ rows - all combinations)
-- ============================================
DO $$
DECLARE
    i INTEGER;
    j INTEGER;
    k INTEGER;
    student_id_val VARCHAR(50);
    student_name TEXT;
    school_id_val VARCHAR(50);
    class_val VARCHAR(50);
    section_val VARCHAR(10);
    roll_val INTEGER;
    first_names TEXT[] := ARRAY[
        'Aarav', 'Aanya', 'Arjun', 'Ananya', 'Advik', 'Aadhya', 'Aryan', 'Avni', 'Atharv', 'Anika',
        'Dhruv', 'Diya', 'Dev', 'Disha', 'Darsh', 'Divya', 'Daksh', 'Dia', 'Dhanush', 'Disha',
        'Ishaan', 'Isha', 'Ishan', 'Ira', 'Ivan', 'Ishita', 'Ishant', 'Ishika', 'Ishwar', 'Ishani',
        'Krish', 'Kriti', 'Kabir', 'Kavya', 'Karan', 'Kashvi', 'Krishna', 'Kiara', 'Kunal', 'Kavya',
        'Reyansh', 'Riya', 'Rohan', 'Ridhi', 'Rudra', 'Ritika', 'Raghav', 'Riya', 'Rishabh', 'Riya',
        'Vihaan', 'Vanya', 'Ved', 'Vidhi', 'Vivaan', 'Vidya', 'Vikram', 'Vidya', 'Vishal', 'Vidya',
        'Yash', 'Yashvi', 'Yuvraj', 'Yashika', 'Yashas', 'Yashika', 'Yashwant', 'Yashika', 'Yash', 'Yashika'
    ];
    last_names TEXT[] := ARRAY[
        'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Yadav', 'Jain', 'Shah', 'Mehta',
        'Reddy', 'Rao', 'Nair', 'Iyer', 'Menon', 'Pillai', 'Nair', 'Krishnan', 'Subramanian', 'Venkatesh'
    ];
    classes TEXT[] := ARRAY['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
    sections TEXT[] := ARRAY['A', 'B', 'C', 'D', 'E'];
    parent_names TEXT[] := ARRAY[
        'Mr. & Mrs. Sharma', 'Mr. & Mrs. Verma', 'Mr. & Mrs. Gupta', 'Mr. & Mrs. Singh', 'Mr. & Mrs. Kumar',
        'Mr. & Mrs. Patel', 'Mr. & Mrs. Yadav', 'Mr. & Mrs. Jain', 'Mr. & Mrs. Shah', 'Mr. & Mrs. Mehta'
    ];
BEGIN
    -- Generate students for each school
    FOR i IN 1..20 LOOP
        school_id_val := 'SCH' || LPAD(i::TEXT, 6, '0');
        
        -- For each class
        FOR j IN 1..10 LOOP
            class_val := classes[j];
            
            -- For each section
            FOR k IN 1..5 LOOP
                section_val := sections[k];
                
                -- 5-6 students per section (500+ total)
                FOR roll_val IN 1..6 LOOP
                    student_id_val := 'STU' || LPAD((i * 1000 + j * 100 + k * 10 + roll_val)::TEXT, 10, '0');
                    student_name := first_names[1 + ((i * 100 + j * 10 + k * 5 + roll_val) % array_length(first_names, 1))] || ' ' || 
                                   last_names[1 + ((i * 100 + j * 10 + k * 5 + roll_val) % array_length(last_names, 1))];
                    
                    INSERT INTO students (
                        student_id, school_id, name, class, section, roll,
                        parent_name, parent_mobile, whatsapp_alert_enabled, active
                    )
                    VALUES (
                        student_id_val,
                        school_id_val,
                        student_name,
                        class_val,
                        section_val,
                        roll_val,
                        parent_names[1 + ((i * 100 + j * 10 + k * 5 + roll_val) % array_length(parent_names, 1))],
                        '9' || LPAD((i * 10000000 + j * 1000000 + k * 100000 + roll_val * 10000)::TEXT, 10, '0'),
                        CASE WHEN roll_val % 2 = 0 THEN true ELSE false END,
                        CASE WHEN roll_val <= 5 THEN true ELSE false END
                    ) ON CONFLICT (student_id) DO NOTHING;
                END LOOP;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- ============================================
-- 5. ATTENDANCE LOG (500+ rows - all combinations)
-- ============================================
DO $$
DECLARE
    i INTEGER;
    log_id_val VARCHAR(100);
    student_rec RECORD;
    date_val DATE;
    time_val TIME;
    status_val VARCHAR(1);
    type_val VARCHAR(20);
    teacher_email_val VARCHAR(255);
    days TEXT[] := ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    statuses TEXT[] := ARRAY['P', 'A', 'L'];
BEGIN
    -- Generate attendance for last 30 days
    FOR i IN 0..29 LOOP
        date_val := CURRENT_DATE - i;
        
        -- Skip weekends (Saturday and Sunday)
        IF EXTRACT(DOW FROM date_val) IN (0, 6) THEN
            CONTINUE;
        END IF;
        
        -- For each student
        FOR student_rec IN 
            SELECT s.student_id, s.school_id, s.class, s.section, s.roll
            FROM students s
            WHERE s.active = true
            LIMIT 500
        LOOP
            -- Random status (70% Present, 20% Absent, 10% Late)
            status_val := CASE 
                WHEN random() < 0.7 THEN 'P'
                WHEN random() < 0.9 THEN 'A'
                ELSE 'L'
            END;
            
            -- CHECK_IN (morning 8:00-9:30)
            IF status_val != 'A' THEN
                time_val := '08:00:00'::TIME + (random() * INTERVAL '90 minutes');
                log_id_val := 'LOG' || TO_CHAR(date_val, 'YYYYMMDD') || LPAD((i * 1000 + student_rec.roll)::TEXT, 6, '0') || '1';
                
                -- Get a teacher for this class (with proper type casting)
                SELECT email INTO teacher_email_val
                FROM teachers
                WHERE school_id = student_rec.school_id
                  AND (
                    class_assigned @> ARRAY[student_rec.class::TEXT]::TEXT[] 
                    OR class_assigned = ARRAY[]::TEXT[]
                    OR array_length(class_assigned, 1) IS NULL
                  )
                  AND role = 'teacher'
                  AND active = true
                ORDER BY random()
                LIMIT 1;
                
                -- Fallback: Get any teacher from the school if no class-specific teacher found
                IF teacher_email_val IS NULL THEN
                    SELECT email INTO teacher_email_val
                    FROM teachers
                    WHERE school_id = student_rec.school_id
                      AND role IN ('teacher', 'admin')
                      AND active = true
                    ORDER BY random()
                    LIMIT 1;
                END IF;
                
                -- Final fallback: Use admin email
                IF teacher_email_val IS NULL THEN
                    SELECT email INTO teacher_email_val
                    FROM teachers
                    WHERE school_id = student_rec.school_id
                      AND role = 'admin'
                      AND active = true
                    LIMIT 1;
                END IF;
                
                -- Get day name (DOW returns 0-6, Sunday=0, Monday=1, etc.)
                -- Array is 1-indexed, so add 1 to DOW (0 becomes 1 for Sunday)
                day_index := EXTRACT(DOW FROM date_val) + 1;
                IF day_index > 7 THEN day_index := 1; END IF;
                day_name := days[day_index];
                
                INSERT INTO attendance_log (
                    log_id, date, time, student_id, school_id, class,
                    status, type, teacher_email, day, remark
                )
                VALUES (
                    log_id_val,
                    date_val,
                    time_val,
                    student_rec.student_id,
                    student_rec.school_id,
                    student_rec.class,
                    status_val,
                    'CHECK_IN',
                    teacher_email_val,
                    day_name,
                    CASE WHEN status_val = 'L' THEN 'Late arrival' ELSE NULL END
                ) ON CONFLICT (log_id) DO NOTHING;
            END IF;
            
            -- CHECK_OUT (afternoon 2:00-4:00) - only if checked in
            IF status_val = 'P' AND random() > 0.1 THEN
                time_val := '14:00:00'::TIME + (random() * INTERVAL '120 minutes');
                log_id_val := 'LOG' || TO_CHAR(date_val, 'YYYYMMDD') || LPAD((i * 1000 + student_rec.roll)::TEXT, 6, '0') || '2';
                
                -- Use same teacher_email_val from CHECK_IN or get a new one
                IF teacher_email_val IS NULL THEN
                    SELECT email INTO teacher_email_val
                    FROM teachers
                    WHERE school_id = student_rec.school_id
                      AND role IN ('teacher', 'admin')
                      AND active = true
                    ORDER BY random()
                    LIMIT 1;
                END IF;
                
                -- Get day name
                day_index := EXTRACT(DOW FROM date_val) + 1;
                IF day_index > 7 THEN day_index := 1; END IF;
                day_name := days[day_index];
                
                INSERT INTO attendance_log (
                    log_id, date, time, student_id, school_id, class,
                    status, type, teacher_email, day, remark
                )
                VALUES (
                    log_id_val,
                    date_val,
                    time_val,
                    student_rec.student_id,
                    student_rec.school_id,
                    student_rec.class,
                    NULL,
                    'CHECK_OUT',
                    teacher_email_val,
                    day_name,
                    NULL
                ) ON CONFLICT (log_id) DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- ============================================
-- 6. AUDIT LOG (500+ rows)
-- ============================================
DO $$
DECLARE
    i INTEGER;
    user_email_val VARCHAR(255);
    action_val VARCHAR(100);
    actions TEXT[] := ARRAY[
        'LOGIN', 'LOGOUT', 'MARK_ATTENDANCE', 'EDIT_ATTENDANCE', 'VIEW_REPORT',
        'EXPORT_DATA', 'ADD_STUDENT', 'UPDATE_STUDENT', 'DELETE_STUDENT',
        'ADD_TEACHER', 'UPDATE_TEACHER', 'DELETE_TEACHER', 'VIEW_DASHBOARD'
    ];
    details_val JSONB;
BEGIN
    FOR i IN 1..500 LOOP
        -- Get random teacher email
        SELECT email INTO user_email_val
        FROM teachers
        WHERE active = true
        ORDER BY random()
        LIMIT 1;
        
        action_val := actions[1 + floor(random() * array_length(actions, 1))::int];
        
        details_val := jsonb_build_object(
            'action_type', action_val,
            'timestamp', NOW() - (random() * INTERVAL '30 days'),
            'ip_address', '192.168.1.' || (floor(random() * 255)::int),
            'user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        );
        
        INSERT INTO audit_log (timestamp, user_email, action, details, ip_address, user_agent)
        VALUES (
            NOW() - (random() * INTERVAL '30 days'),
            user_email_val,
            action_val,
            details_val,
            '192.168.1.' || (floor(random() * 255)::int),
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        );
    END LOOP;
END $$;

-- ============================================
-- 7. WHATSAPP LOG (500+ rows)
-- ============================================
DO $$
DECLARE
    i INTEGER;
    student_rec RECORD;
    date_val DATE;
    status_val VARCHAR(50);
    statuses TEXT[] := ARRAY['sent', 'failed', 'skipped'];
BEGIN
    FOR i IN 1..500 LOOP
        -- Get random student with WhatsApp enabled
        SELECT s.student_id, s.parent_mobile
        INTO student_rec
        FROM students s
        WHERE s.whatsapp_alert_enabled = true
          AND s.active = true
        ORDER BY random()
        LIMIT 1;
        
        date_val := CURRENT_DATE - (floor(random() * 30)::int);
        status_val := statuses[1 + floor(random() * array_length(statuses, 1))::int];
        
        INSERT INTO whatsapp_log (
            student_id, parent_mobile, date, status, response, error_message, sent_at
        )
        VALUES (
            student_rec.student_id,
            student_rec.parent_mobile,
            date_val,
            status_val,
            CASE WHEN status_val = 'sent' THEN '{"status": "delivered"}'::jsonb ELSE NULL END,
            CASE WHEN status_val = 'failed' THEN 'Network error' ELSE NULL END,
            NOW() - (random() * INTERVAL '30 days')
        );
    END LOOP;
END $$;

-- ============================================
-- 8. SCHOOL ALLOWED EMAILS (500+ rows)
-- ============================================
DO $$
DECLARE
    i INTEGER;
    school_rec RECORD;
    email_pattern_val VARCHAR(255);
    type_val VARCHAR(20);
    teacher_email_val VARCHAR(255);
BEGIN
    FOR i IN 1..500 LOOP
        -- Get random school
        SELECT school_id INTO school_rec
        FROM schools
        WHERE active = true
        ORDER BY random()
        LIMIT 1;
        
        -- Get random teacher from this school
        SELECT email INTO teacher_email_val
        FROM teachers
        WHERE school_id = school_rec.school_id
          AND role = 'admin'
        ORDER BY random()
        LIMIT 1;
        
        -- 50% specific email, 50% domain
        IF random() > 0.5 THEN
            email_pattern_val := 'teacher' || i || '@school' || (floor(random() * 20)::int + 1) || '.com';
            type_val := 'email';
        ELSE
            email_pattern_val := '@school' || (floor(random() * 20)::int + 1) || '.com';
            type_val := 'domain';
        END IF;
        
        INSERT INTO school_allowed_emails (
            school_id, email_pattern, type, active, created_by
        )
        VALUES (
            school_rec.school_id,
            email_pattern_val,
            type_val,
            CASE WHEN i <= 450 THEN true ELSE false END,
            teacher_email_val
        ) ON CONFLICT (school_id, email_pattern) DO NOTHING;
    END LOOP;
END $$;

-- ============================================
-- 9. CORRECTION REQUESTS (500+ rows)
-- ============================================
DO $$
DECLARE
    i INTEGER;
    student_rec RECORD;
    date_val DATE;
    current_status_val VARCHAR(1);
    requested_status_val VARCHAR(1);
    status_val VARCHAR(20);
    teacher_email_val VARCHAR(255);
    statuses TEXT[] := ARRAY['pending', 'approved', 'rejected'];
    attendance_statuses TEXT[] := ARRAY['P', 'A', 'L'];
BEGIN
    FOR i IN 1..500 LOOP
        -- Get random student
        SELECT s.student_id INTO student_rec
        FROM students s
        WHERE s.active = true
        ORDER BY random()
        LIMIT 1;
        
        -- Get random teacher
        SELECT email INTO teacher_email_val
        FROM teachers
        WHERE active = true
        ORDER BY random()
        LIMIT 1;
        
        date_val := CURRENT_DATE - (floor(random() * 30)::int);
        current_status_val := attendance_statuses[1 + floor(random() * array_length(attendance_statuses, 1))::int];
        
        -- Requested status should be different
        requested_status_val := attendance_statuses[1 + floor(random() * array_length(attendance_statuses, 1))::int];
        WHILE requested_status_val = current_status_val LOOP
            requested_status_val := attendance_statuses[1 + floor(random() * array_length(attendance_statuses, 1))::int];
        END LOOP;
        
        status_val := statuses[1 + floor(random() * array_length(statuses, 1))::int];
        
        INSERT INTO correction_requests (
            student_id, date, current_status, requested_status, reason,
            status, requested_by, reviewed_by, reviewed_at
        )
        VALUES (
            student_rec.student_id,
            date_val,
            current_status_val,
            requested_status_val,
            'Requested correction: ' || current_status_val || ' to ' || requested_status_val,
            status_val,
            'student' || i || '@example.com',
            CASE WHEN status_val != 'pending' THEN teacher_email_val ELSE NULL END,
            CASE WHEN status_val != 'pending' THEN NOW() - (random() * INTERVAL '20 days') ELSE NULL END
        );
    END LOOP;
END $$;

-- ============================================
-- VERIFICATION - Count rows in each table
-- ============================================
DO $$
DECLARE
    product_admins_count INTEGER;
    schools_count INTEGER;
    teachers_count INTEGER;
    students_count INTEGER;
    attendance_log_count INTEGER;
    audit_log_count INTEGER;
    whatsapp_log_count INTEGER;
    school_allowed_emails_count INTEGER;
    correction_requests_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_admins_count FROM product_admins;
    SELECT COUNT(*) INTO schools_count FROM schools;
    SELECT COUNT(*) INTO teachers_count FROM teachers;
    SELECT COUNT(*) INTO students_count FROM students;
    SELECT COUNT(*) INTO attendance_log_count FROM attendance_log;
    SELECT COUNT(*) INTO audit_log_count FROM audit_log;
    SELECT COUNT(*) INTO whatsapp_log_count FROM whatsapp_log;
    SELECT COUNT(*) INTO school_allowed_emails_count FROM school_allowed_emails;
    SELECT COUNT(*) INTO correction_requests_count FROM correction_requests;
    
    RAISE NOTICE '✅ DUMMY DATA GENERATION COMPLETE!';
    RAISE NOTICE '📊 Product Admins: %', product_admins_count;
    RAISE NOTICE '📊 Schools: %', schools_count;
    RAISE NOTICE '📊 Teachers: %', teachers_count;
    RAISE NOTICE '📊 Students: %', students_count;
    RAISE NOTICE '📊 Attendance Log: %', attendance_log_count;
    RAISE NOTICE '📊 Audit Log: %', audit_log_count;
    RAISE NOTICE '📊 WhatsApp Log: %', whatsapp_log_count;
    RAISE NOTICE '📊 School Allowed Emails: %', school_allowed_emails_count;
    RAISE NOTICE '📊 Correction Requests: %', correction_requests_count;
    RAISE NOTICE '🎉 All tables populated successfully!';
END $$;

