# ClassLedger by Tarka

**Multi-Tenant School Attendance Management System**

A comprehensive, audit-safe, and loss-proof attendance system for schools with multi-tenant architecture, role-based access control, and real-time updates.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Why ClassLedger?](#why-classledger)
3. [Architecture](#architecture)
4. [Features](#features)
5. [User Roles](#user-roles)
6. [Project Structure](#project-structure)
7. [Technology Stack](#technology-stack)
8. [Setup & Installation](#setup--installation)
9. [Database Schema](#database-schema)
10. [Authentication Flow](#authentication-flow)
11. [User Flows](#user-flows)
12. [Deployment](#deployment)
13. [Configuration](#configuration)
14. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

ClassLedger is a modern, multi-tenant school attendance management system designed for:

- **Product Owners** - Manage multiple schools from a single dashboard
- **School Administrators** - Complete control over their school's attendance system
- **Teachers** - Quick and easy attendance marking
- **Principals** - Comprehensive reports and analytics

### Key Highlights

- ✅ **Multi-Tenant Architecture** - One product, multiple schools
- ✅ **Role-Based Access Control** - Product Admin → School Admin → Teachers/Principals
- ✅ **Allowed Emails System** - School admins control who can login
- ✅ **Real-Time Updates** - Live attendance tracking
- ✅ **Audit-Safe** - Complete audit trail for all actions
- ✅ **Loss-Proof** - Append-only logs ensure data integrity
- ✅ **CSV Import** - Bulk import teachers and students
- ✅ **Onboarding Flow** - Standard first-time setup

---

## 🤔 Why ClassLedger?

### Problem Statement

Schools need a reliable attendance system that:
- Works for multiple schools (SaaS model)
- Allows school admins to manage their own data
- Controls who can access the system
- Provides audit trails for compliance
- Scales with school growth
- Is easy to use for teachers

### Solution

ClassLedger provides:
- **Multi-tenant architecture** - Product owner manages all schools
- **School-level isolation** - Each school's data is separate
- **Email-based access control** - School admins define allowed emails
- **Complete audit logging** - Every action is tracked
- **Scalable database** - Built on PostgreSQL (Supabase)
- **Intuitive UI** - Simple, clean interface for all users

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Product Owner                        │
│              (Product Admin Dashboard)                 │
│  • Create Schools                                       │
│  • Assign School Admins                                │
│  • View All Schools                                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  School Administrators                   │
│              (School Admin Dashboard)                   │
│  • Manage Teachers/Students/Principals                  │
│  • Define Allowed Emails                                │
│  • View Reports                                         │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Teachers & Principals                     │
│         (Teacher/Principal Dashboards)                 │
│  • Mark Attendance (Teachers)                          │
│  • View Reports (Principals)                           │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- HTML5 + CSS3 + Vanilla JavaScript
- Responsive design
- Real-time updates via Supabase subscriptions

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Auth (Google OAuth)
- Row Level Security (RLS) for data isolation
- Real-time subscriptions

**Infrastructure:**
- Supabase Cloud (Database + Auth)
- GitHub Pages (Frontend hosting)

---

## ✨ Features

### Product Admin Features
- Create and manage multiple schools
- Assign school administrators
- View system-wide statistics
- Monitor all schools from one dashboard

### School Admin Features
- Manage teachers, students, and principals
- Define allowed email domains/addresses
- Import teachers and students via CSV
- View comprehensive reports
- Manage school settings
- Full CRUD operations on all school data

### Teacher Features
- Mark attendance (Present/Absent/Late)
- View assigned classes
- View today's attendance
- Edit attendance (within time window)
- Real-time updates

### Principal Features
- View attendance reports (read-only)
- View analytics and trends
- View absent students
- View teacher accountability
- Export reports

### System Features
- Google OAuth authentication
- Allowed emails system (school-level control)
- CSV import for bulk data entry
- Real-time attendance updates
- Complete audit logging
- WhatsApp alerts (optional)
- Holiday calendar management
- Advanced reporting with charts
- Bulk operations

---

## 👥 User Roles

### 1. Product Admin (Super Admin)
- **Access Level:** System-wide
- **Can Do:**
  - Create new schools
  - Assign school administrators
  - View all schools and statistics
  - Access all data (for support)

### 2. School Admin
- **Access Level:** School-specific
- **Can Do:**
  - Manage teachers, students, principals
  - Define allowed email domains/addresses
  - View and manage all school data
  - Import data via CSV
  - Configure school settings

### 3. Teacher
- **Access Level:** Assigned classes only
- **Can Do:**
  - Mark attendance for assigned classes
  - View attendance history
  - Edit attendance (within time window)

### 4. Principal
- **Access Level:** School-wide (read-only)
- **Can Do:**
  - View all attendance reports
  - View analytics and trends
  - View teacher accountability
  - Export reports
- **Note:** Multiple principals per school are allowed

---

## 📁 Project Structure

```
ClassLedger/
├── frontend/                          # Frontend application
│   ├── index.html                     # Homepage
│   ├── login.html                     # Login page
│   ├── onboarding.html                # First-time school setup
│   ├── product-admin-dashboard.html   # Product admin interface
│   ├── admin-dashboard.html           # School admin interface
│   ├── admin-allowed-emails.html      # Manage allowed emails
│   ├── teacher-dashboard.html          # Teacher interface
│   ├── principal-dashboard.html       # Principal interface
│   ├── css/
│   │   └── styles.css                 # Main stylesheet
│   ├── js/
│   │   ├── supabase-config.js         # Supabase configuration
│   │   ├── auth-supabase.js           # Authentication (Supabase)
│   │   ├── product-admin.js           # Product admin logic
│   │   ├── admin.js                   # School admin logic
│   │   ├── admin-allowed-emails.js    # Allowed emails management
│   │   ├── admin-management.js        # Admin CRUD operations
│   │   ├── teacher.js                 # Teacher logic
│   │   ├── principal.js               # Principal logic
│   │   ├── onboarding.js             # Onboarding flow
│   │   ├── onboarding-check.js       # Auto-redirect to onboarding
│   │   ├── utils.js                   # Utility functions
│   │   ├── analytics.js               # Analytics & insights
│   │   ├── advanced-reporting.js      # Charts & exports
│   │   ├── realtime.js                # Real-time updates
│   │   ├── bulk-operations.js         # Bulk operations
│   │   ├── holiday-calendar.js        # Holiday management
│   │   └── student-portal.js          # Student portal features
│   ├── assets/
│   │   ├── logo.svg                   # Main logo
│   │   ├── logo-white.svg             # White logo (for headers)
│   │   └── favicon.svg                # Browser favicon
│   └── templates/
│       ├── teachers_template.csv      # CSV template for teachers
│       └── students_template.csv      # CSV template for students
├── supabase/
│   ├── schema-fresh.sql               # Complete database schema
│   └── supabase-client.js             # Supabase client helper
└── README.md                          # This file
```

---

## 🚀 Complete Setup Guide

Follow these steps in order to set up ClassLedger from scratch.

---

### 📋 Prerequisites

Before starting, ensure you have:
- ✅ **GitHub Account** - For code hosting and deployment
- ✅ **Google Account** - For OAuth authentication
- ✅ **Supabase Account** - Free tier is sufficient (sign up at https://supabase.com)
- ✅ **Google Cloud Console Access** - For OAuth credentials (free)

---

## Part 1: Supabase Backend Setup

### Step 1.1: Create Supabase Project

1. **Sign Up/Login to Supabase**
   - Go to https://supabase.com
   - Click "Start your project" or "New Project"
   - Sign up with GitHub or Email (FREE)

2. **Create New Project**
   - Click "New Project" button
   - Fill in details:
     - **Name:** `classledger` (or any name you prefer)
     - **Database Password:** Create a strong password (⚠️ **SAVE THIS PASSWORD!** You'll need it later)
     - **Region:** Choose closest to your users (e.g., `Southeast Asia (Mumbai)` for India)
     - **Pricing Plan:** Free tier (sufficient for 500 students)
   - Click "Create new project"
   - ⏳ Wait 2-3 minutes for project initialization

3. **Note Your Project Details**
   - Once created, note down:
     - Project URL: `https://xxxxx.supabase.co`
     - You'll need this in Step 1.5

---

### Step 1.2: Setup Database Schema

1. **Open SQL Editor**
   - In Supabase Dashboard, click **SQL Editor** (left sidebar)
   - Click **New Query** button

2. **Run Schema Script**
   - Open `supabase/schema-fresh.sql` file from this repository
   - Copy **ENTIRE** content (all 500+ lines)
   - Paste into SQL Editor
   - Click **Run** button (or press `Ctrl+Enter` / `Cmd+Enter`)
   - ✅ Wait for success message: "Success. No rows returned"

3. **Verify Tables Created**
   - Go to **Table Editor** (left sidebar)
   - You should see these tables:
     - `product_admins`
     - `schools`
     - `teachers`
     - `students`
     - `attendance_log`
     - `school_allowed_emails`
     - `audit_log`
     - `whatsapp_log`
     - `correction_requests`

---

### Step 1.3: Create First Product Admin

1. **Open SQL Editor Again**
   - Click **SQL Editor** → **New Query**

2. **Insert Your Email as Product Admin**
   ```sql
   INSERT INTO product_admins (email, name, active) VALUES
   ('your-email@gmail.com', 'Your Name', true);
   ```
   - Replace `your-email@gmail.com` with your **actual Google email** (the one you'll use to login)
   - Replace `Your Name` with your name
   - Click **Run**

3. **Verify**
   - Go to **Table Editor** → `product_admins` table
   - You should see your email listed

---

### Step 1.4: Configure Google OAuth

#### A. Get Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit https://console.cloud.google.com
   - Login with your Google account

2. **Create or Select Project**
   - Click project dropdown (top bar)
   - Click "New Project" (or select existing)
   - Name: `ClassLedger` (or any name)
   - Click "Create"

3. **Enable Google+ API**
   - In left sidebar, go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click on it and click **Enable**

4. **Create OAuth 2.0 Credentials**
   - Go to **APIs & Services** → **Credentials**
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - If prompted, configure OAuth consent screen:
     - **User Type:** External
     - **App name:** ClassLedger
     - **User support email:** Your email
     - **Developer contact:** Your email
     - Click "Save and Continue" through all steps
   - Back to Credentials:
     - **Application type:** Web application
     - **Name:** ClassLedger Web Client
     - **Authorized redirect URIs:** 
       ```
       https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
       ```
       - Replace `YOUR_PROJECT_ID` with your Supabase project ID (from Step 1.1)
       - Example: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`
     - Click **Create**
   - ⚠️ **Copy these values:**
     - **Client ID:** `xxxxx.apps.googleusercontent.com`
     - **Client Secret:** `xxxxx`
     - Keep these safe!

#### B. Configure in Supabase

1. **Go to Supabase Dashboard**
   - Click **Authentication** (left sidebar)
   - Click **Providers** tab

2. **Enable Google Provider**
   - Find **Google** in the list
   - Toggle **Enable Google** to ON
   - Enter:
     - **Client ID (for OAuth):** Paste your Google Client ID
     - **Client Secret (for OAuth):** Paste your Google Client Secret
   - Click **Save**

3. **Verify**
   - You should see "Google" provider as "Enabled" ✅

---

### Step 1.5: Get Supabase API Credentials

1. **Go to Supabase Settings**
   - In Supabase Dashboard, click **Settings** (gear icon, left sidebar)
   - Click **API** tab

2. **Copy These Values:**
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGc...` (long string starting with `eyJ`)

3. **Save These** - You'll need them in Step 2.2

---

## Part 2: Frontend Configuration

### Step 2.1: Clone/Download Repository

If you haven't already:
```bash
git clone https://github.com/rahulrathodsubmittable/ClassLedger.git
cd ClassLedger
```

Or download ZIP from GitHub and extract.

---

### Step 2.2: Update Supabase Configuration

1. **Open Configuration File**
   - Navigate to: `frontend/js/supabase-config.js`
   - Open in any text editor

2. **Update Credentials**
   ```javascript
   const SUPABASE_URL = 'https://xxxxx.supabase.co';  // From Step 1.5
   const SUPABASE_ANON_KEY = 'eyJhbGc...';            // From Step 1.5
   ```
   - Replace `https://xxxxx.supabase.co` with your **Project URL** from Step 1.5
   - Replace `eyJhbGc...` with your **anon public key** from Step 1.5

3. **Save File**

---

### Step 2.3: Verify Frontend Structure

Ensure these files exist:
- ✅ `frontend/index.html`
- ✅ `frontend/login.html`
- ✅ `frontend/js/supabase-config.js` (updated with your credentials)
- ✅ `frontend/css/styles.css`
- ✅ All other HTML and JS files

---

## Part 3: Deploy to GitHub Pages

### Step 3.1: Push Code to GitHub

1. **Initialize Git (if not already)**
   ```bash
   cd ClassLedger
   git init
   git add .
   git commit -m "Initial commit: ClassLedger setup"
   ```

2. **Create GitHub Repository**
   - Go to https://github.com/new
   - Repository name: `ClassLedger` (or your choice)
   - Visibility: **Public** (required for free GitHub Pages)
   - Click "Create repository"

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ClassLedger.git
   git branch -M main
   git push -u origin main
   ```
   - Replace `YOUR_USERNAME` with your GitHub username

---

### Step 3.2: Configure GitHub Pages

1. **Go to Repository Settings**
   - Open your GitHub repository: `https://github.com/YOUR_USERNAME/ClassLedger`
   - Click **Settings** tab (top menu)

2. **Enable GitHub Pages**
   - Scroll down to **Pages** section (left sidebar)
   - Under **Source**:
     - **Source:** Select `GitHub Actions` (not "Deploy from a branch")
   - Click **Save**

3. **Verify GitHub Actions Workflow**
   - The repository already includes `.github/workflows/deploy.yml`
   - This workflow automatically deploys `frontend/` folder to GitHub Pages
   - No additional configuration needed

4. **Wait for First Deployment**
   - After pushing code, go to **Actions** tab in your repository
   - You'll see "Deploy to GitHub Pages" workflow running
   - Takes 1-2 minutes to complete
   - Once green ✅, your site is live!

5. **Your Site URL**
   ```
   https://YOUR_USERNAME.github.io/ClassLedger/
   ```
   - Replace `YOUR_USERNAME` with your GitHub username
   - Example: `https://rahulrathodsubmittable.github.io/ClassLedger/`
   - This URL is also shown in: Repository → Settings → Pages

---

### Step 3.3: Update Google OAuth Redirect URI

1. **Go Back to Google Cloud Console**
   - Visit https://console.cloud.google.com
   - Go to **APIs & Services** → **Credentials**
   - Click on your OAuth 2.0 Client ID

2. **Add GitHub Pages URL**
   - Under **Authorized redirect URIs**, add:
     ```
     https://YOUR_USERNAME.github.io/ClassLedger/
     ```
   - Also keep the Supabase callback URL:
     ```
     https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
     ```
   - Click **Save**

---

## Part 4: Testing & Verification

### Step 4.1: Test Homepage

1. **Open Your Site**
   - Visit: `https://YOUR_USERNAME.github.io/ClassLedger/`
   - You should see the ClassLedger homepage

2. **Check for Errors**
   - Open browser console (F12)
   - Look for any red errors
   - If you see Supabase connection errors, verify Step 2.2

---

### Step 4.2: Test Login

1. **Click "Login" or "Get Started"**
   - You should be redirected to login page

2. **Click "Sign in with Google"**
   - You should see Google OAuth popup
   - Select your Google account (the one you added as Product Admin in Step 1.3)

3. **Verify Redirect**
   - After Google login, you should be redirected to:
     - `product-admin-dashboard.html` (if you're Product Admin)
     - Or appropriate dashboard based on your role

---

### Step 4.3: Create Your First School

1. **On Product Admin Dashboard**
   - Click "Add New School" or similar button
   - Fill in:
     - School name
     - Address
     - Phone
     - Email
     - **School Admin Email** (use a different Google email, or create a test one)
     - School Admin Name
   - Click "Create School"

2. **Verify in Supabase**
   - Go to Supabase Dashboard → **Table Editor** → `schools` table
   - You should see your new school
   - Go to `teachers` table
   - You should see the school admin (role: 'admin')

---

### Step 4.4: Test School Admin Login

1. **Logout** (if logged in as Product Admin)

2. **Login as School Admin**
   - Use the email you set as School Admin in Step 4.3
   - You should be redirected to `admin-dashboard.html`

3. **Add Allowed Email**
   - Go to "Allowed Emails" section
   - Add the School Admin's email (or domain like `@school.com`)
   - Save

---

### Step 4.5: Complete Onboarding (Optional)

1. **Add Teachers**
   - In School Admin dashboard, go to "Teachers" section
   - Add a teacher manually or import CSV
   - Use template: `frontend/templates/teachers_template.csv`

2. **Add Students**
   - Go to "Students" section
   - Add students manually or import CSV
   - Use template: `frontend/templates/students_template.csv`

3. **Add Principal**
   - Go to "Principals" section
   - Add a principal (role: 'principal')

---

## ✅ Setup Complete!

Your ClassLedger is now fully set up and deployed! 🎉

**Your Live URL:**
```
https://YOUR_USERNAME.github.io/ClassLedger/
```

**Next Steps:**
1. ✅ Test all features
2. ✅ Add more schools (as Product Admin)
3. ✅ Configure each school (as School Admin)
4. ✅ Start using for attendance tracking!

---

## 🔧 Troubleshooting

### Issue: "Access Denied" after Google login

**Solution:**
- Verify your email is in `product_admins` table (Step 1.3)
- Check Supabase → Table Editor → `product_admins`
- If missing, add it via SQL Editor

### Issue: Supabase connection error in browser console

**Solution:**
- Verify `frontend/js/supabase-config.js` has correct URL and key
- Check Supabase Dashboard → Settings → API for correct values
- Ensure you saved the file after updating

### Issue: GitHub Pages shows 404

**Solution:**
- Verify Pages settings: Source = `GitHub Actions` (not "Deploy from a branch")
- Check Actions tab for deployment status (should be green ✅)
- Wait 2-3 minutes for GitHub to rebuild
- Check that `frontend/index.html` exists
- Verify `.github/workflows/deploy.yml` file exists in repository

### Issue: Google OAuth redirect error

**Solution:**
- Verify redirect URI in Google Cloud Console includes:
  - `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
  - `https://YOUR_USERNAME.github.io/ClassLedger/`
- Check Supabase → Authentication → Providers → Google is enabled

### Issue: Can't create school

**Solution:**
- Verify you're logged in as Product Admin
- Check browser console for errors
- Verify RLS policies in Supabase (should be set by schema-fresh.sql)

### Issue: CSV import fails

**Solution:**
- Download template from onboarding page
- Ensure all required columns match template
- Check for duplicate emails/IDs
- Verify CSV format (UTF-8 encoding)

---

## 📝 Quick Reference

**Supabase Dashboard:**
- URL: https://app.supabase.com
- SQL Editor: Left sidebar → SQL Editor
- Table Editor: Left sidebar → Table Editor
- Settings: Left sidebar → Settings (gear icon) → API

**Google Cloud Console:**
- URL: https://console.cloud.google.com
- OAuth Credentials: APIs & Services → Credentials

**GitHub Pages:**
- Settings: Repository → Settings → Pages
- Site URL: `https://YOUR_USERNAME.github.io/ClassLedger/`

---

**Last Updated:** January 2025

---

## 🗄️ Database Schema

### Tables

1. **`product_admins`** - Product level super admins
   - `email` (PK) - Google email
   - `name` - Admin name
   - `active` - Active status

2. **`schools`** - School master data
   - `school_id` (PK) - Unique school identifier
   - `school_name` - School name
   - `address` - School address
   - `phone` - Contact phone
   - `email` - Contact email
   - `product_admin_email` - Who created this school
   - `active` - Active status

3. **`teachers`** - Teachers, admins, principals
   - `email` (PK) - Google email
   - `school_id` (FK) - School reference
   - `name` - Teacher name
   - `role` - 'teacher', 'admin', or 'principal'
   - `class_assigned` - Array of class names
   - `phone` - Contact phone
   - `active` - Active status

4. **`students`** - Student master data
   - `student_id` (PK) - Unique student identifier
   - `school_id` (FK) - School reference
   - `name` - Student name
   - `class` - Class name
   - `section` - Section (A, B, etc.)
   - `roll` - Roll number
   - `parent_name` - Parent name
   - `parent_mobile` - Parent mobile
   - `whatsapp_alert_enabled` - Enable WhatsApp alerts
   - `active` - Active status

5. **`attendance_log`** - Attendance records
   - `log_id` (PK) - Unique log identifier
   - `date` - Attendance date
   - `time` - Attendance time
   - `student_id` (FK) - Student reference
   - `school_id` (FK) - School reference
   - `class` - Class name
   - `status` - 'P' (Present), 'A' (Absent), 'L' (Late)
   - `type` - 'CHECK_IN' or 'CHECK_OUT'
   - `teacher_email` (FK) - Teacher reference
   - `remark` - Optional remark
   - `day` - Day of week

6. **`school_allowed_emails`** - Allowed email patterns per school
   - `id` (PK) - Unique identifier
   - `school_id` (FK) - School reference
   - `email_pattern` - Email or domain (e.g., @school.com)
   - `type` - 'email' (specific) or 'domain' (all from domain)
   - `active` - Active status
   - `created_by` - Who created this

7. **`audit_log`** - Audit trail
   - `id` (PK) - Unique identifier
   - `timestamp` - Action timestamp
   - `user_email` - Who performed action
   - `action` - Action name
   - `details` - JSON details
   - `ip_address` - User IP
   - `user_agent` - Browser info

8. **`whatsapp_log`** - WhatsApp alerts log
   - `id` (PK) - Unique identifier
   - `student_id` (FK) - Student reference
   - `parent_mobile` - Parent mobile number
   - `date` - Alert date
   - `status` - 'sent', 'failed', 'skipped'
   - `response` - API response (JSON)
   - `error_message` - Error if failed

9. **`correction_requests`** - Student correction requests
   - `id` (PK) - UUID
   - `student_id` (FK) - Student reference
   - `date` - Attendance date
   - `current_status` - Current attendance status
   - `requested_status` - Requested status
   - `reason` - Reason for correction
   - `status` - 'pending', 'approved', 'rejected'
   - `requested_by` - Who requested
   - `reviewed_by` - Who reviewed (admin)

### Indexes

All tables have appropriate indexes for performance:
- Foreign key indexes
- Date-based indexes
- Status-based indexes
- Composite indexes for common queries

### Row Level Security (RLS)

All tables have RLS policies:
- **Product Admins** - Can view all data
- **School Admins** - Can only access their school's data
- **Teachers** - Can only access their assigned classes
- **Principals** - Read-only access to their school

---

## 🔐 Authentication Flow

### Login Process

1. User clicks "Sign in with Google"
2. Redirected to Google OAuth
3. User authorizes with Google
4. Google redirects back with user email
5. System checks user role:

   **Priority 1: Product Admin?**
   - Check `product_admins` table
   - If found → Redirect to `product-admin-dashboard.html`

   **Priority 2: School Admin?**
   - Check `teachers` table where `role = 'admin'`
   - If found → Redirect to `admin-dashboard.html`

   **Priority 3: Teacher/Principal?**
   - Check `teachers` table
   - Check `school_allowed_emails` table
   - If email matches allowed pattern → Redirect to dashboard
   - If not allowed → Show "Access Denied"

### Allowed Emails System

School admins can define:
- **Specific Emails:** `teacher@school.com` (exact match)
- **Email Domains:** `@school.com` (all emails ending with this)

Example:
- Allowed: `@schoolname.com`
- Teacher email: `john@schoolname.com` → ✅ Allowed
- Teacher email: `john@gmail.com` → ❌ Not allowed

---

## 🔄 User Flows

### Flow 1: Product Admin Onboards School

1. Product Admin logs in → `product-admin-dashboard.html`
2. Clicks "Add New School"
3. Enters:
   - School name, address, contact
   - **School Admin email** (must be Google email)
   - School Admin name
4. System creates:
   - School record in `schools` table
   - School Admin in `teachers` table (role: 'admin')
5. School Admin can now login

### Flow 2: School Admin Sets Up School

1. School Admin logs in → `admin-dashboard.html`
2. First time → Onboarding flow:
   - Add teachers (manual or CSV import)
   - Add students (manual or CSV import)
   - Add principals (manual or CSV import)
   - Define allowed emails → `admin-allowed-emails.html`
3. After setup → Full admin dashboard

### Flow 3: Teacher Uses System

1. Teacher logs in with Google
2. System checks:
   - ✅ Email exists in `teachers` table?
   - ✅ Email matches allowed emails/domains?
3. If yes → `teacher-dashboard.html`
4. Teacher can:
   - View assigned classes
   - Mark attendance
   - View attendance history

### Flow 4: Principal Views Reports

1. Principal logs in with Google
2. System checks (same as teacher)
3. If allowed → `principal-dashboard.html`
4. Principal can:
   - View all attendance reports
   - View analytics
   - View teacher accountability
   - Export reports

---

## 📦 Deployment

### Frontend Deployment (GitHub Pages)

ClassLedger uses **GitHub Pages** for frontend hosting with automatic deployment via GitHub Actions.

**Deployment Method:**
- ✅ **GitHub Pages** - Automatic deployment on every push to `main` branch
- ✅ **GitHub Actions Workflow** - Configured in `.github/workflows/deploy.yml`
- ✅ **Auto-deploy** - No manual steps needed after initial setup

**How It Works:**
1. Code is pushed to GitHub `main` branch
2. GitHub Actions workflow automatically triggers
3. Frontend files from `frontend/` folder are deployed
4. Site is live at: `https://YOUR_USERNAME.github.io/ClassLedger/`

**Initial Setup:**
See **Part 3: Deploy to GitHub Pages** in the Setup Guide above for detailed instructions.

**After Setup:**
- Every `git push` to `main` automatically deploys the site
- No manual deployment needed
- Check deployment status: Repository → Actions tab

### Database

Database is hosted on Supabase Cloud (no deployment needed). Already configured in **Part 1** of Setup Guide.

### Configuration

All configuration is in `frontend/js/supabase-config.js` (updated in **Part 2** of Setup Guide). No environment variables needed.

---

## ⚙️ Configuration

### Supabase Configuration

File: `frontend/js/supabase-config.js`

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGc...';
```

Get these from: Supabase Dashboard → Settings → API

### Google OAuth Configuration

1. Supabase Dashboard → Authentication → Providers → Google
2. Add Client ID and Client Secret from Google Cloud Console
3. Add redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

---

## 🐛 Troubleshooting

### Issue: "Access Denied" after login

**Possible Causes:**
1. Email not in `product_admins` or `teachers` table
2. Email not in allowed emails list (for teachers/principals)
3. User's `active` status is `false`

**Solution:**
- Check Supabase tables
- Add email to appropriate table
- Add email to allowed emails list (if teacher/principal)

### Issue: Can't create school

**Possible Causes:**
1. Not logged in as Product Admin
2. RLS policy blocking insert

**Solution:**
- Verify you're in `product_admins` table
- Check RLS policies in Supabase

### Issue: CSV import fails

**Possible Causes:**
1. CSV format doesn't match template
2. Required fields missing
3. Duplicate entries

**Solution:**
- Download template from onboarding page
- Ensure all required columns are present
- Check for duplicate emails/IDs

### Issue: Real-time updates not working

**Possible Causes:**
1. Supabase real-time not enabled
2. RLS policies blocking subscriptions

**Solution:**
- Enable real-time in Supabase Dashboard → Database → Replication
- Check RLS policies allow SELECT

---

## 📝 License

This project is proprietary software developed by Tarka.

---

## 👥 Support

For support, contact your system administrator or product owner.

---

## 🎉 That's It!

ClassLedger is ready to use. Follow the setup instructions above to get started.

**Last Updated:** January 2025
