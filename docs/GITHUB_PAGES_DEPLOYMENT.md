# GitHub Pages Deployment Guide

## Quick Setup (5 Minutes)

### Step 1: Enable GitHub Pages in Repository Settings

1. Go to your repository: `https://github.com/rahulrathodsubmittable/ClassLedger`
2. Click on **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select:
   - **Source**: `GitHub Actions`
5. Click **Save**

### Step 2: Push Code (Already Done!)

The GitHub Actions workflow is already configured. Just push any changes:

```bash
git push origin main
```

### Step 3: Wait for Deployment

1. Go to **Actions** tab in your repository
2. You'll see "Deploy to GitHub Pages" workflow running
3. Wait 1-2 minutes for it to complete
4. Once done, your site will be live at:
   ```
   https://rahulrathodsubmittable.github.io/ClassLedger/
   ```

## Manual Setup (Alternative)

If GitHub Actions doesn't work, you can use the `gh-pages` branch method:

### Option A: Using gh-pages Branch

1. **Create gh-pages branch:**
   ```bash
   git checkout -b gh-pages
   git rm -rf .
   git checkout main -- frontend/
   mkdir -p .
   cp -r frontend/* .
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

2. **In Repository Settings → Pages:**
   - Select **Source**: `Deploy from a branch`
   - Select **Branch**: `gh-pages`
   - Select **Folder**: `/ (root)`
   - Click **Save**

3. **Your site will be live at:**
   ```
   https://rahulrathodsubmittable.github.io/ClassLedger/
   ```

### Option B: Using docs/ Folder

1. **Copy frontend to docs folder:**
   ```bash
   cp -r frontend docs
   ```

2. **Commit and push:**
   ```bash
   git add docs/
   git commit -m "Add docs folder for GitHub Pages"
   git push origin main
   ```

3. **In Repository Settings → Pages:**
   - Select **Source**: `Deploy from a branch`
   - Select **Branch**: `main`
   - Select **Folder**: `/docs`
   - Click **Save**

## Update API URL (Important!)

After deployment, you need to update the API URL in your frontend:

1. **Edit `frontend/js/auth.js`:**
   ```javascript
   const API_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL';
   ```

2. **Or use environment variable** (if using GitHub Actions):
   - Add secret in Repository Settings → Secrets
   - Name: `API_URL`
   - Value: Your Apps Script Web App URL

## Caching Issues - Solution

GitHub Pages doesn't have aggressive caching like Vercel. But if you still face issues:

### Solution 1: Add Cache-Busting to HTML

Add this to your HTML files:
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

### Solution 2: Version Your Assets

Add version query to CSS/JS files:
```html
<link rel="stylesheet" href="css/styles.css?v=2.0">
<script src="js/auth.js?v=2.0"></script>
```

### Solution 3: Hard Refresh

Users can do:
- **Chrome/Edge**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- **Firefox**: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

## Custom Domain (Optional)

If you want to use a custom domain:

1. **Add CNAME file** in your repository root:
   ```
   yourdomain.com
   ```

2. **In Repository Settings → Pages:**
   - Enter your custom domain
   - Follow DNS setup instructions

## Troubleshooting

### Issue: 404 Error
- **Solution**: Make sure `index.html` is in the root of deployed folder
- Check GitHub Actions logs for errors

### Issue: Assets Not Loading
- **Solution**: Check file paths - they should be relative (e.g., `css/styles.css` not `/css/styles.css`)

### Issue: API Calls Failing
- **Solution**: 
  1. Check CORS settings in Apps Script
  2. Verify API_URL is correct
  3. Check browser console for errors

### Issue: Changes Not Reflecting
- **Solution**: 
  1. Clear browser cache
  2. Wait 1-2 minutes (GitHub Pages takes time to update)
  3. Check Actions tab to see if deployment succeeded

## Advantages of GitHub Pages

✅ **No Caching Issues**: Unlike Vercel, GitHub Pages has minimal caching  
✅ **Free**: Completely free for public repositories  
✅ **Fast**: CDN-backed, fast loading  
✅ **Simple**: Easy to set up and maintain  
✅ **Custom Domain**: Support for custom domains  
✅ **HTTPS**: Automatic SSL certificate  

## Deployment Status

Check deployment status:
- **Repository → Actions tab**: See deployment logs
- **Repository → Settings → Pages**: See deployment status and URL

## Quick Commands

```bash
# Check current branch
git branch

# Push to trigger deployment
git push origin main

# Check deployment status
gh workflow view "Deploy to GitHub Pages"
```

---

**Your site will be live at:**
```
https://rahulrathodsubmittable.github.io/ClassLedger/
```

**Note**: Replace `rahulrathodsubmittable` with your actual GitHub username if different.

