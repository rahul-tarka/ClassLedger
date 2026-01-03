# GitHub Pages 404 Fix - Important Steps

## Problem
After OAuth login, redirecting to `login.html` but getting 404 error.

## Root Cause
GitHub Pages deployment is not working - files are not being deployed to the site.

## Solution

### Step 1: Check GitHub Actions Workflow Status

1. Go to: https://github.com/rahul-tarka/ClassLedger/actions
2. Look for "Deploy to GitHub Pages" workflow
3. Check if it's:
   - ✅ Green (successful) - then wait 2-3 minutes
   - ❌ Red (failed) - click to see error
   - ⏳ Yellow (running) - wait for completion

### Step 2: Manually Trigger Workflow

1. Go to: https://github.com/rahul-tarka/ClassLedger/actions
2. Click "Deploy to GitHub Pages" in left sidebar
3. Click "Run workflow" button (top right)
4. Select branch: `main`
5. Click "Run workflow"
6. Wait 2-3 minutes for completion

### Step 3: Verify GitHub Pages Settings

1. Go to: https://github.com/rahul-tarka/ClassLedger/settings/pages
2. Under "Source":
   - Should be: **"GitHub Actions"** ✅
   - NOT "Deploy from a branch"
3. If wrong, change it and Save

### Step 4: Check Deployment

1. After workflow completes (green ✅)
2. Wait 2-3 minutes
3. Visit: https://rahul-tarka.github.io/ClassLedger/
4. Should see homepage (not 404)

### Step 5: Test Login Again

1. Clear browser cache
2. Visit: https://rahul-tarka.github.io/ClassLedger/
3. Click "Login"
4. Complete Google OAuth
5. Should redirect to dashboard (not 404)

---

## If Still Not Working

Check these:
1. Repository name matches: `rahul-tarka/ClassLedger`
2. Branch is `main` (not `master`)
3. Workflow file exists: `.github/workflows/pages.yml`
4. `frontend/` folder has all files
5. No errors in Actions tab

---

## Quick Test

Run this to verify files exist:
```bash
# Check if index.html exists
ls -la frontend/index.html

# Check if login.html exists  
ls -la frontend/login.html
```

Both should exist!

