# Demo Data Generation Guide

## Overview

This guide helps you generate realistic dummy data for **Attendance_Log** and **Audit_Log** sheets to demonstrate ClassLedger effectively.

## Quick Start

### Step 1: Copy Demo Data Script

1. Open `ClassLedger_Setup/GenerateDemoData.gs` from this repository
2. Copy the entire file content

### Step 2: Add to Apps Script Project

1. Open your Apps Script project: https://script.google.com
2. Click **+** (Add file) → **Script**
3. Name it: `GenerateDemoData`
4. Paste the copied code
5. **Save** (Ctrl+S / Cmd+S)

### Step 3: Update Configuration

In the `GenerateDemoData.gs` file, update these values in the `DEMO_CONFIG` section:

```javascript
const DEMO_CONFIG = {
  // These will auto-read from Script Properties if set
  attendanceLogSheetId: 'YOUR_ATTENDANCE_LOG_SHEET_ID', // Or leave as is if Script Properties set
  auditLogSheetId: 'YOUR_AUDIT_LOG_SHEET_ID', // Or leave as is if Script Properties set
  studentMasterSheetId: 'YOUR_STUDENT_MASTER_SHEET_ID', // Or leave as is if Script Properties set
  teacherMasterSheetId: 'YOUR_TEACHER_MASTER_SHEET_ID', // Or leave as is if Script Properties set
  
  // Demo settings - UPDATE THESE
  daysToGenerate: 7, // Generate data for last 7 days
  teacherEmail: 'your-email@gmail.com', // Your teacher email
  schoolId: 'SCH001', // Your school ID
  className: 'Class 1' // Your class name
};
```

**Note**: If you've already set Script Properties, the script will automatically use those. Just update the demo settings (teacherEmail, schoolId, className).

### Step 4: Run the Script

1. In Apps Script editor, select function: `generateDemoData`
2. Click **Run** (▶️)
3. **Authorize** if prompted (first time only)
4. Check **Execution log** for results

### Step 5: Verify Data

1. Open your **Attendance_Log** sheet
2. You should see attendance records for the last 7 days
3. Open your **Audit_Log** sheet
4. You should see audit entries for various actions

## What Data is Generated?

### Attendance_Log Data

- **Time Period**: Last 7 days (configurable)
- **Weekends**: Skipped (only weekdays)
- **Status Distribution**:
  - 70% Present (P)
  - 20% Absent (A)
  - 10% Late (L)
- **Check-in Times**: 
  - Present: 08:00 - 08:45 (random)
  - Late: 09:15
  - Absent: No check-in record
- **Check-out**: 80% of present/late students have check-out records at 14:30

### Audit_Log Data

- **Actions Generated**:
  - `MARK_ATTENDANCE` (most common)
  - `EDIT_ATTENDANCE`
  - `VIEW_REPORT`
  - `EXPORT_DATA`
- **Frequency**: 3-5 entries per day
- **Time Range**: 8 AM to 4 PM (random times)
- **Metadata**: Realistic JSON with student IDs, dates, statuses

## Customization Options

### Generate More Days

```javascript
daysToGenerate: 14, // Generate for last 14 days
```

### Include Weekends

Comment out the weekend skip logic in `generateAttendanceData()`:

```javascript
// Skip weekends (optional - comment out if you want weekend data)
// const dayOfWeek = date.getDay();
// if (dayOfWeek === 0 || dayOfWeek === 6) {
//   continue;
// }
```

### Change Status Distribution

In `generateAttendanceData()`, modify the random logic:

```javascript
// Current: 70% Present, 20% Absent, 10% Late
if (rand < 0.2) {
  // Absent
} else if (rand < 0.3) {
  // Late
} else {
  // Present
}

// Example: 80% Present, 15% Absent, 5% Late
if (rand < 0.15) {
  // Absent
} else if (rand < 0.20) {
  // Late
} else {
  // Present
}
```

## Clear Demo Data

If you want to start fresh:

1. Select function: `clearDemoData`
2. Click **Run**
3. **Warning**: This will delete all data in Attendance_Log and Audit_Log (except headers)

## Troubleshooting

### Error: "No students found"

**Problem**: No students match your configuration

**Solution**:
1. Check `Student_Master` sheet has students
2. Verify `schoolId` and `className` match your data
3. Update `DEMO_CONFIG` with correct values

### Error: "Sheet not found"

**Problem**: Sheet ID is incorrect or sheet doesn't exist

**Solution**:
1. Verify Sheet IDs in Script Properties
2. Or update `DEMO_CONFIG` with correct Sheet IDs
3. Check sheet names match exactly: "Attendance_Log", "Audit_Log", "Student_Master"

### No Data Generated

**Problem**: Script ran but no data appeared

**Solution**:
1. Check Execution log for errors
2. Verify students exist in Student_Master
3. Check date range (might be all weekends)
4. Verify Sheet IDs are correct

## Sample Output

### Attendance_Log Sample

| log_id | date | day | time | student_id | school_id | class | status | type | teacher_email | remark |
|--------|------|-----|------|------------|-----------|-------|--------|------|---------------|--------|
| LOG202401151234 | 2024-01-15 | Monday | 08:30 | STU001 | SCH001 | Class 1 | P | CHECK_IN | teacher@example.com | |
| LOG202401151235 | 2024-01-15 | Monday | 14:30 | STU001 | SCH001 | Class 1 | | CHECK_OUT | teacher@example.com | |
| LOG202401151236 | 2024-01-15 | Monday | 09:15 | STU002 | SCH001 | Class 1 | L | CHECK_IN | teacher@example.com | Late due to traffic |

### Audit_Log Sample

| timestamp | email | action | metadata |
|-----------|-------|--------|----------|
| 2024-01-15 08:30:00 | teacher@example.com | MARK_ATTENDANCE | {"student_id":"STU001","status":"P","type":"CHECK_IN","date":"2024-01-15"} |
| 2024-01-15 10:15:00 | teacher@example.com | VIEW_REPORT | {"report_type":"daily","date":"2024-01-15","class":"Class 1"} |

## Best Practices for Demo

1. **Generate 7-14 days** of data for realistic demo
2. **Include variety**: Mix of Present, Absent, Late
3. **Check reports**: Generate data, then show reports/dashboards
4. **Show trends**: With 7+ days, you can show attendance trends
5. **Audit trail**: Show how all actions are logged

## Next Steps

After generating demo data:

1. **Test Reports**: View attendance reports in Admin/Principal dashboards
2. **Show Trends**: Demonstrate attendance patterns over time
3. **Audit Trail**: Show how all actions are logged
4. **Real-time Demo**: Mark new attendance to show live updates

---

**Ready to demo!** 🎉

