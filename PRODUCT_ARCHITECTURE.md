# ClassLedger - Product Architecture

## 🏗️ Multi-Tenant System Architecture

### User Roles Hierarchy

```
1. Product Admin (Super Admin)
   └── Manages all schools
       └── Creates schools
       └── Assigns school admins
       └── Views all schools

2. School Admin
   └── Manages their school
       └── Adds/Manages teachers
       └── Adds/Manages students
       └── Adds/Manages principals
       └── Defines allowed email domains/emails

3. Teachers
   └── Mark attendance
   └── View their classes

4. Principals
   └── View reports (read-only)
   └── View analytics
```

---

## 📊 Database Schema Updates

### New Tables

1. **product_admins** - Product level super admins
2. **school_allowed_emails** - Allowed email domains/emails per school

### Modified Tables

1. **schools** - Add product_admin_id, allowed_email_domains
2. **teachers** - No changes needed
3. **students** - No changes needed

---

## 🔐 Authentication Flow

### Login Process

1. User clicks "Sign in with Google"
2. Google OAuth → Returns email
3. Check user role:
   - **Product Admin?** → Product Admin Dashboard
   - **School Admin?** → School Admin Dashboard
   - **Teacher/Principal?** → Check if email is allowed
     - If allowed → Teacher/Principal Dashboard
     - If not allowed → Access Denied

### Allowed Emails System

- School Admin defines:
  - **Email domains** (e.g., `@schoolname.com`)
  - **Specific emails** (e.g., `teacher1@gmail.com`)
- Only emails matching these can login as Teacher/Principal

---

## 🎯 User Flows

### Flow 1: Product Admin Onboards School

1. Product Admin logs in
2. Goes to "Add New School"
3. Enters:
   - School name, address, contact
   - School Admin email (must be Google email)
4. System creates:
   - School record
   - School Admin account (role: 'admin', school_id: new school)
5. School Admin receives email (optional) or can login immediately

### Flow 2: School Admin Sets Up School

1. School Admin logs in
2. First time → Onboarding flow:
   - Add teachers (manual or CSV)
   - Add students (manual or CSV)
   - Add principals (manual or CSV)
   - Define allowed email domains/emails
3. After setup → School Admin Dashboard:
   - Manage teachers
   - Manage students
   - Manage principals
   - Manage allowed emails
   - View reports

### Flow 3: Teacher/Principal Uses System

1. Teacher/Principal logs in with Google
2. System checks:
   - Email matches allowed emails/domains?
   - User exists in teachers table?
3. If yes → Dashboard
4. If no → Access Denied

---

## 📱 Pages Structure

### Product Admin Pages
- `product-admin-dashboard.html` - Main dashboard
- `product-admin-schools.html` - List all schools
- `product-admin-add-school.html` - Onboard new school

### School Admin Pages
- `admin-dashboard.html` - School management (existing, enhanced)
- `admin-teachers.html` - Manage teachers
- `admin-students.html` - Manage students
- `admin-allowed-emails.html` - Manage allowed emails

### Teacher/Principal Pages
- `teacher-dashboard.html` - Mark attendance (existing)
- `principal-dashboard.html` - View reports (existing)

---

## 🔒 Security & RLS Policies

### Product Admin
- Can view all schools
- Can create schools
- Can view all data (for support)

### School Admin
- Can only view/manage their school
- Can manage teachers/students/principals
- Can define allowed emails

### Teachers/Principals
- Can only view their assigned classes
- Must have email in allowed list
- Must exist in teachers table

---

## ✅ Implementation Checklist

- [ ] Update database schema
- [ ] Create product admin dashboard
- [ ] Update school admin dashboard
- [ ] Add allowed emails management
- [ ] Update authentication logic
- [ ] Update RLS policies
- [ ] Create routing logic
- [ ] Test all flows

---

**Status:** Ready for implementation

