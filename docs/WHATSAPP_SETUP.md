# WhatsApp Alert Setup Guide

## Overview

ClassLedger supports WhatsApp alerts for absent students using the **WhatsApp Cloud API (Meta)**. Alerts are sent automatically after the morning attendance window closes (10:30 AM IST) and are sent only in Hindi.

## Prerequisites

1. **Meta Business Account** with WhatsApp Business API access
2. **WhatsApp Business API credentials**:
   - Access Token
   - Phone Number ID
3. **Google Apps Script** with ClassLedger backend deployed

## Step 1: Setup Meta WhatsApp Business API

### 1.1 Create Meta Business Account

1. Go to [business.facebook.com](https://business.facebook.com)
2. Create or use existing Meta Business Account
3. Verify your business (if required)

### 1.2 Setup WhatsApp Business API

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create a new App or use existing app
3. Add **WhatsApp** product to your app
4. Follow the setup wizard to get:
   - **Phone Number ID** (from WhatsApp > API Setup)
   - **Temporary Access Token** (for testing)
   - **Permanent Access Token** (for production - requires app review)

### 1.3 Get Credentials

You'll need:
- **Access Token**: Found in WhatsApp > API Setup > Temporary access token (or use permanent token)
- **Phone Number ID**: Found in WhatsApp > API Setup > Phone number ID

**Important**: 
- Temporary tokens expire in 24 hours
- For production, create a permanent token via App Review
- Store tokens securely (never expose in frontend)

## Step 2: Configure Apps Script

### 2.1 Add Script Properties

1. Open your Apps Script project (ClassLedger backend)
2. Go to **Project Settings** (gear icon) → **Script Properties**
3. Add these properties:

   | Property Name | Value | Description |
   |--------------|-------|-------------|
   | `WHATSAPP_TOKEN` | Your access token | WhatsApp API access token |
   | `PHONE_NUMBER_ID` | Your phone number ID | WhatsApp phone number ID |
   | `SHEET_ID_WHATSAPP_LOG` | Your sheet ID | WhatsApp_Log sheet ID (or same as other sheets if using tabs) |

### 2.2 Set Timezone

1. In Apps Script, go to **Project Settings**
2. Set **Timezone** to **(GMT+05:30) India Standard Time** (IST)
3. This ensures alerts trigger at correct time (after 10:30 AM IST)

## Step 3: Setup WhatsApp_Log Sheet

1. Create a new Google Sheet named "WhatsApp_Log" OR add as a tab in your main spreadsheet
2. Add headers in Row 1:
   - `timestamp`
   - `student_id`
   - `parent_mobile`
   - `status`
   - `response`
3. Note the Sheet ID (if separate sheet)
4. Add Sheet ID to Script Properties as `SHEET_ID_WHATSAPP_LOG`

## Step 4: Update Student_Master

### 4.1 Add WhatsApp Alert Column

1. Open `Student_Master` sheet
2. Add column header: `whatsapp_alert_enabled` (after `active` column)
3. Add column header: `parent_name` (optional, after `whatsapp_alert_enabled`)
4. Set values:
   - `whatsapp_alert_enabled`: `TRUE` to enable alerts, `FALSE` to disable
   - `parent_name`: Parent/Guardian name in Hindi (optional, defaults to "अभिभावक")

### 4.2 Example Data

| student_id | ... | active | whatsapp_alert_enabled | parent_name |
|------------|-----|--------|----------------------|-------------|
| STU001 | ... | TRUE | TRUE | राम कुमार |
| STU002 | ... | TRUE | FALSE | |

## Step 5: Setup Time-Based Trigger

### 5.1 Create Trigger

1. In Apps Script, go to **Triggers** (clock icon)
2. Click **+ Add Trigger**
3. Configure:
   - **Function**: `triggerWhatsAppAbsentAlerts`
   - **Event source**: **Time-driven**
   - **Type**: **Day timer**
   - **Time**: **10:30 AM to 11:00 AM** (or any time after 10:30 AM)
   - **Timezone**: **(GMT+05:30) India Standard Time**
4. Click **Save**

### 5.2 Verify Trigger

- Trigger will run daily after 10:30 AM IST
- Function checks if current time is after 10:30 AM before sending alerts
- Alerts are sent only for absent students with `whatsapp_alert_enabled = TRUE`

## Step 6: Test WhatsApp Alerts

### 6.1 Manual Test

1. In Apps Script, create a test function:

```javascript
function testWhatsAppAlert() {
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

2. Run the test function
3. Check `WhatsApp_Log` sheet for results
4. Verify message received on WhatsApp

### 6.2 Test Trigger

1. Wait for trigger time OR manually run `triggerWhatsAppAbsentAlerts()`
2. Check `WhatsApp_Log` for sent alerts
3. Check `Audit_Log` for action logs
4. Verify messages received

## Step 7: Monitor & Troubleshoot

### 7.1 Check WhatsApp_Log

- **Status = SENT**: Alert sent successfully
- **Status = FAILED**: Alert failed (check response column for error)
- **Status = SKIPPED**: Alert skipped (already sent today, disabled, or invalid mobile)

### 7.2 Common Issues

**Issue**: "WhatsApp credentials not configured"
- **Solution**: Add `WHATSAPP_TOKEN` and `PHONE_NUMBER_ID` to Script Properties

**Issue**: "Invalid parent mobile number"
- **Solution**: Ensure mobile numbers are in format: `919876543210` (country code + number, no + or spaces)

**Issue**: "Alert already sent today"
- **Solution**: This is expected behavior - alerts sent only once per day per student

**Issue**: "API error: Invalid OAuth access token"
- **Solution**: Token expired or invalid - generate new token in Meta Business Manager

**Issue**: "Rate limit exceeded"
- **Solution**: System includes 500ms delay between messages. For high volume, increase delay or use batch API

### 7.3 Rate Limits

WhatsApp Cloud API has rate limits:
- **Free tier**: 1,000 conversations per month
- **Paid tier**: Higher limits based on plan

Monitor usage in Meta Business Manager.

## Step 8: Message Template

The system uses this exact Hindi message (DO NOT MODIFY):

```
नमस्ते {{PARENT_NAME}},

आज {{STUDENT_NAME}} विद्यालय में उपस्थित नहीं रहे।
दिनांक: {{DATE}}

कृपया कक्षा शिक्षक से विद्यालय आकर संपर्क करें
एवं छात्र की अनुपस्थिति का कारण बताते हुए
एक आवेदन पत्र जमा करें।

– {{SCHOOL_NAME}}
(ClassLedger by Tarka)
```

Variables are automatically replaced:
- `{{PARENT_NAME}}`: From `parent_name` column or "अभिभावक"
- `{{STUDENT_NAME}}`: Student name from `Student_Master`
- `{{DATE}}`: Date in DD/MM/YYYY format
- `{{SCHOOL_NAME}}`: School name from `School_Master`

## Security Best Practices

1. **Never expose tokens in frontend code**
2. **Use permanent tokens for production** (not temporary)
3. **Regularly rotate access tokens**
4. **Monitor WhatsApp_Log for suspicious activity**
5. **Review Audit_Log for all alert actions**
6. **Keep Script Properties secure** (only authorized users)

## Optional: Frontend Integration

To enable/disable WhatsApp alerts from admin dashboard:

1. Add checkbox in student list
2. Call API: `updateWhatsAppAlertSetting(studentId, enabled)`
3. See `admin-dashboard.html` for example implementation

## Support

For WhatsApp API issues:
- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Meta Business Support](https://business.facebook.com/help)

For ClassLedger issues:
- Check `WhatsApp_Log` for detailed error messages
- Review `Audit_Log` for action history
- Check Apps Script execution logs

---

**Note**: WhatsApp alerts are sent ONLY for absent students, ONLY after 10:30 AM IST, and ONLY once per student per day.

