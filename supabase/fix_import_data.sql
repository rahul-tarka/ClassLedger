-- Fix for Import Data Issues
-- Run this AFTER importing data to clean up any issues

-- ============================================
-- FIX 1: Update empty status values
-- ============================================
-- For CHECK_OUT entries, status can be NULL
-- For CHECK_IN entries without status, set default based on type

-- Set NULL for empty status in CHECK_OUT entries
UPDATE attendance_log
SET status = NULL
WHERE type = 'CHECK_OUT' AND (status = '' OR status IS NULL);

-- For CHECK_IN entries with empty status, you might want to set a default
-- Uncomment and adjust based on your data:
-- UPDATE attendance_log
-- SET status = 'P'  -- or 'A' based on your logic
-- WHERE type = 'CHECK_IN' AND (status = '' OR status IS NULL);

-- ============================================
-- FIX 2: Clean up any invalid status values
-- ============================================
-- Remove rows with invalid status (if any)
-- DELETE FROM attendance_log
-- WHERE status IS NOT NULL AND status NOT IN ('P', 'A', 'L');

-- ============================================
-- FIX 3: Validate data after import
-- ============================================
-- Check for any remaining issues
SELECT 
  'Invalid status values' as issue,
  COUNT(*) as count
FROM attendance_log
WHERE status IS NOT NULL AND status NOT IN ('P', 'A', 'L')

UNION ALL

SELECT 
  'Empty status in CHECK_IN',
  COUNT(*)
FROM attendance_log
WHERE type = 'CHECK_IN' AND (status IS NULL OR status = '')

UNION ALL

SELECT 
  'Missing student references',
  COUNT(*)
FROM attendance_log a
LEFT JOIN students s ON a.student_id = s.student_id
WHERE s.student_id IS NULL;

-- ============================================
-- FIX 4: Update schema if needed (if table already exists)
-- ============================================
-- If you already created the table, run this to modify the constraint:
-- ALTER TABLE attendance_log
-- DROP CONSTRAINT IF EXISTS attendance_log_status_check;

-- ALTER TABLE attendance_log
-- ADD CONSTRAINT attendance_log_status_check 
-- CHECK (status IS NULL OR status IN ('P', 'A', 'L'));

