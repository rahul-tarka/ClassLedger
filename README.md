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
- Static frontend hosting (Vercel/Netlify/GitHub Pages)

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

## 🚀 Setup & Installation

### Prerequisites

1. **Supabase Account** - Sign up at https://supabase.com (FREE)
2. **Google Cloud Project** - For OAuth (if using Google Sign-In)
3. **Git** - For version control
4. **Web Hosting** - Vercel, Netlify, or GitHub Pages (FREE)

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or Email
4. Create new project:
   - **Name:** `classledger` (or your choice)
   - **Database Password:** Create strong password (SAVE IT!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier
5. Wait 2-3 minutes for project initialization

### Step 2: Setup Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy entire content from `supabase/schema-fresh.sql`
4. Paste and click **Run**
5. ✅ All tables, indexes, and RLS policies created

### Step 3: Create First Product Admin

Run in Supabase SQL Editor:

```sql
INSERT INTO product_admins (email, name, active) VALUES
('your-email@gmail.com', 'Your Name', true);
```

Replace `your-email@gmail.com` with your actual Google email.

### Step 4: Configure Google OAuth

1. Go to **Authentication** → **Providers** in Supabase
2. Enable **Google**
3. Get credentials from Google Cloud Console:
   - Go to https://console.cloud.google.com
   - Create new project or use existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

### Step 5: Configure Frontend

1. Open `frontend/js/supabase-config.js`
2. Update with your Supabase credentials:

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';  // From Supabase Dashboard → Settings → API
const SUPABASE_ANON_KEY = 'eyJhbGc...';            // From Supabase Dashboard → Settings → API
```

### Step 6: Deploy Frontend

**Option A: Vercel (Recommended)**
1. Push code to GitHub
2. Go to https://vercel.com
3. Import your GitHub repository
4. Set root directory to `frontend/`
5. Deploy

**Option B: Netlify**
1. Push code to GitHub
2. Go to https://netlify.com
3. Import from GitHub
4. Set publish directory to `frontend/`
5. Deploy

**Option C: GitHub Pages**
1. Push code to GitHub
2. Go to repository Settings → Pages
3. Select source branch and `frontend/` folder
4. Save

### Step 7: Test

1. Open your deployed frontend URL
2. Login as Product Admin
3. Create a school
4. Login as School Admin
5. Add teachers and students
6. Define allowed emails
7. Login as Teacher
8. Mark attendance

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

### Frontend Deployment

**Vercel (Recommended):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

**Netlify:**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod
```

**GitHub Pages:**
1. Push code to GitHub
2. Go to repository Settings → Pages
3. Select branch and `frontend/` folder
4. Save

### Database

Database is hosted on Supabase Cloud (no deployment needed).

### Environment Variables

No environment variables needed - all config is in `supabase-config.js`.

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
