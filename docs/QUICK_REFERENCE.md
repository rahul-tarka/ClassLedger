# ClassLedger - Quick Reference Card

## 🚀 DEPLOYMENT STEPS (Summary)

### 1. Google Sheets Setup (15 min)
```
1. Create new spreadsheet
2. Create 6 tabs: School_Master, Student_Master, Teacher_Master, 
   Attendance_Log, Audit_Log, WhatsApp_Log
3. Add headers (exact spelling)
4. Add sample data (at least 1 school, 2-3 students, 1 teacher)
5. Copy Sheet ID (from URL)
```

### 2. Apps Script Setup (20 min)
```
1. Create new project at script.google.com
2. Copy-paste code from backend/Code.gs
3. Add in Project Settings > Script Properties:
   - SHEET_ID_SCHOOL_MASTER = [Your Sheet ID]
   - SHEET_ID_STUDENT_MASTER = [Same Sheet ID]
   - SHEET_ID_TEACHER_MASTER = [Same Sheet ID]
   - SHEET_ID_ATTENDANCE_LOG = [Same Sheet ID]
   - SHEET_ID_AUDIT_LOG = [Same Sheet ID]
   - SHEET_ID_WHATSAPP_LOG = [Same Sheet ID]
4. Timezone = (GMT+05:30) India Standard Time
5. Deploy > New deployment > Web app
6. Execute as: Me, Who has access: Anyone
7. Copy Web App URL
```

### 3. Frontend Configuration (5 min)
```
1. Open frontend/js/auth.js
2. Line 8: API_URL = [Your Web App URL]
3. Save
```

### 4. WhatsApp Setup (Optional - 30 min)
```
1. Create Meta Business account
2. Setup WhatsApp Business API
3. Get Phone Number ID and Access Token
4. Add in Script Properties:
   - WHATSAPP_TOKEN = [Your token]
   - PHONE_NUMBER_ID = [Your ID]
5. Setup trigger (10:30 AM IST)
```

---

## ✅ TESTING CHECKLIST

### Basic Tests:
- [ ] Login successful (Google OAuth)
- [ ] Student list loading
- [ ] Attendance marking working
- [ ] Entry added to Attendance_Log
- [ ] Action logged in Audit_Log

### WhatsApp Test (if setup):
- [ ] Test message sent
- [ ] Status = SENT in WhatsApp_Log
- [ ] Message received on phone

---

## 🔍 WHATSAPP MESSAGE VERIFICATION

### How to Check if Message Was Sent Successfully?

#### Method 1: WhatsApp_Log Sheet
```
1. Open WhatsApp_Log sheet
2. Check latest entry:
   - status = SENT ✅ (Success)
   - status = FAILED ❌ (Check response column)
   - status = SKIPPED (Already sent today)
```

#### Method 2: Phone Check
```
Check WhatsApp on parent's phone
Hindi message should appear
```

#### Method 3: Audit_Log
```
Check in Audit_Log:
- WHATSAPP_ALERT_SENT = Success ✅
- WHATSAPP_ALERT_FAILED = Failed ❌
```

---

## ❌ TROUBLESHOOTING

### If WhatsApp Message Fails:

1. **Check WhatsApp_Log Sheet**
   - Check Status column
   - Check error message in Response column

2. **Common Errors:**
   - "Invalid OAuth access token" → Token expired, generate new token
   - "Invalid phone number" → Check format (919876543210)
   - "Credentials not configured" → Check Script Properties
   - "Already sent today" → This is normal, duplicate prevention

3. **Check Apps Script Logs**
   - Executions > Latest execution > Logs

---

## 📋 IMPORTANT IDs TO SAVE

```
✅ Sheet ID (spreadsheet)
✅ Web App URL (Apps Script deployment)
✅ WhatsApp Phone Number ID (if setup)
✅ WhatsApp Access Token (if setup)
```

---

## 🔗 IMPORTANT URLs

```
Google Sheets: sheets.google.com
Apps Script: script.google.com
Meta Business: business.facebook.com
```

---

## 📞 DAILY CHECKS

```
✅ Attendance_Log entries
✅ Audit_Log actions
✅ WhatsApp_Log status (if setup)
✅ Error logs
```

---

## 🎯 GO-LIVE CHECKLIST

```
✅ All sheets setup
✅ Real data added
✅ Apps Script deployed
✅ API URL updated
✅ Test attendance successful
✅ WhatsApp test successful (if setup)
✅ All users can login
✅ No errors in logs
```

---

**Detailed Guide**: See `docs/DEPLOYMENT_STEPS.md`
