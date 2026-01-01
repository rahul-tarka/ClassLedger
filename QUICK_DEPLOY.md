# Quick Deployment Guide - Private Repo

## 🚀 Fastest Option: Netlify (2 Minutes)

### Step 1: Go to Netlify
👉 https://app.netlify.com

### Step 2: Sign up with GitHub
- Click "Sign up"
- Select "GitHub"
- Authorize Netlify

### Step 3: Deploy
1. Click **"Add new site"** → **"Import an existing project"**
2. Select **GitHub**
3. Select repository: **`rahulrathodsubmittable/ClassLedger`**
4. **Build settings**:
   - Base directory: `frontend`
   - Build command: (leave empty)
   - Publish directory: `frontend`
5. Click **"Deploy site"**

### Done! 🎉
Your site will be live in 1-2 minutes at:
```
https://your-site-name.netlify.app
```

---

## Alternative: Surge.sh (1 Minute)

### One Command:
```bash
cd frontend && surge . classledger.surge.sh
```

Or use the script:
```bash
./deploy-surge.sh
```

---

## Alternative: Cloudflare Pages (3 Minutes)

1. Go to: https://dash.cloudflare.com
2. Click **"Pages"** → **"Create a project"**
3. Connect **GitHub** → Select repository
4. Settings:
   - Build output directory: `frontend`
   - Build command: (leave empty)
5. Click **"Save and Deploy"**

---

## Which One to Choose?

- **Netlify**: Best overall (recommended)
- **Surge.sh**: Fastest setup
- **Cloudflare**: Fastest CDN

All are **FREE** and support **private repos**! ✅

