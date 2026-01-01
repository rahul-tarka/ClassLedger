# POST Request CORS Fix - Critical Steps

## 🚨 Current Issue
POST requests (mark attendance buttons) are failing with:
- `Failed to fetch` error
- CORS preflight (OPTIONS) not working
- Network error when clicking Present/Absent/Late buttons

## ✅ Solution - Backend Update Required

### Step 1: Update Apps Script Backend Code

1. **Open Google Apps Script**
   - Go to: https://script.google.com
   - Open your ClassLedger project

2. **Copy Latest Code**
   - Open `backend/Code.gs` from this repository
   - **Select ALL** (Ctrl+A / Cmd+A)
   - **Copy** (Ctrl+C / Cmd+C)

3. **Paste into Apps Script**
   - In Apps Script editor, select ALL existing code
   - **Paste** (Ctrl+V / Cmd+V) - replaces everything
   - **Save** (Ctrl+S / Cmd+S)

4. **Verify These Functions Exist:**
   - ✅ `doOptions(e)` - Line ~766 (handles CORS preflight)
   - ✅ `doPost(e)` - Line ~977 (handles POST requests)
   - ✅ `getUserFromRequest(e)` - Line ~206 (prioritizes userEmail parameter)

### Step 2: Redeploy Web App (CRITICAL!)

**⚠️ This is the most important step - code changes don't take effect until redeployed!**

1. **Go to Deploy → Manage deployments**
2. **Click the pencil icon** (✏️ edit) next to your current deployment
3. **Under "Version"**, select **"New version"** (NOT "Head")
4. **Click "Deploy"**
5. **Copy the Web App URL** (should be the same, but verify)

### Step 3: Verify Deployment Settings

Make sure your Web App deployment has:
- **Execute as**: Me
- **Who has access**: **Anyone** (or "Anyone with Google account")
- **Version**: Latest (the one you just created)

### Step 4: Test POST Requests

1. **Clear browser cache** (Ctrl+Shift+R / Cmd+Shift+R)
2. **Open browser DevTools** (F12) → Console tab
3. **Login to teacher dashboard**
4. **Click Present/Absent/Late button**
5. **Check console logs:**
   - Should see: `apiPost: Making POST request with action: markAttendance`
   - Should see: `API Response status: 200`
   - Should NOT see: `Failed to fetch` or `CORS error`

## 🔍 How to Verify Backend is Updated

### Check Apps Script Logs:
1. In Apps Script editor, go to **Executions** (left sidebar)
2. Click on a recent execution
3. Check logs for:
   - `doPost called`
   - `userEmail parameter: tarka.org@gmail.com`
   - `getUserFromRequest returned: user found`

### Check Frontend Console:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click a button (Present/Absent/Late)
4. Should see:
   - ✅ `apiPost: Added userEmail to endpoint: ?userEmail=...`
   - ✅ `API Response status: 200`
   - ❌ NOT: `Failed to fetch` or `CORS error`

## 🐛 Troubleshooting

### Still Getting "Failed to fetch"?
1. **Verify backend code is updated:**
   - Check if `doOptions()` function exists
   - Check if `doPost()` has logging
   - Check if `getUserFromRequest()` checks `e.parameter.userEmail` first

2. **Verify Web App is redeployed:**
   - Go to Deploy → Manage deployments
   - Check "Version" - should be a number (not "Head")
   - If still "Head", create NEW version

3. **Check Web App URL:**
   - Make sure frontend `API_URL` matches the deployed Web App URL
   - Check `frontend/js/auth.js` line ~15

4. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear cache completely

### Still Getting "Unauthorized"?
1. **Check userEmail is in URL:**
   - Console should show: `Final API Request URL: ...&userEmail=...`
   - If not, check `sessionStorage` has user data

2. **Check Teacher_Master sheet:**
   - Verify your email is in the sheet
   - Check email matches exactly (case-sensitive)

3. **Check backend logs:**
   - Apps Script → Executions
   - Look for `getUserFromRequest` logs
   - Should see: `Using userEmail parameter: ...`

## 📝 Code Changes Summary

### Backend (`backend/Code.gs`):
- ✅ Added `doOptions()` for CORS preflight
- ✅ `doPost()` reads `e.parameter.userEmail`
- ✅ `getUserFromRequest(e)` prioritizes `userEmail` parameter
- ✅ Added comprehensive logging

### Frontend (`frontend/js/auth.js`):
- ✅ `apiPost()` adds `userEmail` to URL parameter
- ✅ Better error messages
- ✅ Detailed logging for debugging

## ✅ Expected Behavior After Fix

1. **GET requests** (load data): ✅ Working
2. **POST requests** (mark attendance): ✅ Should work after backend update
3. **CORS preflight**: ✅ Handled by `doOptions()`
4. **Authentication**: ✅ Uses `userEmail` parameter (no OAuth redirect)

## 🎯 Quick Checklist

- [ ] Backend code updated in Apps Script
- [ ] Web App redeployed (NEW version)
- [ ] Deployment settings: "Anyone" access
- [ ] Browser cache cleared
- [ ] Tested Present button
- [ ] Tested Absent button
- [ ] Tested Late button
- [ ] Checked console for errors
- [ ] Checked Apps Script execution logs

