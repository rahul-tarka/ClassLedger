# 🔍 Debugging "Unauthorized" Error - Complete Guide

## Problem
Getting `{success: false, error: 'Unauthorized'}` even though:
- ✅ userEmail parameter is being sent correctly
- ✅ API returns 200 (no CORS error)
- ✅ Backend receives the request

## Root Cause Analysis

The backend is receiving `userEmail` but `validateUser()` is returning `null`. This means:

### Possible Issues:

1. **Email Not in Teacher_Master Sheet**
   - Check if `tarka.org@gmail.com` exists in column A
   - Verify exact spelling (case-insensitive, but check for typos)

2. **Active Column is FALSE**
   - Check column F (index 5) in Teacher_Master
   - Must be `TRUE` or `true` (case-insensitive)

3. **Backend Code Not Updated**
   - The Apps Script backend MUST be updated with latest code
   - Old code doesn't check userEmail parameter

4. **Email Mismatch**
   - Sheet has: `tarka.org@gmail.com`
   - Request sends: `tarka.org@gmail.com`
   - But there might be hidden characters or spaces

## ✅ Fix Applied

### 1. Changed Authentication Order
**Before**: OAuth first → userEmail fallback  
**After**: userEmail FIRST → OAuth fallback

This prevents 302 redirects that cause CORS issues.

### 2. Added Comprehensive Logging
- `validateUser()` now logs every step
- Shows which email is being checked
- Shows if user is found and active
- Shows exact match results

### 3. Improved Error Handling
- Frontend doesn't clear sessionStorage if userEmail was sent
- Better error messages to identify the issue
- Debug info in response

## 🔧 How to Debug

### Step 1: Check Apps Script Execution Logs

1. Go to Apps Script → **Executions** (left sidebar)
2. Click on recent execution
3. Look for logs like:
   ```
   doGet called with action: getSchool
   userEmail parameter: tarka.org@gmail.com
   validateUser: Checking email: tarka.org@gmail.com
   validateUser: Total rows in sheet: X
   validateUser: Row 1 - Email: ..., Active: true/false, Match: true/false
   ```

### Step 2: Verify Teacher_Master Sheet

Check your Google Sheet:
1. Open `Teacher_Master` sheet
2. Verify row with email `tarka.org@gmail.com`:
   - **Column A**: Email (must match exactly, case-insensitive)
   - **Column F**: Active (must be `TRUE` or `true`)
   - **Column B**: Name
   - **Column C**: Role (teacher/admin/principal)
   - **Column D**: School ID
   - **Column E**: Class Assigned

### Step 3: Check Browser Console

Look for these logs:
```
Current user from sessionStorage: {email: 'tarka.org@gmail.com', ...}
User email found: tarka.org@gmail.com
Added userEmail to URL: ...&userEmail=tarka.org%40gmail.com
API Response data: {success: false, error: 'Unauthorized', debug: {...}}
```

### Step 4: Common Issues

**Issue**: Email exists but still Unauthorized
- **Check**: Active column is `TRUE`?
- **Check**: Email has no extra spaces?
- **Check**: Email matches exactly (case-insensitive)?

**Issue**: userEmail not in debug response
- **Check**: Backend code updated in Apps Script?
- **Check**: Web App redeployed?

**Issue**: SessionStorage cleared after first error
- **Fixed**: Now only clears if userEmail wasn't sent
- **Check**: Browser console for error messages

## 🎯 Expected Behavior After Fix

### Backend Logs (Apps Script):
```
doGet called with action: getSchool
userEmail parameter: tarka.org@gmail.com
getUserFromRequest: Using userEmail parameter: tarka.org@gmail.com
validateUser: Checking email: tarka.org@gmail.com
validateUser: Total rows in sheet: 2
validateUser: Row 1 - Email: tarka.org@gmail.com, Active: true, Match: true
validateUser: User found and authorized!
getUserFromRequest: User found via userEmail parameter
getUserFromRequest returned: user found
```

### Frontend Logs (Browser Console):
```
Current user from sessionStorage: {email: 'tarka.org@gmail.com', ...}
User email found: tarka.org@gmail.com
Added userEmail to URL: ...&userEmail=tarka.org%40gmail.com
API Response status: 200
API Response data: {success: true, data: {...}}
```

## 🚨 If Still Getting Unauthorized

### Check These:

1. **Apps Script Backend Updated?**
   - Copy latest `backend/Code.gs`
   - Paste into Apps Script
   - Save and **Redeploy** (NEW version)

2. **Teacher_Master Sheet Correct?**
   - Email in column A: `tarka.org@gmail.com`
   - Active in column F: `TRUE`
   - No extra spaces or characters

3. **Execution Logs Show What?**
   - Check Apps Script Executions
   - Look for `validateUser` logs
   - See if email matches

4. **Email Format Correct?**
   - Should be: `tarka.org@gmail.com`
   - Not: `Tarka.Org@Gmail.Com` (will be lowercased)
   - Not: ` tarka.org@gmail.com ` (will be trimmed)

## 📝 Quick Checklist

- [ ] Apps Script backend code updated (latest Code.gs)
- [ ] Web App redeployed (NEW version)
- [ ] Email exists in Teacher_Master column A
- [ ] Active column (F) is TRUE
- [ ] No extra spaces in email
- [ ] Checked Apps Script execution logs
- [ ] Checked browser console logs
- [ ] Verified userEmail parameter in request URL

## 🔗 Related Files

- `backend/Code.gs` - Backend authentication logic
- `frontend/js/auth.js` - Frontend API request handling
- `CRITICAL_BACKEND_UPDATE.md` - Backend update instructions

---

**Last Updated**: After comprehensive fix  
**Status**: Ready for debugging with enhanced logging

