# 🚀 Supabase Migration Guide - ClassLedger

## 📋 Overview
Complete guide to migrate ClassLedger from Google Sheets + Apps Script to Supabase (PostgreSQL).

**Benefits:**
- ✅ 10-50x faster performance
- ✅ 100% FREE for your scale (500 students, 5 users)
- ✅ Real-time updates built-in
- ✅ Production-ready database
- ✅ Easy to scale

---

## 🎯 Prerequisites

1. **Supabase Account** - Sign up at https://supabase.com (FREE)
2. **Google Sheets Access** - To export current data
3. **GitHub Account** - For code repository
4. **Basic Terminal Knowledge** - For running commands

---

## 📊 Step 1: Setup Supabase Project

### 1.1 Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or Email
4. Verify email if needed

### 1.2 Create New Project
1. Click "New Project"
2. **Organization:** Create new or use existing
3. **Project Name:** `classledger` (or your choice)
4. **Database Password:** Create strong password (SAVE IT!)
5. **Region:** Choose closest to your users (e.g., `ap-south-1` for India)
6. **Pricing Plan:** Select "Free" tier
7. Click "Create new project"

**Wait 2-3 minutes** for project to initialize.

### 1.3 Get Project Credentials
1. Go to **Settings** → **API**
2. Copy these (you'll need them):
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** `eyJhbGc...` (long string)
   - **service_role key:** `eyJhbGc...` (keep secret!)

---

## 📊 Step 2: Create Database Schema

### 2.1 Open SQL Editor
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**

### 2.2 Run Schema SQL
Copy and paste the SQL from `supabase/schema.sql` (we'll create this)

**Tables to Create:**
- `schools` - School master data
- `students` - Student master data
- `teachers` - Teacher master data
- `attendance_log` - Attendance records
- `audit_log` - Audit trail
- `whatsapp_log` - WhatsApp alerts log
- `correction_requests` - Student correction requests (new)

### 2.3 Enable Row Level Security (RLS)
We'll set up RLS policies for security.

---

## 📊 Step 3: Export Data from Google Sheets

### 3.1 Export Each Sheet to CSV

**From Google Sheets:**
1. Open each sheet:
   - School_Master
   - Student_Master
   - Teacher_Master
   - Attendance_Log
   - Audit_Log
   - WhatsApp_Log (if exists)

2. For each sheet:
   - File → Download → Comma-separated values (.csv)
   - Save with descriptive names:
     - `schools_export.csv`
     - `students_export.csv`
     - `teachers_export.csv`
     - `attendance_export.csv`
     - `audit_export.csv`
     - `whatsapp_export.csv`

### 3.2 Clean Data (Optional)
- Remove header rows if needed
- Check for special characters
- Ensure dates are in YYYY-MM-DD format

---

## 📊 Step 4: Import Data to Supabase

### 4.1 Using Supabase Dashboard
1. Go to **Table Editor** in Supabase
2. Select table (e.g., `schools`)
3. Click **Insert** → **Import data from CSV**
4. Upload CSV file
5. Map columns correctly
6. Click **Import**

### 4.2 Using SQL (Alternative)
Use the import script from `supabase/import_data.sql`

---

## 📊 Step 5: Setup Authentication

### 5.1 Enable Google OAuth
1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Get credentials from Google Cloud Console:
   - Client ID
   - Client Secret
4. Add to Supabase
5. Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 5.2 Test Authentication
- Try logging in with Google
- Verify user is created in `auth.users` table

---

## 📊 Step 6: Update Frontend

### 6.1 Install Supabase Client
```bash
# In your frontend directory
npm install @supabase/supabase-js
```

Or use CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### 6.2 Update auth.js
Replace Google Apps Script API calls with Supabase client calls.

### 6.3 Update API URLs
Change from Apps Script URL to Supabase REST API.

---

## 📊 Step 7: Deploy & Test

### 7.1 Test All Features
- [ ] Login/Logout
- [ ] View students
- [ ] Mark attendance
- [ ] View reports
- [ ] Admin features
- [ ] Real-time updates

### 7.2 Performance Check
- Compare load times
- Should be 10-50x faster!

---

## 🎯 Migration Timeline

- **Day 1:** Setup Supabase + Create schema (2-3 hours)
- **Day 2:** Export/Import data + Test (2-3 hours)
- **Day 3:** Update frontend + Deploy (3-4 hours)
- **Day 4:** Testing + Bug fixes (2-3 hours)

**Total:** 1-2 days

---

## ⚠️ Important Notes

1. **Keep Google Sheets as Backup** - Don't delete until migration is complete
2. **Test Thoroughly** - Test all features before going live
3. **Monitor Performance** - Check Supabase dashboard for usage
4. **Backup Data** - Export Supabase data regularly

---

## 🆘 Troubleshooting

### Issue: Import fails
- Check CSV format
- Verify column names match schema
- Check data types

### Issue: Authentication not working
- Verify Google OAuth credentials
- Check redirect URLs
- Check RLS policies

### Issue: Slow queries
- Add database indexes
- Use proper WHERE clauses
- Check query performance in dashboard

---

**Next:** We'll create the actual code files for migration.

