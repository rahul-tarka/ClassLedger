# Frontend Migration Guide - Google Apps Script to Supabase

## Overview
Update frontend code to use Supabase instead of Google Apps Script.

---

## Step 1: Add Supabase Client Library

### Option A: CDN (Easiest)
Add to all HTML files before other scripts:

```html
<!-- Add in <head> or before closing </body> -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### Option B: npm (If using build tools)
```bash
npm install @supabase/supabase-js
```

---

## Step 2: Create Supabase Config File

Create `frontend/js/supabase-config.js`:

```javascript
// Supabase Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

## Step 3: Update auth.js

### Replace API_URL with Supabase

**Before (Google Apps Script):**
```javascript
const API_URL = 'https://script.google.com/macros/s/.../exec';
```

**After (Supabase):**
```javascript
// Remove API_URL, use supabase client directly
import { supabase } from './supabase-config.js';
```

### Update Authentication Functions

**Before:**
```javascript
async function checkAuth() {
  const response = await fetch(`${API_URL}?action=auth`);
  // ...
}
```

**After:**
```javascript
async function checkAuth() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }
  
  // Get teacher details
  const { data: teacher } = await supabase
    .from('teachers')
    .select('*')
    .eq('email', user.email)
    .eq('active', true)
    .single();
  
  return teacher ? {
    email: teacher.email,
    name: teacher.name,
    role: teacher.role,
    schoolId: teacher.school_id,
    classAssigned: teacher.class_assigned || []
  } : null;
}
```

### Update Login Function

**Before:**
```javascript
window.location.href = `${API_URL}?action=auth&redirect=...`;
```

**After:**
```javascript
async function login() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/login.html`
    }
  });
}
```

### Update Logout Function

**Before:**
```javascript
async function logout() {
  // Clear sessionStorage
  sessionStorage.removeItem('user');
  window.location.href = 'login.html';
}
```

**After:**
```javascript
async function logout() {
  await supabase.auth.signOut();
  sessionStorage.removeItem('user');
  window.location.href = 'login.html';
}
```

---

## Step 4: Update API Functions

### Replace apiGet() Function

**Before:**
```javascript
async function apiGet(action, params = {}) {
  const url = new URL(API_URL);
  url.searchParams.append('action', action);
  // ... add params
  const response = await fetch(url);
  return response.json();
}
```

**After:**
```javascript
async function apiGet(action, params = {}) {
  switch (action) {
    case 'getStudents':
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', params.schoolId || getCurrentUser().schoolId)
        .eq('class', params.class)
        .eq('active', true)
        .order('roll');
      
      return { success: !error, data: data || [], error: error?.message };
      
    case 'getSchool':
      const { data: school } = await supabase
        .from('schools')
        .select('*')
        .eq('school_id', params.schoolId || getCurrentUser().schoolId)
        .single();
      
      return { success: !!school, data: school };
      
    // ... other cases
  }
}
```

### Replace apiPost() Function

**Before:**
```javascript
async function apiPost(action, data) {
  const formData = new URLSearchParams();
  formData.append('action', action);
  // ... add data
  const response = await fetch(API_URL, {
    method: 'POST',
    body: formData
  });
  return response.json();
}
```

**After:**
```javascript
async function apiPost(action, data) {
  switch (action) {
    case 'markAttendance':
      const logId = `LOG${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const currentDate = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().slice(0, 8);
      
      const { data: attendance, error } = await supabase
        .from('attendance_log')
        .insert({
          log_id: logId,
          date: currentDate,
          time: currentTime,
          student_id: data.studentId,
          school_id: getCurrentUser().schoolId,
          class: data.class,
          status: data.status,
          type: data.type || 'CHECK_IN',
          teacher_email: getCurrentUser().email,
          remark: data.remark || ''
        })
        .select()
        .single();
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      // Log audit
      await supabase.from('audit_log').insert({
        user_email: getCurrentUser().email,
        action: 'MARK_ATTENDANCE',
        details: { studentId: data.studentId, status: data.status }
      });
      
      return { success: true, data: attendance };
      
    // ... other cases
  }
}
```

---

## Step 5: Update Specific Functions

### getStudents() → Use Supabase Query

**Before:**
```javascript
const response = await apiGet('getStudents', { class: className });
```

**After:**
```javascript
const { data: students, error } = await supabase
  .from('students')
  .select('*')
  .eq('school_id', schoolId)
  .eq('class', className)
  .eq('active', true)
  .order('roll');
```

### markAttendance() → Use Supabase Insert

**Before:**
```javascript
const response = await apiPost('markAttendance', {
  studentId, status, type, remark
});
```

**After:**
```javascript
const { data, error } = await supabase
  .from('attendance_log')
  .insert({
    log_id: generateLogId(),
    date: getCurrentDate(),
    time: getCurrentTime(),
    student_id: studentId,
    school_id: schoolId,
    class: className,
    status: status,
    type: type,
    teacher_email: user.email,
    remark: remark
  });
```

---

## Step 6: Real-time Subscriptions

Supabase has built-in real-time! No need for polling.

```javascript
// Subscribe to attendance changes
const subscription = supabase
  .channel('attendance-changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'attendance_log',
    filter: `school_id=eq.${schoolId}`
  }, (payload) => {
    console.log('New attendance:', payload.new);
    // Update UI automatically
    refreshAttendanceList();
  })
  .subscribe();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  subscription.unsubscribe();
});
```

---

## Step 7: Update All Dashboard Files

### teacher.js
- Replace `apiGet('getStudents')` with Supabase query
- Replace `apiPost('markAttendance')` with Supabase insert
- Add real-time subscription for live updates

### admin.js
- Replace all API calls with Supabase queries
- Use Supabase for reports (better performance)
- Add real-time for dashboard updates

### principal.js
- Same as admin.js
- Read-only queries only

---

## Step 8: Testing Checklist

- [ ] Login with Google works
- [ ] Logout works
- [ ] View students list
- [ ] Mark attendance
- [ ] View reports
- [ ] Admin features work
- [ ] Real-time updates work
- [ ] Performance is faster

---

## Migration Order

1. **Setup Supabase** (30 min)
2. **Create schema** (30 min)
3. **Export/Import data** (1 hour)
4. **Update auth.js** (1 hour)
5. **Update teacher.js** (1 hour)
6. **Update admin.js** (2 hours)
7. **Update principal.js** (1 hour)
8. **Test everything** (2 hours)

**Total:** 1-2 days

---

## Rollback Plan

If something goes wrong:
1. Keep Google Sheets as backup
2. Switch API_URL back to Apps Script
3. Fix issues
4. Try again

---

**Next:** We'll create the actual updated frontend files.

