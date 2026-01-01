/**
 * ClassLedger Demo Data Generator
 * 
 * This script generates realistic dummy data for Attendance_Log and Audit_Log
 * Perfect for demos and testing
 * 
 * USAGE:
 * 1. Copy this entire file into your Apps Script project
 * 2. Update the configuration section below with your Sheet IDs
 * 3. Run generateDemoData() function
 * 4. Check your sheets - dummy data will be added
 */

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================

/**
 * Get Sheet IDs from Script Properties
 * Make sure you've set these in: Project Settings → Script Properties
 */
function getSheetIds() {
  const props = PropertiesService.getScriptProperties();
  return {
    attendanceLog: props.getProperty('SHEET_ID_ATTENDANCE_LOG'),
    auditLog: props.getProperty('SHEET_ID_AUDIT_LOG'),
    studentMaster: props.getProperty('SHEET_ID_STUDENT_MASTER'),
    teacherMaster: props.getProperty('SHEET_ID_TEACHER_MASTER')
  };
}

/**
 * Get sheet by ID and name (same pattern as main Code.gs)
 */
function getSheet(sheetId, sheetName) {
  try {
    if (!sheetId) {
      throw new Error(`Sheet ID not provided for ${sheetName}. Please set Script Properties.`);
    }
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.getActiveSheet();
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found in spreadsheet ${sheetId}`);
    }
    return sheet;
  } catch (e) {
    throw new Error(`Error accessing sheet "${sheetName}" (ID: ${sheetId}): ${e.message}`);
  }
}

// Demo settings - UPDATE THESE VALUES
const DEMO_CONFIG = {
  daysToGenerate: 7, // Generate data for last 7 days
  teacherEmail: 'tarka.org@gmail.com', // Your teacher email (update this)
  schoolId: 'SCH001', // Your school ID
  className: 'Class 1' // Your class name
};

// ============================================
// MAIN FUNCTION - RUN THIS
// ============================================

/**
 * Generate all demo data (Attendance + Audit Log)
 */
function generateDemoData() {
  console.log('=== Starting Demo Data Generation ===');
  
  try {
    // Get students from Student_Master
    const students = getStudentsForDemo();
    console.log(`Found ${students.length} students`);
    
    if (students.length === 0) {
      throw new Error('No students found! Please add students to Student_Master first.');
    }
    
    // Generate attendance data
    const attendanceCount = generateAttendanceData(students);
    console.log(`Generated ${attendanceCount} attendance records`);
    
    // Generate audit log data
    const auditCount = generateAuditLogData(students);
    console.log(`Generated ${auditCount} audit log entries`);
    
    console.log('=== Demo Data Generation Complete ===');
    console.log(`Total records created: ${attendanceCount + auditCount}`);
    
    return {
      success: true,
      attendanceRecords: attendanceCount,
      auditRecords: auditCount,
      totalRecords: attendanceCount + auditCount
    };
    
  } catch (error) {
    console.error('Error generating demo data:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get students from Student_Master sheet
 */
function getStudentsForDemo() {
  const sheetIds = getSheetIds();
  
  if (!sheetIds.studentMaster) {
    throw new Error('SHEET_ID_STUDENT_MASTER not set in Script Properties! Please set it first.');
  }
  
  const sheet = getSheet(sheetIds.studentMaster, 'Student_Master');
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find column indices
  const studentIdIdx = headers.indexOf('student_id');
  const schoolIdIdx = headers.indexOf('school_id');
  const nameIdx = headers.indexOf('name');
  const classIdx = headers.indexOf('class');
  
  if (studentIdIdx === -1 || schoolIdIdx === -1 || nameIdx === -1 || classIdx === -1) {
    throw new Error('Required columns not found in Student_Master!');
  }
  
  const students = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[studentIdIdx] && row[schoolIdIdx] === DEMO_CONFIG.schoolId && row[classIdx] === DEMO_CONFIG.className) {
      students.push({
        studentId: row[studentIdIdx],
        schoolId: row[schoolIdIdx],
        name: row[nameIdx],
        className: row[classIdx]
      });
    }
  }
  
  return students;
}

/**
 * Generate attendance data for last N days
 */
function generateAttendanceData(students) {
  const sheetIds = getSheetIds();
  
  if (!sheetIds.attendanceLog) {
    throw new Error('SHEET_ID_ATTENDANCE_LOG not set in Script Properties! Please set it first.');
  }
  
  const attendanceSheet = getSheet(sheetIds.attendanceLog, 'Attendance_Log');
  
  const today = new Date();
  const records = [];
  
  // Generate data for last N days
  for (let dayOffset = DEMO_CONFIG.daysToGenerate; dayOffset >= 0; dayOffset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    
    // Skip weekends (optional - comment out if you want weekend data)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue; // Skip Sunday (0) and Saturday (6)
    }
    
    const dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    
    // Generate attendance for each student
    students.forEach((student, index) => {
      // Random status: 70% Present, 20% Absent, 10% Late
      const rand = Math.random();
      let status = 'P'; // Present
      let checkInTime = '08:30'; // Normal time
      let remark = '';
      
      if (rand < 0.2) {
        // 20% chance - Absent (no check-in)
        // Don't create check-in record for absent students
        return;
      } else if (rand < 0.3) {
        // 10% chance - Late
        status = 'L';
        checkInTime = '09:15'; // Late arrival
        remark = 'Late due to traffic';
      } else {
        // 70% chance - Present
        // Slight variation in check-in time (08:00 to 08:45)
        const minutes = Math.floor(Math.random() * 45);
        const hours = 8;
        checkInTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
      
      // Generate log ID
      const logId = `LOG${dateStr.replace(/-/g, '')}${String(index + 1).padStart(4, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      
      // Check-in record
      records.push([
        logId,
        new Date(dateStr),
        dayName,
        checkInTime,
        student.studentId,
        student.schoolId,
        student.className,
        status,
        'CHECK_IN',
        DEMO_CONFIG.teacherEmail,
        remark
      ]);
      
      // Check-out record (only for present/late students, 80% chance)
      if (status !== 'A' && Math.random() < 0.8) {
        const checkOutTime = '14:30'; // Standard check-out time
        const checkOutLogId = `LOG${dateStr.replace(/-/g, '')}${String(index + 1).padStart(4, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
        
        records.push([
          checkOutLogId,
          new Date(dateStr),
          dayName,
          checkOutTime,
          student.studentId,
          student.schoolId,
          student.className,
          '', // No status for check-out
          'CHECK_OUT',
          DEMO_CONFIG.teacherEmail,
          ''
        ]);
      }
    });
  }
  
  // Add all records at once (faster)
  if (records.length > 0) {
    attendanceSheet.getRange(
      attendanceSheet.getLastRow() + 1,
      1,
      records.length,
      records[0].length
    ).setValues(records);
  }
  
  return records.length;
}

/**
 * Generate audit log entries
 */
function generateAuditLogData(students) {
  const sheetIds = getSheetIds();
  
  if (!sheetIds.auditLog) {
    throw new Error('SHEET_ID_AUDIT_LOG not set in Script Properties! Please set it first.');
  }
  
  const auditSheet = getSheet(sheetIds.auditLog, 'Audit_Log');
  
  const today = new Date();
  const records = [];
  
  // Generate audit entries for last N days
  for (let dayOffset = DEMO_CONFIG.daysToGenerate; dayOffset >= 0; dayOffset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue; // Skip weekends
    }
    
    // Generate various audit actions
    const actions = [
      'MARK_ATTENDANCE',
      'MARK_ATTENDANCE',
      'MARK_ATTENDANCE',
      'EDIT_ATTENDANCE',
      'VIEW_REPORT',
      'EXPORT_DATA'
    ];
    
    // Create 3-5 audit entries per day
    const entriesPerDay = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < entriesPerDay; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const student = students[Math.floor(Math.random() * students.length)];
      
      // Create timestamp with random time during school hours
      const timestamp = new Date(date);
      timestamp.setHours(8 + Math.floor(Math.random() * 8)); // 8 AM to 4 PM
      timestamp.setMinutes(Math.floor(Math.random() * 60));
      
      let metadata = {};
      
      switch (action) {
        case 'MARK_ATTENDANCE':
          metadata = {
            student_id: student.studentId,
            status: ['P', 'A', 'L'][Math.floor(Math.random() * 3)],
            type: 'CHECK_IN',
            date: Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd')
          };
          break;
        case 'EDIT_ATTENDANCE':
          metadata = {
            student_id: student.studentId,
            old_status: 'A',
            new_status: 'P',
            date: Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd')
          };
          break;
        case 'VIEW_REPORT':
          metadata = {
            report_type: 'daily',
            date: Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
            class: DEMO_CONFIG.className
          };
          break;
        case 'EXPORT_DATA':
          metadata = {
            export_type: 'attendance',
            date_range: Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd')
          };
          break;
      }
      
      records.push([
        timestamp,
        DEMO_CONFIG.teacherEmail,
        action,
        JSON.stringify(metadata)
      ]);
    }
  }
  
  // Add all records at once
  if (records.length > 0) {
    auditSheet.getRange(
      auditSheet.getLastRow() + 1,
      1,
      records.length,
      records[0].length
    ).setValues(records);
  }
  
  return records.length;
}

/**
 * Clear all demo data (use with caution!)
 */
function clearDemoData() {
  const sheetIds = getSheetIds();
  
  if (!sheetIds.attendanceLog) {
    throw new Error('SHEET_ID_ATTENDANCE_LOG not set in Script Properties!');
  }
  if (!sheetIds.auditLog) {
    throw new Error('SHEET_ID_AUDIT_LOG not set in Script Properties!');
  }
  
  const attendanceSheet = getSheet(sheetIds.attendanceLog, 'Attendance_Log');
  const auditSheet = getSheet(sheetIds.auditLog, 'Audit_Log');
  
  if (attendanceSheet && attendanceSheet.getLastRow() > 1) {
    attendanceSheet.getRange(2, 1, attendanceSheet.getLastRow() - 1, attendanceSheet.getLastColumn())
      .clearContent();
  }
  
  if (auditSheet && auditSheet.getLastRow() > 1) {
    auditSheet.getRange(2, 1, auditSheet.getLastRow() - 1, auditSheet.getLastColumn())
      .clearContent();
  }
  
  console.log('Demo data cleared!');
  return { success: true, message: 'Demo data cleared' };
}

