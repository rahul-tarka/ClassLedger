# Frontend Repository Setup Guide

## Quick Setup (5 Minutes)

### Step 1: Create Public Repository

In your **second GitHub account**:

1. Go to: https://github.com/new
2. Repository name: `ClassLedger-Frontend`
3. Description: `ClassLedger Frontend - School Attendance System`
4. Visibility: **Public** ✅
5. **Don't** initialize with README, .gitignore, or license
6. Click **"Create repository"**

### Step 2: Copy Frontend Files

**Method 1: Using Sync Script (Easiest)**

```bash
# In your main repo directory
./sync-frontend.sh
```

**Method 2: Manual Copy**

```bash
# Navigate to main repo
cd /path/to/ClassLedger

# Create temporary directory
mkdir -p ../ClassLedger-Frontend-temp
cp -r frontend/* ../ClassLedger-Frontend-temp/

# Initialize git in temp directory
cd ../ClassLedger-Frontend-temp
git init
git add .
git commit -m "Initial frontend deployment"

# Add remote (replace with your second account)
git remote add origin https://github.com/YOUR-SECOND-ACCOUNT/ClassLedger-Frontend.git
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to repository: `https://github.com/YOUR-SECOND-ACCOUNT/ClassLedger-Frontend`
2. Click **Settings** tab
3. Scroll to **Pages** section
4. Under **Source**:
   - Select: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/** (root)
5. Click **Save**

### Step 4: Wait for Deployment

- GitHub Pages will deploy automatically
- Wait 1-2 minutes
- Your site will be live at:
  ```
  https://YOUR-SECOND-ACCOUNT.github.io/ClassLedger-Frontend/
  ```

## 🔄 Updating Frontend

### When you make changes in main repo:

**Option 1: Use Sync Script**
```bash
# In main repo
./sync-frontend.sh
```

**Option 2: Manual Update**
```bash
# In main repo
cd frontend
# Make your changes...

# Copy to frontend repo
cd ../ClassLedger-Frontend
git pull origin main
cp -r ../ClassLedger/frontend/* .
git add .
git commit -m "Update frontend"
git push origin main
```

## ✅ Verification Checklist

- [ ] Public repository created
- [ ] Frontend files copied
- [ ] GitHub Pages enabled
- [ ] Site is accessible
- [ ] All pages load correctly
- [ ] API calls working
- [ ] No console errors

## 🎯 Benefits

✅ **Free Hosting** - GitHub Pages is free for public repos  
✅ **No Caching Issues** - Unlike Vercel  
✅ **Fast CDN** - Global content delivery  
✅ **Automatic HTTPS** - SSL certificate included  
✅ **Easy Updates** - Just push to main branch  
✅ **Custom Domain** - Can add your own domain  

## 📝 Notes

- Frontend repo should **only** contain frontend code
- No backend files or sensitive data
- API URL in `auth.js` is safe to expose (it's public anyway)
- Keep main repo private for security

---

**This setup gives you the best of both worlds! 🚀**

