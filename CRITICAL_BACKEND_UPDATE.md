# 🚨 CRITICAL: Backend Update Required

## The Problem
You're getting **302 redirect errors** and **CORS errors** because:
1. Apps Script Web App is trying to do OAuth authentication
2. This causes a 302 redirect which browsers block in CORS requests
3. The backend code needs to be **updated and redeployed** to accept `userEmail` parameter

## ✅ The Solution

### Step 1: Update Apps Script Backend Code

1. **Open your Google Apps Script project**
   - Go to: https://script.google.com
   - Open your ClassLedger project

2. **Copy the updated Code.gs**
   - Open `backend/Code.gs` from this repository
   - **Select ALL** (Ctrl+A or Cmd+A)
   - **Copy** (Ctrl+C or Cmd+C)

3. **Paste into Apps Script**
   - In Apps Script editor, select ALL existing code
   - **Paste** (Ctrl+V or Cmd+V) - this replaces everything
   - **Save** (Ctrl+S or Cmd+S)

4. **Verify the code has these changes:**
   - Line 194: `function getUserFromRequest(e)` - accepts event parameter
   - Line 201: Checks for `e.parameter.userEmail`
   - Line 733-760: `doGet` function logs parameters and checks userEmail

### Step 2: Redeploy Web App (CRITICAL!)

1. **Go to Deploy → Manage deployments**
2. **Click the pencil icon** (edit) next to your current deployment
3. **Under "Version"**, select **"New version"**
4. **Click "Deploy"**
5. **Copy the Web App URL** (should be the same, but verify)

### Step 3: Verify Deployment Settings

Make sure your Web App is deployed with:
- **Execute as**: Me
- **Who has access**: **Anyone** (or "Anyone with Google account")

⚠️ **If set to "Only myself", it won't work for other users!**

### Step 4: Test

1. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Open browser DevTools** (F12) → Console tab
3. **Login again**
4. **Check console logs:**
   - Should see: "Current user from sessionStorage:"
   - Should see: "Final API Request URL: ...&userEmail=..."
   - Should NOT see: "302 redirect" or "CORS error"

## 🔍 How to Verify Backend is Updated

### Check Apps Script Execution Logs:

1. In Apps Script, go to **Executions** (left sidebar)
2. Click on a recent execution
3. Look for logs like:
   ```
   doGet called with action: getSchool
   userEmail parameter: tarka.org@gmail.com
   getUserFromRequest returned: user found
   ```

### If you see "userEmail parameter: not provided":
- The frontend is not sending it (check browser console)
- Or the backend code is not updated

### If you see "userEmail parameter: tarka.org@gmail.com" but still get Unauthorized:
- Check if email exists in `Teacher_Master` sheet
- Check if `active` column is `TRUE`
- Check email matches exactly (case-sensitive)

## 🐛 Troubleshooting

### Still getting 302 redirect?
- **Backend not updated**: Make sure you copied the latest `Code.gs`
- **Not redeployed**: You MUST create a NEW version and deploy
- **Wrong deployment**: Make sure you're using the `/exec` URL, not `/dev`

### Still getting CORS error?
- **Backend not updated**: The new code handles userEmail before OAuth
- **Browser cache**: Clear cache and hard refresh
- **Wrong URL**: Verify you're using the correct Web App URL

### Getting "Unauthorized" even with userEmail?
- **Email not in sheet**: Check `Teacher_Master` sheet
- **Email mismatch**: Check exact spelling (case-sensitive)
- **Not active**: Check `active` column is `TRUE`

## 📝 Quick Checklist

- [ ] Copied latest `Code.gs` from repository
- [ ] Pasted into Apps Script (replaced all code)
- [ ] Saved the file
- [ ] Created NEW version in deployment
- [ ] Redeployed Web App
- [ ] Verified deployment settings (Anyone access)
- [ ] Cleared browser cache
- [ ] Tested login
- [ ] Checked browser console for errors
- [ ] Checked Apps Script execution logs

## 🆘 Still Not Working?

If after following all steps it still doesn't work:

1. **Share Apps Script execution logs** (from Executions tab)
2. **Share browser console logs** (F12 → Console)
3. **Verify Web App URL** matches the one in `frontend/js/auth.js`
4. **Check Teacher_Master sheet** - verify email exists and is active

The backend code MUST be updated and redeployed for this to work!

