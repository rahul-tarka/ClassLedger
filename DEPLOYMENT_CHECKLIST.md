# 🚀 ClassLedger - Production Deployment Checklist

## ✅ Pre-Deployment Steps

### 1. Supabase Setup (CRITICAL - Do This First!)

#### Step 1.1: Run Final Fix SQL
1. Go to Supabase Dashboard: https://app.supabase.com
2. Open **SQL Editor**
3. Copy **ENTIRE** content from `supabase/FINAL_COMPLETE_FIX.sql`
4. Paste in SQL Editor
5. Click **RUN** (or press Cmd/Ctrl + Enter)
6. ✅ Wait for success message: "FINAL FIX APPLIED SUCCESSFULLY!"

#### Step 1.2: Verify Product Admin Exists
Run this query in SQL Editor:
```sql
SELECT * FROM product_admins WHERE active = true;
```

If no product admin exists, add one:
```sql
INSERT INTO product_admins (email, name, active)
VALUES ('your-email@gmail.com', 'Your Name', true);
```

#### Step 1.3: Verify Google OAuth Setup
1. Go to **Authentication** → **Providers** → **Google**
2. Enable Google provider
3. Add **Client ID** and **Client Secret** from Google Cloud Console
4. Add **Redirect URLs**:
   - `https://rahul-tarka.github.io/ClassLedger/login.html`
   - `http://localhost:3000/login.html` (for local testing)

### 2. Frontend Configuration

#### Step 2.1: Verify Supabase Config
Check `frontend/js/supabase-config.js`:
- ✅ `SUPABASE_URL` is correct
- ✅ `SUPABASE_ANON_KEY` is correct

#### Step 2.2: Verify GitHub Pages Deployment
1. Go to GitHub repo: https://github.com/rahul-tarka/ClassLedger
2. Go to **Settings** → **Pages**
3. Verify:
   - ✅ Source: **GitHub Actions**
   - ✅ Branch: **main**
   - ✅ Custom domain (if any): configured

### 3. Test Checklist

#### Test 1: Onboarding Flow
1. Visit: `https://rahul-tarka.github.io/ClassLedger/`
2. Should redirect to `onboarding.html` (if no school exists)
3. Fill school form:
   - School Name
   - Admin Email (must be a valid Gmail)
   - Admin Name
4. Click **Submit**
5. ✅ Should create school and admin successfully
6. ✅ Should move to next step (teachers/students)

#### Test 2: Login Flow
1. Visit: `https://rahul-tarka.github.io/ClassLedger/login.html`
2. Click **Sign in with Google**
3. Select Google account
4. ✅ Should redirect to appropriate dashboard:
   - Product Admin → `product-admin-dashboard.html`
   - School Admin → `admin-dashboard.html`
   - Teacher → `teacher-dashboard.html`
   - Principal → `principal-dashboard.html`

#### Test 3: Product Admin Dashboard
1. Login as Product Admin
2. ✅ Should see schools list
3. ✅ Should be able to add new school
4. ✅ Should see statistics

#### Test 4: School Admin Dashboard
1. Login as School Admin
2. ✅ Should see attendance dashboard
3. ✅ Should be able to manage students
4. ✅ Should be able to manage teachers
5. ✅ Should see reports

## 🔧 Troubleshooting

### Issue: "Unauthorized" Error
**Solution:**
1. Run `supabase/FINAL_COMPLETE_FIX.sql` again
2. Check if product admin exists in database
3. Verify Supabase config in `frontend/js/supabase-config.js`

### Issue: "Infinite Recursion" Error
**Solution:**
1. Run `supabase/FINAL_COMPLETE_FIX.sql` (this fixes all recursion)
2. All policies now use `SECURITY DEFINER` functions

### Issue: OAuth Redirect 404
**Solution:**
1. Check Supabase Redirect URLs include:
   - `https://rahul-tarka.github.io/ClassLedger/login.html`
2. Check `frontend/js/auth-supabase.js` - redirect URL should include base path

### Issue: Onboarding Not Working
**Solution:**
1. Run `supabase/FINAL_COMPLETE_FIX.sql`
2. Check browser console for errors
3. Verify Supabase anon key is correct

## 📋 Final Verification

Before going live, verify:

- [ ] ✅ `FINAL_COMPLETE_FIX.sql` executed successfully
- [ ] ✅ Product Admin exists in database
- [ ] ✅ Google OAuth configured in Supabase
- [ ] ✅ Redirect URLs configured correctly
- [ ] ✅ Supabase config has correct URL and key
- [ ] ✅ GitHub Pages deployed successfully
- [ ] ✅ Onboarding flow works
- [ ] ✅ Login flow works
- [ ] ✅ All dashboards load correctly
- [ ] ✅ No console errors in browser

## 🎉 You're Ready for Production!

Once all checks pass, your product is **LIVE** and ready to use!

---

**Need Help?** Check the `README.md` for detailed documentation.

