# Supabase Setup Instructions - Step by Step

## ⚠️ Important: Follow these steps in ORDER

---

## Step 1: Create Database Schema (FIRST!)

1. Open **Supabase Dashboard** → **SQL Editor**
2. Click **"New Query"**
3. Copy **ENTIRE** content from `supabase/schema.sql`
4. Paste in SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)

**✅ Expected Result:** 
- All tables created successfully
- No errors

**❌ If you get errors:**
- Check error message
- Make sure you copied the ENTIRE file
- Check if tables already exist (you might need to drop them first)

---

## Step 2: Verify Tables Created

1. Go to **Table Editor** in Supabase Dashboard
2. You should see these tables:
   - ✅ `schools`
   - ✅ `students`
   - ✅ `teachers`
   - ✅ `attendance_log`
   - ✅ `audit_log`
   - ✅ `whatsapp_log`
   - ✅ `correction_requests`

If any table is missing, go back to Step 1.

---

## Step 3: Import Data

### Option A: Using Supabase Dashboard (Easiest)

1. Go to **Table Editor**
2. Select a table (e.g., `schools`)
3. Click **"Insert"** → **"Import data from CSV"**
4. Upload your CSV file
5. Map columns correctly
6. Click **"Import"**

Repeat for each table:
- `schools` → `schools_export.csv`
- `students` → `students_export.csv`
- `teachers` → `teachers_export.csv`
- `attendance_log` → `attendance_export.csv`
- `audit_log` → `audit_export.csv`
- `whatsapp_log` → `whatsapp_export.csv` (if exists)

### Option B: Using SQL (Advanced)

Use the queries in `supabase/import_data.sql` (but make sure tables exist first!)

---

## Step 4: Fix Data Issues (If Needed)

**ONLY run this AFTER importing data!**

If you get errors during import:

1. Open **SQL Editor**
2. Copy queries from `supabase/fix_import_data.sql`
3. Run them one by one
4. Check the validation queries at the end

---

## Step 5: Verify Data

Run this query in SQL Editor:

```sql
SELECT 
  'schools' as table_name, COUNT(*) as count FROM schools
UNION ALL
SELECT 'teachers', COUNT(*) FROM teachers
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'attendance_log', COUNT(*) FROM attendance_log
UNION ALL
SELECT 'audit_log', COUNT(*) FROM audit_log;
```

You should see counts for each table.

---

## 🚨 Common Errors & Solutions

### Error: "relation does not exist"
**Cause:** Table not created yet
**Solution:** Run Step 1 (Create Schema) first!

### Error: "violates check constraint"
**Cause:** Data doesn't match constraints
**Solution:** 
1. Check the data in CSV
2. Run `fix_import_data.sql` queries
3. Or clean CSV before importing

### Error: "duplicate key value"
**Cause:** Trying to import same data twice
**Solution:** 
- Delete existing data first, OR
- Skip duplicate rows during import

### Error: "foreign key constraint"
**Cause:** Referenced table/data doesn't exist
**Solution:** Import in this order:
1. `schools` (first)
2. `teachers` (needs schools)
3. `students` (needs schools)
4. `attendance_log` (needs students, teachers)
5. `audit_log` (can be anytime)
6. `whatsapp_log` (needs students)

---

## ✅ Success Checklist

- [ ] All tables created (Step 1)
- [ ] All tables visible in Table Editor (Step 2)
- [ ] Data imported successfully (Step 3)
- [ ] No import errors (Step 4)
- [ ] Data counts verified (Step 5)
- [ ] Ready to update frontend!

---

## 📞 Need Help?

If you're stuck:
1. Check the error message carefully
2. Verify which step you're on
3. Make sure previous steps completed successfully
4. Check Supabase dashboard logs

---

**Current Status:** You need to complete **Step 1** first!

