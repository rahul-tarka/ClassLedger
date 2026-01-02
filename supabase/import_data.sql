-- Import Data from Google Sheets CSV exports
-- Instructions:
-- 1. Export each Google Sheet to CSV
-- 2. Use Supabase Table Editor → Import CSV (Easier)
-- OR
-- 3. Use this SQL with COPY command (if you have CSV files on server)

-- ============================================
-- IMPORT SCHOOLS
-- ============================================
-- Method 1: Using Supabase Dashboard (Recommended)
-- 1. Go to Table Editor → schools
-- 2. Click "Insert" → "Import data from CSV"
-- 3. Upload schools_export.csv
-- 4. Map columns: school_id, school_name, active

-- Method 2: Using SQL COPY (if CSV is accessible)
/*
COPY schools(school_id, school_name, active)
FROM '/path/to/schools_export.csv'
DELIMITER ','
CSV HEADER;
*/

-- ============================================
-- IMPORT TEACHERS
-- ============================================
-- Column mapping:
-- CSV: email, school_id, name, role, class_assigned, active
-- Table: email, school_id, name, role, class_assigned (array), active

-- Note: class_assigned needs to be converted from comma-separated string to array
-- Example: 'Class 1,Class 2' → ARRAY['Class 1', 'Class 2']

-- ============================================
-- IMPORT STUDENTS
-- ============================================
-- Column mapping:
-- CSV: student_id, school_id, name, class, section, roll, parent_mobile, active, whatsapp_alert_enabled, parent_name
-- Table: student_id, school_id, name, class, section, roll, parent_mobile, active, whatsapp_alert_enabled, parent_name

-- ============================================
-- IMPORT ATTENDANCE LOG
-- ============================================
-- Column mapping:
-- CSV: log_id, date, time, student_id, school_id, class, status, type, teacher_email, remark, day
-- Table: log_id, date, time, student_id, school_id, class, status, type, teacher_email, remark, day

-- Note: Ensure date format is YYYY-MM-DD and time is HH:MM:SS

-- ============================================
-- IMPORT AUDIT LOG
-- ============================================
-- Column mapping:
-- CSV: timestamp, user_email, action, details (JSON), ip_address, user_agent
-- Table: timestamp, user_email, action, details (JSONB), ip_address, user_agent

-- ============================================
-- IMPORT WHATSAPP LOG (if exists)
-- ============================================
-- Column mapping:
-- CSV: student_id, parent_mobile, date, status, response (JSON), error_message, sent_at
-- Table: student_id, parent_mobile, date, status, response (JSONB), error_message, sent_at

-- ============================================
-- DATA VALIDATION QUERIES
-- ============================================

-- Check imported data counts
SELECT 'schools' as table_name, COUNT(*) as count FROM schools
UNION ALL
SELECT 'teachers', COUNT(*) FROM teachers
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'attendance_log', COUNT(*) FROM attendance_log
UNION ALL
SELECT 'audit_log', COUNT(*) FROM audit_log;

-- Check for missing relationships
SELECT 'Students without school' as issue, COUNT(*) as count 
FROM students s 
LEFT JOIN schools sc ON s.school_id = sc.school_id 
WHERE sc.school_id IS NULL

UNION ALL

SELECT 'Attendance without student', COUNT(*) 
FROM attendance_log a 
LEFT JOIN students s ON a.student_id = s.student_id 
WHERE s.student_id IS NULL;

-- ============================================
-- CLEANUP (if needed)
-- ============================================

-- Remove duplicate attendance entries (if any)
-- DELETE FROM attendance_log 
-- WHERE log_id IN (
--   SELECT log_id FROM (
--     SELECT log_id, ROW_NUMBER() OVER (
--       PARTITION BY student_id, date, type ORDER BY time
--     ) as rn
--     FROM attendance_log
--   ) t WHERE rn > 1
-- );

