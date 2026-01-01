# Quick Start Guide

## 5-Minute Setup

Follow these steps to get ClassLedger up and running:

### Step 1: Create Google Sheets (5 minutes)

1. Create a new Google Spreadsheet
2. Create 5 tabs with these exact names:
   - `School_Master`
   - `Student_Master`
   - `Teacher_Master`
   - `Attendance_Log`
   - `Audit_Log`

3. Add headers to each tab (see `SHEETS_SETUP.md` for details)

4. Add sample data:
   - **School_Master**: Add at least one school
   - **Teacher_Master**: Add your own email (must match your Google account)
   - **Student_Master**: Add a few test students

5. Copy the Spreadsheet ID from the URL (the long string between `/d/` and `/edit`)

### Step 2: Deploy Apps Script (5 minutes)

1. Go to [script.google.com](https://script.google.com)
2. Create a new project
3. Copy the entire content from `backend/Code.gs`
4. Paste into the Apps Script editor
5. Go to **Project Settings** → **Script Properties**
6. Add these properties (use the same Spreadsheet ID for all):
   - `SHEET_ID_SCHOOL_MASTER` = your spreadsheet ID
   - `SHEET_ID_STUDENT_MASTER` = your spreadsheet ID
   - `SHEET_ID_TEACHER_MASTER` = your spreadsheet ID
   - `SHEET_ID_ATTENDANCE_LOG` = your spreadsheet ID
   - `SHEET_ID_AUDIT_LOG` = your spreadsheet ID

7. Click **Deploy** → **New deployment**
8. Select **Web app**
9. Set:
   - Execute as: **Me**
   - Who has access: **Anyone**
10. Click **Deploy** and copy the Web App URL

### Step 3: Configure Frontend (2 minutes)

1. Open `frontend/js/auth.js`
2. Find the line: `const API_URL = 'YOUR_WEB_APP_URL';`
3. Replace with your Web App URL from Step 2
4. Save the file

### Step 4: Test (3 minutes)

1. Open `frontend/index.html` in a browser
2. Click **"Login as School Staff"**
3. Sign in with the Google account you added to `Teacher_Master`
4. You should see your dashboard!

## Troubleshooting

### "Access Denied" Error
- Check that your email in `Teacher_Master` matches exactly (case-sensitive)
- Ensure `active` column is set to `TRUE`
- Verify you're signed in with the correct Google account

### "Sheet not found" Error
- Verify Sheet IDs in Script Properties match your spreadsheet
- Check that tab names match exactly (case-sensitive)
- Ensure Apps Script has edit access to the spreadsheet

### CORS Errors
- Make sure Web App is deployed (not just saved)
- Verify "Who has access" is set to "Anyone"
- Check that API_URL in frontend matches deployment URL

## Next Steps

- Add more students to `Student_Master`
- Add more teachers/admins to `Teacher_Master`
- Test attendance marking
- Review `Audit_Log` to see action tracking
- Set up Google Drive export (optional)

## Need Help?

Refer to:
- `SHEETS_SETUP.md` for detailed sheet configuration
- `DEPLOYMENT.md` for comprehensive deployment guide
- `README.md` for system overview

