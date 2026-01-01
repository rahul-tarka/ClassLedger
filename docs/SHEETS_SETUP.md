# Google Sheets Setup Guide

## Overview

ClassLedger requires **5 Google Sheets** to function. Each sheet serves as a database table.

## Sheet 1: School_Master

**Purpose**: Store all schools in the system

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| school_id | Text | Unique identifier | SCH001 |
| school_name | Text | Full school name | ABC Public School |
| active | Boolean | Is school active | TRUE |

**Setup Steps**:
1. Create a new Google Sheet named "School_Master"
2. Add headers in Row 1: `school_id`, `school_name`, `active`
3. Add sample data:
   - `SCH001 | ABC Public School | TRUE`
   - `SCH002 | XYZ International School | TRUE`
4. Note the Sheet ID from the URL

## Sheet 2: Student_Master

**Purpose**: Store all students across all schools

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| student_id | Text | Unique identifier | STU001 |
| school_id | Text | Foreign key to School_Master | SCH001 |
| name | Text | Student full name | John Doe |
| class | Text | Class name | Class 1, Class 2, Nursery, KG, etc. |
| section | Text | Section | A, B, C |
| roll | Number | Roll number | 1, 2, 3 |
| parent_mobile | Text | Parent contact | +919876543210 |
| active | Boolean | Is student active | TRUE |
| whatsapp_alert_enabled | Boolean | Enable WhatsApp alerts for absent | TRUE/FALSE |
| parent_name | Text | Parent/Guardian name (optional) | राम कुमार |

**Setup Steps**:
1. Create a new Google Sheet named "Student_Master"
2. Add headers in Row 1: `student_id`, `school_id`, `name`, `class`, `section`, `roll`, `parent_mobile`, `active`, `whatsapp_alert_enabled`, `parent_name`
3. Add sample data for testing
4. Note the Sheet ID

**WhatsApp Alert Column**:
- `whatsapp_alert_enabled`: Set to `TRUE` to enable WhatsApp alerts for absent students, `FALSE` to disable
- `parent_name`: Optional - Parent/Guardian name in Hindi. If not provided, system uses "अभिभावक" (Guardian)

## Sheet 3: Teacher_Master

**Purpose**: Store all authorized staff members

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| email | Text | Google email (unique) | teacher@example.com |
| name | Text | Full name | Jane Smith |
| role | Text | teacher/admin/principal | teacher |
| school_id | Text | Foreign key to School_Master | SCH001 |
| class_assigned | Text | Comma-separated classes | Class 1,Class 2 |
| active | Boolean | Is staff active | TRUE |

**Setup Steps**:
1. Create a new Google Sheet named "Teacher_Master"
2. Add headers in Row 1: `email`, `name`, `role`, `school_id`, `class_assigned`, `active`
3. Add your own email for testing (must match Google account)
4. Set role to `teacher`, `admin`, or `principal`
5. Note the Sheet ID

**Important**: The `email` column must match the Google account email used for login.

## Sheet 4: Attendance_Log

**Purpose**: Append-only attendance records (NEVER UPDATE)

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| log_id | Text | Unique identifier | LOG20240101123456 |
| date | Date | Attendance date | 2024-01-01 |
| day | Text | Day of week | Monday |
| time | Text | HH:MM format | 08:30 |
| student_id | Text | Foreign key to Student_Master | STU001 |
| school_id | Text | Foreign key to School_Master | SCH001 |
| class | Text | Class name | Class 1 |
| status | Text | P/A/L (Present/Absent/Late) | P |
| type | Text | CHECK_IN/CHECK_OUT | CHECK_IN |
| teacher_email | Text | Who marked attendance | teacher@example.com |
| remark | Text | Optional note | Late due to traffic |

**Setup Steps**:
1. Create a new Google Sheet named "Attendance_Log"
2. Add headers in Row 1: `log_id`, `date`, `day`, `time`, `student_id`, `school_id`, `class`, `status`, `type`, `teacher_email`, `remark`
3. Leave data rows empty (will be populated by app)
4. Note the Sheet ID

**Important**: This sheet is append-only. Never manually edit or delete rows.

## Sheet 5: Audit_Log

**Purpose**: Track all system actions for audit trail

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| timestamp | DateTime | Action timestamp | 2024-01-01 08:30:00 |
| email | Text | User who performed action | teacher@example.com |
| action | Text | Action type | MARK_ATTENDANCE, EDIT_ATTENDANCE, etc. |
| metadata | Text | JSON string with details | {"student_id":"STU001","status":"P"} |

**Setup Steps**:
1. Create a new Google Sheet named "Audit_Log"
2. Add headers in Row 1: `timestamp`, `email`, `action`, `metadata`
3. Leave data rows empty (will be populated by app)
4. Note the Sheet ID

## Sheet 6: WhatsApp_Log

**Purpose**: Track all WhatsApp alert attempts and results

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| timestamp | DateTime | Alert timestamp | 2024-01-01 10:35:00 |
| student_id | Text | Student ID | STU001 |
| parent_mobile | Text | Parent mobile number | 919876543210 |
| status | Text | SENT/FAILED/SKIPPED | SENT |
| response | Text | JSON string with API response | {"messageId":"wamid.xxx"} |

**Setup Steps**:
1. Create a new Google Sheet named "WhatsApp_Log"
2. Add headers in Row 1: `timestamp`, `student_id`, `parent_mobile`, `status`, `response`
3. Leave data rows empty (will be populated by app)
4. Note the Sheet ID

**Note**: If you use a single spreadsheet with tabs, you can add this as a 6th tab. Otherwise, create a separate sheet and note its ID.

## Consolidation Option (Recommended)

You can create all 6 sheets in a **single Google Spreadsheet** with 6 tabs:

1. Tab 1: "School_Master"
2. Tab 2: "Student_Master"
3. Tab 3: "Teacher_Master"
4. Tab 4: "Attendance_Log"
5. Tab 5: "Audit_Log"
6. Tab 6: "WhatsApp_Log"

This makes it easier to manage and share. Use the same Spreadsheet ID for all sheets in Apps Script configuration.

## Next Steps

After creating all sheets, proceed to `DEPLOYMENT.md` to configure the Apps Script with these Sheet IDs.

