# Deployment Guide

## Prerequisites

1. Google Account with access to:
   - Google Apps Script
   - Google Sheets (5 sheets created as per SHEETS_SETUP.md)
   - Google Drive (for exports)

## Step 1: Create Apps Script Project

1. Go to [script.google.com](https://script.google.com)
2. Click **"New Project"**
3. Rename project to "ClassLedger Backend"
4. Delete the default `Code.gs` content

## Step 2: Copy Backend Code

1. Open `backend/Code.gs` from this project
2. Copy the entire content
3. Paste into the Apps Script editor
4. Save the project (Ctrl+S / Cmd+S)

## Step 3: Configure Sheet IDs

1. In Apps Script, go to **Project Settings** (gear icon)
2. Under **Script Properties**, add these properties:

   | Property Name | Value | Description |
   |--------------|-------|-------------|
   | `SHEET_ID_SCHOOL_MASTER` | Your Sheet ID | School_Master sheet ID |
   | `SHEET_ID_STUDENT_MASTER` | Your Sheet ID | Student_Master sheet ID |
   | `SHEET_ID_TEACHER_MASTER` | Your Sheet ID | Teacher_Master sheet ID |
   | `SHEET_ID_ATTENDANCE_LOG` | Your Sheet ID | Attendance_Log sheet ID |
   | `SHEET_ID_AUDIT_LOG` | Your Sheet ID | Audit_Log sheet ID |
   | `SHEET_ID_WHATSAPP_LOG` | Your Sheet ID | WhatsApp_Log sheet ID (optional, defaults to Student_Master if not set) |
   
   **Optional (for WhatsApp alerts)**:
   | `WHATSAPP_TOKEN` | Your token | WhatsApp Cloud API access token |
   | `PHONE_NUMBER_ID` | Your ID | WhatsApp phone number ID |

   **Note**: If using a single spreadsheet with tabs, use the same Sheet ID for all.

3. Save the settings

## Step 4: Deploy as Web App

1. Click **"Deploy"** → **"New deployment"**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **"Web app"**
4. Configure:
   - **Description**: "ClassLedger API v1"
   - **Execute as**: "Me" (your account)
   - **Who has access**: "Anyone" (for OAuth to work)
5. Click **"Deploy"**
6. **Copy the Web App URL** (you'll need this for frontend)

## Step 5: Enable Required APIs

1. In Apps Script, go to **"Services"** (left sidebar)
2. Click **"+"** to add a service
3. Add **"Google Sheets API"** (if not already enabled)
4. Add **"Google Drive API"** (for exports)

## Step 6: Authorize the Script

1. Click **"Run"** on any function (e.g., `doGet`)
2. Review permissions and click **"Authorize access"**
3. Select your Google account
4. Click **"Advanced"** → **"Go to [Project Name] (unsafe)"**
5. Click **"Allow"**

## Step 7: Setup Frontend

1. Upload frontend files to a web server OR
2. Use Apps Script HTML Service (see Step 8)

## Step 8: Serve Frontend via Apps Script (Alternative)

If you want to serve HTML from Apps Script:

1. In Apps Script, go to **"Extensions"** → **"Apps Script Dashboard"**
2. Create HTML files:
   - `index.html` (homepage)
   - `login.html` (login page)
   - `teacher-dashboard.html` (teacher UI)
   - `admin-dashboard.html` (admin UI)
   - `principal-dashboard.html` (principal UI)
3. Update `doGet()` in `Code.gs` to serve HTML based on route

## Step 9: Configure Frontend API URL

1. Open all frontend JavaScript files
2. Find the line: `const API_URL = 'YOUR_WEB_APP_URL';`
3. Replace with your Web App URL from Step 4
4. Save all files

## Step 10: Test the Application

1. Open `index.html` in a browser
2. Click **"Login as School Staff"**
3. Sign in with a Google account that exists in `Teacher_Master`
4. Verify role-based dashboard appears
5. Test attendance marking

## Step 11: Setup Google Drive Export (Optional)

1. Create a folder in Google Drive named "ClassLedger Exports"
2. Note the folder ID from the URL
3. Add script property: `DRIVE_EXPORT_FOLDER_ID` = your folder ID
4. The app will auto-export daily attendance to this folder

## Troubleshooting

### "Access Denied" Error
- Verify email exists in `Teacher_Master` sheet
- Check `active` column is `TRUE`
- Ensure email matches exactly (case-sensitive)

### "Sheet not found" Error
- Verify Sheet IDs in Script Properties
- Check sheet names match exactly
- Ensure Apps Script has edit access to sheets

### CORS Errors
- Ensure Web App deployment has "Anyone" access
- Check API URL in frontend matches deployment URL

### OAuth Not Working
- Verify Web App is deployed (not just saved)
- Check "Execute as" is set to "Me"
- Ensure "Who has access" is "Anyone"

## Production Checklist

- [ ] All 5 sheets created and configured
- [ ] Script Properties set with correct Sheet IDs
- [ ] Web App deployed and URL copied
- [ ] Frontend API URL configured
- [ ] Test login with authorized email
- [ ] Test attendance marking
- [ ] Verify audit logs are being created
- [ ] Test role-based access (Teacher/Admin/Principal)
- [ ] Verify Google Drive export (if enabled)
- [ ] Test on mobile device (responsive UI)

## Security Notes

- Never share Script Properties publicly
- Regularly review `Audit_Log` for suspicious activity
- Keep `Teacher_Master` updated with active staff only
- Use strong Google account passwords
- Enable 2FA on Google accounts

## Support

For issues or questions, refer to the main README.md or check the code comments in `Code.gs`.

