# ClassLedger - Complete Deployment Guide

This guide will help you deploy ClassLedger step-by-step.

---

## 📋 TABLE OF CONTENTS

1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Google Sheets Setup](#2-google-sheets-setup)
3. [Apps Script Setup](#3-apps-script-setup)
4. [WhatsApp Setup (Optional)](#4-whatsapp-setup-optional)
5. [Frontend Configuration](#5-frontend-configuration)
6. [Testing Steps](#6-testing-steps)
7. [Live Deployment](#7-live-deployment)
8. [WhatsApp Message Verification](#8-whatsapp-message-verification)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. PRE-DEPLOYMENT CHECKLIST

### Required Items:
- [ ] Google Account (with Sheets and Apps Script access)
- [ ] Internet connection
- [ ] Laptop/Computer
- [ ] WhatsApp Business API credentials (if WhatsApp alerts are needed)

### Time Required:
- **Basic Setup**: 30-45 minutes
- **With WhatsApp**: 1-2 hours (Meta Business setup time included)

---

## 2. GOOGLE SHEETS SETUP

### Step 2.1: Create Main Spreadsheet

1. **Open Google Sheets**: [sheets.google.com](https://sheets.google.com)
2. **Create new spreadsheet**: Click on "Blank"
3. **Name it**: "ClassLedger_Database" (or any name)
4. **Copy Sheet ID from URL**:
   - The ID is between `/d/` and `/edit` in the URL
   - Example: `https://docs.google.com/spreadsheets/d/1ABC123XYZ456/edit`
   - Sheet ID: `1ABC123XYZ456`
   - **Save this ID - you'll need it later**

### Step 2.2: Create 6 Tabs (Sheets)

Create the following tabs in your spreadsheet:

#### Tab 1: School_Master
1. Rename tab to "School_Master"
2. Add headers in Row 1:
   ```
   school_id | school_name | active
   ```
3. Add sample data:
   ```
   SCH001 | ABC Public School | TRUE
   ```

#### Tab 2: Student_Master
1. Rename tab to "Student_Master"
2. Add headers in Row 1:
   ```
   student_id | school_id | name | class | section | roll | parent_mobile | active | whatsapp_alert_enabled | parent_name
   ```
3. Add sample data (at least 2-3 students):
   ```
   STU001 | SCH001 | Ram Kumar | Class 1 | A | 1 | 919876543210 | TRUE | TRUE | Ram Singh
   STU002 | SCH001 | Sita Devi | Class 1 | A | 2 | 919876543211 | TRUE | TRUE | Sita Sharma
   ```
   **Important**: 
   - `parent_mobile` should include country code (91XXXXXXXXXX)
   - `whatsapp_alert_enabled` = TRUE (if WhatsApp alerts are needed)
   - `parent_name` should be in Hindi for WhatsApp messages

#### Tab 3: Teacher_Master
1. Rename tab to "Teacher_Master"
2. Add headers in Row 1:
   ```
   email | name | role | school_id | class_assigned | active
   ```
3. **Add your own email** (the Google account you'll use to login):
   ```
   your-email@gmail.com | Your Name | teacher | SCH001 | Class 1 | TRUE
   ```
   **Important**: Email must exactly match your Google account email

#### Tab 4: Attendance_Log
1. Rename tab to "Attendance_Log"
2. Add headers in Row 1:
   ```
   log_id | date | day | time | student_id | school_id | class | status | type | teacher_email | remark
   ```
3. **Keep data rows empty** - system will fill automatically

#### Tab 5: Audit_Log
1. Rename tab to "Audit_Log"
2. Add headers in Row 1:
   ```
   timestamp | email | action | metadata
   ```
3. **Keep data rows empty** - system will fill automatically

#### Tab 6: WhatsApp_Log
1. Rename tab to "WhatsApp_Log"
2. Add headers in Row 1:
   ```
   timestamp | student_id | parent_mobile | status | response
   ```
3. **Keep data rows empty** - system will fill automatically

### Step 2.3: Verify Setup

- [ ] All 6 tabs created
- [ ] Headers are correct (exact spelling)
- [ ] At least 1 school, 2-3 students, and 1 teacher added
- [ ] Sheet ID copied and saved

---

## 3. APPS SCRIPT SETUP

### Step 3.1: Create Apps Script Project

1. **Open Apps Script**: [script.google.com](https://script.google.com)
2. Click **New Project**
3. **Name the project**: "ClassLedger Backend"
4. **Delete default Code.gs content** (all content)

### Step 3.2: Copy Backend Code

1. Open `backend/Code.gs` file in this project
2. **Copy all code** (Ctrl+A, Ctrl+C)
3. **Paste in Apps Script editor** (Ctrl+V)
4. **Save** (Ctrl+S or File > Save)

### Step 3.3: Configure Script Properties

1. In Apps Script, click **Project Settings** (⚙️ gear icon)
2. Go to **Script Properties** section
3. Click **Add script property** button
4. Add the following properties (one by one):

   | Property Name | Value | Notes |
   |--------------|-------|-------|
   | `SHEET_ID_SCHOOL_MASTER` | Your Sheet ID | Copied in Step 2.1 |
   | `SHEET_ID_STUDENT_MASTER` | **Same Sheet ID** | All tabs are in same spreadsheet |
   | `SHEET_ID_TEACHER_MASTER` | **Same Sheet ID** | |
   | `SHEET_ID_ATTENDANCE_LOG` | **Same Sheet ID** | |
   | `SHEET_ID_AUDIT_LOG` | **Same Sheet ID** | |
   | `SHEET_ID_WHATSAPP_LOG` | **Same Sheet ID** | |

   **Important**: If all tabs are in the same spreadsheet, use the same Sheet ID for all.

5. Click **Save**

### Step 3.4: Enable Required Services

1. In Apps Script, click **Services** (in left sidebar)
2. Click **+ Add a service**
3. Add **Google Sheets API** (if not already added)
4. Add **Google Drive API** (if not already added)

### Step 3.5: Set Timezone

1. Go to **Project Settings**
2. Select **Timezone**: **(GMT+05:30) India Standard Time**
3. Click **Save**

### Step 3.6: Deploy as Web App

1. Click **Deploy** button
2. Select **New deployment**
3. Click ⚙️ gear icon next to **Select type**
4. Select **Web app**
5. Configure:
   - **Description**: "ClassLedger API v1"
   - **Execute as**: **Me** (your account)
   - **Who has access**: **Anyone** (required for OAuth)
6. Click **Deploy**
7. **Authorize access** (if prompted)
8. **Copy Web App URL** - This is very important!
   - Example: `https://script.google.com/macros/s/AKfycby.../exec`
   - **Save this URL**

### Step 3.7: First Authorization

1. After deployment, **Authorize access** prompt will appear
2. Click **Review permissions**
3. Click **Advanced**
4. Click **Go to [Project Name] (unsafe)**
5. Click **Allow**
6. Click **Done**

---

## 4. WHATSAPP SETUP (OPTIONAL)

Skip this section if you don't need WhatsApp alerts.

### Step 4.1: Meta Business Account Setup

1. **Open Meta Business Manager**: [business.facebook.com](https://business.facebook.com)
2. **Create Account** or use existing account
3. Verify business (if required)

### Step 4.2: Create WhatsApp App

1. **Open Meta for Developers**: [developers.facebook.com](https://developers.facebook.com)
2. Click **My Apps** > **Create App**
3. Select **Business** type
4. Enter app name: "ClassLedger WhatsApp"
5. Click **Create App**

### Step 4.3: Add WhatsApp Product

1. In app dashboard, click **Add Product**
2. Select **WhatsApp** product
3. Click **Set Up**
4. Follow **Get Started**

### Step 4.4: Get Credentials

1. Go to **WhatsApp** > **API Setup** section
2. Copy **Phone Number ID**
   - Example: `123456789012345`
3. Copy **Temporary access token**
   - **Note**: This expires in 24 hours
   - For production, you'll need to create a permanent token

### Step 4.5: Add to Script Properties

1. In Apps Script, go to **Project Settings** > **Script Properties**
2. Add:

   | Property Name | Value |
   |--------------|-------|
   | `WHATSAPP_TOKEN` | Your access token |
   | `PHONE_NUMBER_ID` | Your phone number ID |

3. Click **Save**

### Step 4.6: Setup Trigger (Automated Alerts)

1. In Apps Script, click **Triggers** (⏰ clock icon)
2. Click **+ Add Trigger**
3. Configure:
   - **Function**: `triggerWhatsAppAbsentAlerts`
   - **Event source**: **Time-driven**
   - **Type**: **Day timer**
   - **Time**: **10:30 AM to 11:00 AM**
   - **Timezone**: **(GMT+05:30) India Standard Time**
4. Click **Save**

---

## 5. FRONTEND CONFIGURATION

### Step 5.1: Update API URL

1. Open `frontend/js/auth.js` file in this project
2. Find line 8:
   ```javascript
   const API_URL = 'YOUR_WEB_APP_URL';
   ```
3. Replace with your Web App URL (copied in Step 3.6):
   ```javascript
   const API_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
   ```
4. Click **Save**

### Step 5.2: Host Frontend Files

You have 2 options:

#### Option A: Google Sites / GitHub Pages (Recommended)
- Host frontend files
- Access `index.html` from public URL

#### Option B: Local Testing
- Keep files on local computer
- Open `index.html` directly in browser
- **Note**: OAuth will work, but proper hosting is required for production

---

## 6. TESTING STEPS

### Test 1: Basic Authentication

1. Open `index.html`
2. Click **"Login as School Staff"**
3. Login with Google account (the one added in Teacher_Master)
4. **Expected**: Dashboard should appear
5. **If fails**: 
   - Check email in Teacher_Master is correct
   - Check `active` = TRUE

### Test 2: Student List Loading

1. Go to Teacher dashboard
2. Select a class
3. **Expected**: Student list should appear
4. **If fails**: 
   - Check Student_Master has data
   - Check `school_id` and `class` match

### Test 3: Mark Attendance

1. Click **"Present"** for any student in the list
2. **Expected**: 
   - Button should highlight
   - Summary should update
   - Entry should be added to Attendance_Log
3. **Verify**: Check Attendance_Log sheet

### Test 4: Check Audit Log

1. After marking attendance
2. Check Audit_Log sheet
3. **Expected**: New entry should appear
4. **Verify**: Action type should be "MARK_ATTENDANCE_CHECK_IN"

### Test 5: Admin Dashboard

1. Login with admin role
2. Open Admin dashboard
3. Select class and date
4. **Expected**: 
   - Absent students list should appear
   - Statistics should appear
5. **Verify**: Data is correct

### Test 6: WhatsApp Alert (Manual)

If WhatsApp is setup:

1. In Apps Script, click **Run** button
2. Select function: `testWhatsAppAlert` (if added)
   Or manually run:
   ```javascript
   function testWhatsApp() {
     const student = {
       studentId: 'STU001',
       name: 'Test Student',
       parentMobile: '919876543210',
       whatsappAlertEnabled: true
     };
     const result = sendWhatsAppAbsentAlert(student, '2024-01-01');
     console.log(result);
   }
   ```
3. Click **Run**
4. **Expected**: 
   - Result should appear in console
   - Entry should be added to WhatsApp_Log
5. **Verify**: 
   - Check WhatsApp_Log sheet
   - Status should be "SENT"
   - Message should arrive on phone

---

## 7. LIVE DEPLOYMENT

### Step 7.1: Pre-Live Verification Checklist

#### Google Sheets:
- [ ] All 6 tabs properly setup
- [ ] Real school data added
- [ ] All teachers added
- [ ] All students added
- [ ] Parent mobile numbers are correct (for WhatsApp)

#### Apps Script:
- [ ] All Script Properties set
- [ ] Web App deployed
- [ ] Timezone set to IST
- [ ] Services enabled
- [ ] Authorization complete

#### WhatsApp (if using):
- [ ] Meta Business account verified
- [ ] WhatsApp credentials added
- [ ] Trigger setup
- [ ] Test message successfully sent

#### Frontend:
- [ ] API URL updated
- [ ] Files properly hosted
- [ ] All pages accessible

### Step 7.2: Final Testing

1. **Complete Flow Test**:
   - Login → Dashboard → Mark Attendance → Check Logs
   - Test all features

2. **Multi-User Test**:
   - Login with different teachers
   - Check role-based access

3. **Data Verification**:
   - Check entries in Attendance_Log
   - Check actions in Audit_Log
   - Verify data accuracy

### Step 7.3: Go Live

1. **Share Access**:
   - Provide login credentials to teachers
   - Share frontend URL

2. **Monitor First Day**:
   - Check attendance marking
   - Monitor errors
   - Verify WhatsApp alerts (if setup)

3. **Daily Checks**:
   - Review Attendance_Log
   - Check Audit_Log
   - Verify WhatsApp_Log

---

## 8. WHATSAPP MESSAGE VERIFICATION

### How to Confirm Message Was Sent Successfully?

#### Method 1: WhatsApp_Log Sheet Check

1. Open **WhatsApp_Log** sheet
2. Check latest entry:
   - **timestamp**: Time when message was sent
   - **student_id**: Which student
   - **parent_mobile**: Which phone number
   - **status**: 
     - `SENT` = Message successfully sent ✅
     - `FAILED` = Message failed ❌
     - `SKIPPED` = Message skipped (already sent today)
   - **response**: API response (in JSON format)

3. **Success Example**:
   ```
   status: SENT
   response: {"success":true,"messageId":"wamid.ABC123..."}
   ```

#### Method 2: Check on Phone

1. Check WhatsApp on parent's phone
2. **Expected**: Hindi message should appear:
   ```
   नमस्ते [Parent Name],
   
   आज [Student Name] विद्यालय में उपस्थित नहीं रहे।
   दिनांक: [Date]
   
   ...
   ```

#### Method 3: Audit_Log Check

1. Open **Audit_Log** sheet
2. Check latest entries:
   - Action: `WHATSAPP_ALERT_SENT` = Success ✅
   - Action: `WHATSAPP_ALERT_FAILED` = Failed ❌
   - Check details in metadata

#### Method 4: Apps Script Execution Log

1. In Apps Script, click **Executions** (in left sidebar)
2. Check latest execution
3. View **Logs**:
   - Success messages
   - Error messages (if any)

---

## 9. TROUBLESHOOTING

### Where to Check if WhatsApp Message Fails?

#### Step 1: WhatsApp_Log Sheet

1. Open **WhatsApp_Log** sheet
2. Check **status** in latest entry:
   - If `FAILED`, check **response** column
   - See error message

#### Common Errors and Solutions:

**Error 1: "Invalid OAuth access token"**
- **Problem**: Token expired or invalid
- **Solution**: 
  1. Go to Meta Business Manager
  2. Generate new token
  3. Update in Script Properties

**Error 2: "Invalid phone number"**
- **Problem**: Phone number format is wrong
- **Solution**: 
   - Format: `919876543210` (country code + number)
   - No spaces, no + sign
   - Check in Student_Master

**Error 3: "WhatsApp credentials not configured"**
- **Problem**: Credentials not in Script Properties
- **Solution**: 
  1. Check Project Settings > Script Properties
  2. Add `WHATSAPP_TOKEN` and `PHONE_NUMBER_ID`

**Error 4: "Alert already sent today"**
- **Problem**: This is not an error - it's expected behavior
- **Solution**: System sends message only once per day per student
- **Check**: See entry in WhatsApp_Log for same date

**Error 5: "WhatsApp alerts disabled for this student"**
- **Problem**: Alerts disabled for student
- **Solution**: 
  1. Go to Student_Master
  2. Set `whatsapp_alert_enabled` = TRUE

#### Step 2: Audit_Log Check

1. Open **Audit_Log** sheet
2. Check `WHATSAPP_ALERT_FAILED` actions
3. See error details in metadata

#### Step 3: Apps Script Logs

1. In Apps Script, click **Executions**
2. Select failed execution
3. View **Logs**
4. Note error message

#### Step 4: Meta Business Manager

1. Go to Meta Business Manager
2. Check **WhatsApp** > **Message Logs**
3. View failed messages
4. Check error reasons

### Other Common Issues:

**Issue: "Access Denied"**
- **Check**: Email in Teacher_Master is correct
- **Check**: `active` = TRUE
- **Check**: Logged in with correct Google account

**Issue: "Sheet not found"**
- **Check**: Sheet IDs in Script Properties are correct
- **Check**: Tab names match exactly (case-sensitive)

**Issue: "Attendance not saving"**
- **Check**: Attendance_Log sheet permissions
- **Check**: Apps Script has edit access
- **Check**: Errors in Audit_Log

---

## 10. QUICK REFERENCE

### Important URLs:
- Google Sheets: [sheets.google.com](https://sheets.google.com)
- Apps Script: [script.google.com](https://script.google.com)
- Meta Business: [business.facebook.com](https://business.facebook.com)

### Important IDs to Save:
- ✅ Sheet ID (spreadsheet)
- ✅ Web App URL (Apps Script deployment)
- ✅ WhatsApp Phone Number ID
- ✅ WhatsApp Access Token

### Daily Checks:
- ✅ Attendance_Log entries
- ✅ Audit_Log actions
- ✅ WhatsApp_Log status (if setup)
- ✅ Error logs

---

## ✅ FINAL CHECKLIST

Before going live, verify:

- [ ] All sheets properly setup
- [ ] Real data added
- [ ] Apps Script deployed
- [ ] API URL updated in frontend
- [ ] Test attendance marking successful
- [ ] WhatsApp test message sent (if setup)
- [ ] All users can login
- [ ] Role-based access working
- [ ] No errors in logs

---

## 🎉 SUCCESS!

If all steps are complete and testing is successful, your ClassLedger system is **LIVE**!

**Next Steps**:
1. Provide access to teachers
2. Monitor daily
3. Take regular backups (Google Sheets automatically backs up)

**Support**: If there are any issues:
- Check WhatsApp_Log
- Check Audit_Log
- Check Apps Script execution logs

---

**Good Luck! 🚀**

