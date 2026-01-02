# 🚀 ClassLedger - Onboarding Guide

## Overview
ClassLedger now has a **complete onboarding flow** built into the product! No more manual SQL or CSV imports needed.

---

## ✨ Features

### 1. **Fresh Database Setup**
- Run `supabase/schema-fresh.sql` to create clean database
- Drops all existing tables and creates fresh ones
- Perfect for new installations

### 2. **Built-in Onboarding Flow**
- **Step 1:** School Information + First Admin
- **Step 2:** Add Teachers (Manual or CSV Import)
- **Step 3:** Add Students (Manual or CSV Import)
- **Step 4:** Complete Setup

### 3. **CSV Import**
- Download templates for teachers and students
- Drag & drop or choose file
- Automatic validation and import
- Batch processing for large files

---

## 📋 Setup Instructions

### Step 1: Create Fresh Database

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy entire content from `supabase/schema-fresh.sql`
3. Paste and **Run**
4. ✅ All tables created!

### Step 2: Configure Supabase Client

1. Open `frontend/js/supabase-config.js`
2. Update these values:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```

### Step 3: Access Onboarding

1. Open your frontend (e.g., `index.html` or `login.html`)
2. If no school exists, you'll be **automatically redirected** to `onboarding.html`
3. Follow the 4-step process

---

## 🎯 Onboarding Flow

### Step 1: School & Admin Setup
- Enter school name, address, phone, email
- Create first admin account:
  - Admin name
  - Admin email (for Google Sign-In)
  - Admin phone

**✅ Creates:**
- School record in `schools` table
- Admin record in `teachers` table (role: 'admin')

### Step 2: Add Teachers
**Option A: Manual Entry**
- Add teachers one by one
- Enter: Name, Email, Role, Classes, Phone

**Option B: CSV Import**
1. Download template: `teachers_template.csv`
2. Fill in your data
3. Upload CSV file
4. Automatic import!

**CSV Format:**
```csv
name,email,role,classes,phone
John Doe,john@school.com,teacher,"Class 1, Class 2",1234567890
Jane Smith,jane@school.com,principal,,9876543210
```

### Step 3: Add Students
**Option A: Manual Entry**
- Add students one by one
- Enter: Name, Class, Section, Roll, Parent details, WhatsApp enabled

**Option B: CSV Import**
1. Download template: `students_template.csv`
2. Fill in your data
3. Upload CSV file
4. Automatic batch import!

**CSV Format:**
```csv
name,class,section,roll,parent_name,parent_mobile,whatsapp_enabled
Rahul Kumar,Class 1,A,1,Parent Name,9876543210,true
Priya Singh,Class 1,A,2,Parent Name,9876543211,false
```

### Step 4: Complete
- Review summary
- Click "Go to Dashboard"
- Redirected to login page
- Ready to use!

---

## 📁 Files Created

### Backend
- `supabase/schema-fresh.sql` - Fresh database schema with DROP statements

### Frontend
- `frontend/onboarding.html` - Complete onboarding UI
- `frontend/js/onboarding.js` - Onboarding logic and CSV import
- `frontend/js/onboarding-check.js` - Auto-redirect to onboarding if needed
- `frontend/templates/teachers_template.csv` - CSV template for teachers
- `frontend/templates/students_template.csv` - CSV template for students

---

## 🔄 How It Works

### Auto-Redirect Logic
1. User visits `index.html` or `login.html`
2. `onboarding-check.js` runs
3. Checks if any school exists in database
4. If no school → Redirect to `onboarding.html`
5. If school exists → Normal login flow

### Onboarding Process
1. User fills Step 1 (School + Admin)
2. Data saved to Supabase
3. User adds teachers (Step 2)
4. User adds students (Step 3)
5. User completes setup (Step 4)
6. Redirected to login
7. Can now sign in with Google!

---

## ✅ Benefits

1. **No Manual SQL** - Everything through UI
2. **No CSV Manual Import** - Built-in import with templates
3. **Standard Onboarding** - Professional first-time setup
4. **Error Handling** - Validates data before saving
5. **Batch Import** - Import hundreds of students at once
6. **Progress Tracking** - Step indicator shows progress

---

## 🎨 UI Features

- **Step Indicator** - Visual progress (1, 2, 3, 4)
- **Form Validation** - Required fields marked with *
- **CSV Templates** - Download ready-to-use templates
- **Drag & Drop** - Easy file upload
- **Real-time Feedback** - Toast notifications
- **List Preview** - See added teachers/students
- **Skip Option** - Can skip and set up later

---

## 🚨 Important Notes

1. **First Admin Email** - Must be a valid Google email (for Sign-In)
2. **School ID** - Auto-generated (format: SCH123456)
3. **Student ID** - Auto-generated (format: STU1234567890123)
4. **CSV Headers** - Must match template exactly (case-insensitive)
5. **Batch Size** - Students imported in batches of 50

---

## 🔧 Troubleshooting

### Issue: Not redirecting to onboarding
**Solution:** Check `supabase-config.js` has correct URL and key

### Issue: CSV import fails
**Solution:** 
- Check CSV headers match template
- Ensure no empty required fields
- Check file encoding (UTF-8)

### Issue: Can't create school
**Solution:**
- Check RLS policies allow first school creation
- Verify Supabase connection

### Issue: Teachers/Students not showing
**Solution:**
- Refresh the list after adding
- Check browser console for errors
- Verify data in Supabase Table Editor

---

## 📊 Next Steps After Onboarding

1. **Sign In** - Use admin email to sign in with Google
2. **Add More Data** - Use Admin dashboard to add more teachers/students
3. **Start Marking Attendance** - Teachers can now mark attendance
4. **View Reports** - Admin/Principal can view reports

---

## 🎉 That's It!

Your school is now set up and ready to use ClassLedger!

**Questions?** Check the main `SUPABASE_MIGRATION_GUIDE.md` for detailed setup.

---

**Last Updated:** January 2025

