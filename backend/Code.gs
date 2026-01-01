/**
 * ClassLedger by Tarka - Backend API
 * Google Apps Script Backend for School Attendance System
 * 
 * This script provides REST API endpoints for:
 * - Authentication & Authorization
 * - Attendance Management
 * - Data Retrieval (Students, Reports)
 * - Audit Logging
 * 
 * SECURITY: All endpoints validate user against Teacher_Master whitelist
 * 
 * RUNTIME: This script uses V8 runtime (modern JavaScript)
 * - Enable V8 runtime in Apps Script: Run → Enable V8 runtime
 * - V8 provides better performance and modern JavaScript features
 */

// ============================================
// CONFIGURATION
// ============================================

/**
 * Get Sheet IDs from Script Properties
 * Set these in Apps Script Project Settings → Script Properties
 */
function getSheetIds() {
  const props = PropertiesService.getScriptProperties();
  return {
    schoolMaster: props.getProperty('SHEET_ID_SCHOOL_MASTER'),
    studentMaster: props.getProperty('SHEET_ID_STUDENT_MASTER'),
    teacherMaster: props.getProperty('SHEET_ID_TEACHER_MASTER'),
    attendanceLog: props.getProperty('SHEET_ID_ATTENDANCE_LOG'),
    auditLog: props.getProperty('SHEET_ID_AUDIT_LOG'),
    whatsappLog: props.getProperty('SHEET_ID_WHATSAPP_LOG') || props.getProperty('SHEET_ID_STUDENT_MASTER'), // Default to same sheet if not specified
    exportFolder: props.getProperty('DRIVE_EXPORT_FOLDER_ID') || null
  };
}

/**
 * Get sheet by ID and name (supports both separate sheets and tabs)
 */
function getSheet(sheetId, sheetName) {
  try {
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.getActiveSheet();
    return sheet;
  } catch (e) {
    throw new Error(`Sheet not found: ${sheetName} (ID: ${sheetId})`);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate unique log ID
 */
function generateLogId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return `LOG${timestamp}${random}`;
}

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/**
 * Get current time in HH:mm format
 */
function getCurrentTime() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'HH:mm');
}

/**
 * Get day name from date
 */
function getDayName(dateString) {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Check if time is within allowed window
 */
function isTimeInWindow(currentTime, startTime, endTime) {
  const current = parseTime(currentTime);
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  return current >= start && current <= end;
}

/**
 * Parse time string (HH:mm) to minutes since midnight
 */
function parseTime(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Determine if student is late (after 09:15)
 */
function isLate(timeString) {
  const lateThreshold = parseTime('09:15');
  const checkInTime = parseTime(timeString);
  return checkInTime > lateThreshold;
}

/**
 * Check if attendance can be edited (within 15 minutes)
 */
function canEditAttendance(logTime) {
  const logMinutes = parseTime(logTime);
  const currentMinutes = parseTime(getCurrentTime());
  const diffMinutes = currentMinutes - logMinutes;
  return diffMinutes <= 15;
}

/**
 * Create audit log entry (append-only)
 */
function logAudit(email, action, metadata) {
  try {
    const sheetIds = getSheetIds();
    const sheet = getSheet(sheetIds.auditLog, 'Audit_Log');
    
    const timestamp = new Date();
    const row = [
      timestamp,
      email || 'SYSTEM',
      action,
      JSON.stringify(metadata || {})
    ];
    
    sheet.appendRow(row);
  } catch (e) {
    // Log error but don't fail the main operation
    console.error('Audit log error:', e);
  }
}

// ============================================
// AUTHENTICATION & AUTHORIZATION
// ============================================

/**
 * Validate user email against Teacher_Master whitelist
 * Returns user info if authorized, null otherwise
 */
function validateUser(email) {
  try {
    if (!email) {
      console.log('validateUser: No email provided');
      return null;
    }
    
    // Normalize email
    const normalizedEmail = String(email).trim().toLowerCase();
    console.log('validateUser: Checking email:', normalizedEmail);
    
    const sheetIds = getSheetIds();
    const sheet = getSheet(sheetIds.teacherMaster, 'Teacher_Master');
    const data = sheet.getDataRange().getValues();
    
    console.log('validateUser: Total rows in sheet:', data.length);
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowEmail = String(row[0]).trim().toLowerCase();
      const name = String(row[1]);
      const role = String(row[2]);
      const schoolId = String(row[3]);
      const classAssigned = String(row[4] || '');
      const active = row[5] === true || String(row[5]).toLowerCase() === 'true';
      
      console.log(`validateUser: Row ${i} - Email: ${rowEmail}, Active: ${active}, Match: ${rowEmail === normalizedEmail}`);
      
      if (rowEmail === normalizedEmail && active) {
        console.log('validateUser: User found and authorized!', { email: rowEmail, name, role, schoolId });
        return {
          email: rowEmail,
          name: name,
          role: role,
          schoolId: schoolId,
          classAssigned: classAssigned.split(',').map(c => c.trim()).filter(c => c)
        };
      }
    }
    
    console.log('validateUser: User not found or not active');
    return null;
  } catch (e) {
    console.error('User validation error:', e);
    console.error('Error stack:', e.stack);
    return null;
  }
}

/**
 * Get user info from request (requires OAuth or userEmail parameter)
 * For cross-origin requests, userEmail can be passed as parameter
 */
function getUserFromRequest(e) {
  // CRITICAL: Check userEmail parameter FIRST for cross-origin requests
  // This avoids 302 redirects that cause CORS issues
  if (e && e.parameter && e.parameter.userEmail) {
    try {
      const email = decodeURIComponent(String(e.parameter.userEmail));
      console.log('getUserFromRequest: Using userEmail parameter:', email);
      const user = validateUser(email);
      if (user) {
        console.log('getUserFromRequest: User found via userEmail parameter');
        return user;
      } else {
        console.log('getUserFromRequest: User not found via userEmail parameter');
      }
    } catch (err) {
      console.error('getUserFromRequest: Error processing userEmail parameter:', err);
    }
  }
  
  // Fallback to OAuth (Session.getActiveUser) if userEmail not provided or not found
  try {
    const email = Session.getActiveUser().getEmail();
    console.log('getUserFromRequest: Using OAuth email:', email);
    const user = validateUser(email);
    if (user) {
      console.log('getUserFromRequest: User found via OAuth');
      return user;
    } else {
      console.log('getUserFromRequest: User not found via OAuth');
    }
  } catch (err) {
    console.log('getUserFromRequest: OAuth not available (expected for cross-origin):', err.message);
  }
  
  console.log('getUserFromRequest: No user found via any method');
  return null;
}

// ============================================
// DATA RETRIEVAL
// ============================================

/**
 * Get students for a school and class
 */
function getStudents(schoolId, className) {
  try {
    const sheetIds = getSheetIds();
    const sheet = getSheet(sheetIds.studentMaster, 'Student_Master');
    const data = sheet.getDataRange().getValues();
    
    const students = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowSchoolId = String(row[1]);
      const rowClass = String(row[3]);
      const active = row[7] === true || String(row[7]).toLowerCase() === 'true';
      
      if (rowSchoolId === schoolId && rowClass === className && active) {
        // Check if whatsapp_alert_enabled column exists (column 8, index 8)
        const whatsappAlertEnabled = row.length > 8 ? (row[8] === true || String(row[8]).toLowerCase() === 'true') : false;
        // Check if parent_name column exists (column 9, index 9)
        const parentName = row.length > 9 ? String(row[9]) : '';
        
        students.push({
          studentId: String(row[0]),
          schoolId: rowSchoolId,
          name: String(row[2]),
          class: rowClass,
          section: String(row[4]),
          roll: Number(row[5]) || 0,
          parentMobile: String(row[6]),
          whatsappAlertEnabled: whatsappAlertEnabled,
          parentName: parentName
        });
      }
    }
    
    // Sort by roll number
    students.sort((a, b) => a.roll - b.roll);
    return students;
  } catch (e) {
    console.error('Get students error:', e);
    return [];
  }
}

/**
 * Get all students for a school (no class filter) - for Admin/Principal
 */
function getAllStudentsForSchool(schoolId) {
  try {
    const sheetIds = getSheetIds();
    const sheet = getSheet(sheetIds.studentMaster, 'Student_Master');
    const data = sheet.getDataRange().getValues();
    
    const students = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowSchoolId = String(row[1]);
      const active = row[7] === true || String(row[7]).toLowerCase() === 'true';
      
      if (rowSchoolId === schoolId && active) {
        const rowClass = String(row[3]);
        const whatsappAlertEnabled = row.length > 8 ? (row[8] === true || String(row[8]).toLowerCase() === 'true') : false;
        const parentName = row.length > 9 ? String(row[9]) : '';
        
        students.push({
          studentId: String(row[0]),
          schoolId: rowSchoolId,
          name: String(row[2]),
          class: rowClass,
          section: String(row[4]),
          roll: Number(row[5]) || 0,
          parentMobile: String(row[6]),
          whatsappAlertEnabled: whatsappAlertEnabled,
          parentName: parentName
        });
      }
    }
    
    // Sort by class, then roll number
    students.sort((a, b) => {
      if (a.class !== b.class) {
        return a.class.localeCompare(b.class);
      }
      return a.roll - b.roll;
    });
    return students;
  } catch (e) {
    console.error('Get all students error:', e);
    return [];
  }
}

/**
 * Get all unique classes for a school - for Admin/Principal dropdowns
 */
function getAllClassesForSchool(schoolId) {
  try {
    const students = getAllStudentsForSchool(schoolId);
    const classes = [...new Set(students.map(s => s.class))].sort();
    return classes;
  } catch (e) {
    console.error('Get all classes error:', e);
    return [];
  }
}

/**
 * Get school info
 */
function getSchool(schoolId) {
  try {
    const sheetIds = getSheetIds();
    const sheet = getSheet(sheetIds.schoolMaster, 'School_Master');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (String(row[0]) === schoolId) {
        return {
          schoolId: String(row[0]),
          schoolName: String(row[1]),
          active: row[2] === true || String(row[2]).toLowerCase() === 'true'
        };
      }
    }
    return null;
  } catch (e) {
    console.error('Get school error:', e);
    return null;
  }
}

/**
 * Get today's attendance for a class
 */
function getTodayAttendance(schoolId, className, date) {
  try {
    const sheetIds = getSheetIds();
    const sheet = getSheet(sheetIds.attendanceLog, 'Attendance_Log');
    const data = sheet.getDataRange().getValues();
    
    const attendance = {};
    const targetDate = date || getCurrentDate();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowDate = Utilities.formatDate(new Date(row[1]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      const rowSchoolId = String(row[5]);
      const rowClass = String(row[6]);
      const studentId = String(row[4]);
      const type = String(row[8]);
      
      if (rowDate === targetDate && rowSchoolId === schoolId && rowClass === className) {
        if (!attendance[studentId]) {
          attendance[studentId] = {
            checkIn: null,
            checkOut: null,
            status: null,
            remark: null,
            logId: null,
            time: null
          };
        }
        
        if (type === 'CHECK_IN') {
          attendance[studentId].checkIn = {
            time: String(row[3]),
            status: String(row[7]),
            remark: String(row[10] || ''),
            logId: String(row[0]),
            teacherEmail: String(row[9])
          };
          attendance[studentId].status = String(row[7]);
          attendance[studentId].remark = String(row[10] || '');
          attendance[studentId].logId = String(row[0]);
          attendance[studentId].time = String(row[3]);
        } else if (type === 'CHECK_OUT') {
          attendance[studentId].checkOut = {
            time: String(row[3]),
            logId: String(row[0]),
            teacherEmail: String(row[9])
          };
        }
      }
    }
    
    return attendance;
  } catch (e) {
    console.error('Get attendance error:', e);
    return {};
  }
}

// ============================================
// ATTENDANCE MANAGEMENT
// ============================================

/**
 * Mark attendance (check-in or check-out)
 */
function markAttendance(studentId, status, type, remark, e) {
  try {
    const user = getUserFromRequest(e);
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }
    
    // Get student info
    const sheetIds = getSheetIds();
    const studentSheet = getSheet(sheetIds.studentMaster, 'Student_Master');
    const studentData = studentSheet.getDataRange().getValues();
    
    let student = null;
    for (let i = 1; i < studentData.length; i++) {
      if (String(studentData[i][0]) === studentId) {
        student = {
          studentId: String(studentData[i][0]),
          schoolId: String(studentData[i][1]),
          name: String(studentData[i][2]),
          class: String(studentData[i][3])
        };
        break;
      }
    }
    
    if (!student) {
      return { success: false, error: 'Student not found' };
    }
    
    // Validate access
    if (user.role === 'teacher') {
      if (!user.classAssigned.includes(student.class)) {
        return { success: false, error: 'Access denied: Not assigned to this class' };
      }
    }
    
    const currentDate = getCurrentDate();
    const currentTime = getCurrentTime();
    const day = getDayName(currentDate);
    
    // Validate time windows
    if (type === 'CHECK_IN') {
      if (!isTimeInWindow(currentTime, '07:00', '10:30')) {
        return { success: false, error: 'Check-in allowed only between 07:00 - 10:30' };
      }
      
      // Check for duplicate
      const existing = getTodayAttendance(student.schoolId, student.class, currentDate);
      if (existing[studentId] && existing[studentId].checkIn) {
        return { success: false, error: 'Check-in already recorded for today' };
      }
      
      // Determine if late
      if (isLate(currentTime) && status === 'P') {
        status = 'L'; // Override to Late
      }
    } else if (type === 'CHECK_OUT') {
      if (!isTimeInWindow(currentTime, '12:30', '15:30')) {
        return { success: false, error: 'Check-out allowed only between 12:30 - 15:30' };
      }
      
      // Check for duplicate
      const existing = getTodayAttendance(student.schoolId, student.class, currentDate);
      if (existing[studentId] && existing[studentId].checkOut) {
        return { success: false, error: 'Check-out already recorded for today' };
      }
      
      // Check-in must exist first
      if (!existing[studentId] || !existing[studentId].checkIn) {
        return { success: false, error: 'Check-in must be recorded before check-out' };
      }
    }
    
    // Create log entry
    const logId = generateLogId();
    const attendanceSheet = getSheet(sheetIds.attendanceLog, 'Attendance_Log');
    
    const row = [
      logId,
      new Date(currentDate),
      day,
      currentTime,
      student.studentId,
      student.schoolId,
      student.class,
      type === 'CHECK_IN' ? status : '', // Status only for check-in
      type,
      user.email,
      remark || ''
    ];
    
    attendanceSheet.appendRow(row);
    
    // Audit log
    logAudit(user.email, `MARK_ATTENDANCE_${type}`, {
      studentId: studentId,
      status: status,
      type: type,
      logId: logId
    });
    
    return {
      success: true,
      logId: logId,
      message: `${type} recorded successfully`
    };
  } catch (e) {
    console.error('Mark attendance error:', e);
    return { success: false, error: e.toString() };
  }
}

/**
 * Edit attendance (within 15 minutes)
 */
function editAttendance(logId, newStatus, newRemark, e) {
  try {
    const user = getUserFromRequest(e);
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }
    
    // Find the log entry
    const sheetIds = getSheetIds();
    const sheet = getSheet(sheetIds.attendanceLog, 'Attendance_Log');
    const data = sheet.getDataRange().getValues();
    
    let logRow = null;
    let logIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === logId) {
        logRow = data[i];
        logIndex = i + 1; // Sheet row number (1-indexed)
        break;
      }
    }
    
    if (!logRow) {
      return { success: false, error: 'Attendance record not found' };
    }
    
    // Check edit window (15 minutes)
    const logTime = String(logRow[3]);
    if (!canEditAttendance(logTime)) {
      return { success: false, error: 'Edit window expired (15 minutes)' };
    }
    
    // Validate access
    const studentId = String(logRow[4]);
    const studentSheet = getSheet(sheetIds.studentMaster, 'Student_Master');
    const studentData = studentSheet.getDataRange().getValues();
    
    let studentClass = null;
    for (let i = 1; i < studentData.length; i++) {
      if (String(studentData[i][0]) === studentId) {
        studentClass = String(studentData[i][3]);
        break;
      }
    }
    
    if (user.role === 'teacher' && !user.classAssigned.includes(studentClass)) {
      return { success: false, error: 'Access denied' };
    }
    
    if (user.role === 'principal') {
      return { success: false, error: 'Principals cannot edit attendance' };
    }
    
    // Update status and remark (only for CHECK_IN)
    const type = String(logRow[8]);
    if (type === 'CHECK_IN') {
      sheet.getRange(logIndex, 8).setValue(newStatus); // Status column
      sheet.getRange(logIndex, 11).setValue(newRemark || ''); // Remark column
    } else {
      return { success: false, error: 'Only check-in can be edited' };
    }
    
    // Audit log
    logAudit(user.email, 'EDIT_ATTENDANCE', {
      logId: logId,
      oldStatus: String(logRow[7]),
      newStatus: newStatus,
      newRemark: newRemark
    });
    
    return { success: true, message: 'Attendance updated successfully' };
  } catch (e) {
    console.error('Edit attendance error:', e);
    return { success: false, error: e.toString() };
  }
}

/**
 * Mark attendance for multiple students (batch)
 */
function markAttendanceBatch(attendanceData, e) {
  try {
    const user = getUserFromRequest(e);
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }
    
    const results = [];
    const currentDate = getCurrentDate();
    const currentTime = getCurrentTime();
    
      for (const item of attendanceData) {
      const { studentId, status, remark } = item;
      const result = markAttendance(studentId, status, 'CHECK_IN', remark, e);
      results.push({ studentId, ...result });
    }
    
    return {
      success: true,
      results: results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    };
  } catch (e) {
    console.error('Batch attendance error:', e);
    return { success: false, error: e.toString() };
  }
}

// ============================================
// REPORTING
// ============================================

/**
 * Get attendance report for a date range
 */
function getAttendanceReport(schoolId, className, startDate, endDate, e) {
  try {
    const user = getUserFromRequest(e);
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }
    
    // Validate access
    if (user.role === 'teacher' && className && !user.classAssigned.includes(className)) {
      return { success: false, error: 'Access denied' };
    }
    
    const sheetIds = getSheetIds();
    const sheet = getSheet(sheetIds.attendanceLog, 'Attendance_Log');
    const data = sheet.getDataRange().getValues();
    
    const report = {
      schoolId: schoolId,
      className: className,
      startDate: startDate,
      endDate: endDate,
      summary: {
        totalDays: 0,
        present: 0,
        absent: 0,
        late: 0
      },
      dailyData: {}
    };
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowDate = new Date(row[1]);
      const rowSchoolId = String(row[5]);
      const rowClass = String(row[6]);
      const type = String(row[8]);
      
      if (rowDate >= start && rowDate <= end && 
          rowSchoolId === schoolId && 
          (!className || rowClass === className) &&
          type === 'CHECK_IN') {
        
        const dateStr = Utilities.formatDate(rowDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        if (!report.dailyData[dateStr]) {
          report.dailyData[dateStr] = {
            date: dateStr,
            present: 0,
            absent: 0,
            late: 0
          };
        }
        
        const status = String(row[7]);
        if (status === 'P') report.dailyData[dateStr].present++;
        if (status === 'A') report.dailyData[dateStr].absent++;
        if (status === 'L') report.dailyData[dateStr].late++;
      }
    }
    
    // Calculate summary
    report.summary.totalDays = Object.keys(report.dailyData).length;
    for (const date in report.dailyData) {
      report.summary.present += report.dailyData[date].present;
      report.summary.absent += report.dailyData[date].absent;
      report.summary.late += report.dailyData[date].late;
    }
    
    return { success: true, data: report };
  } catch (e) {
    console.error('Get report error:', e);
    return { success: false, error: e.toString() };
  }
}

/**
 * Get absent students for a date
 */
function getAbsentStudents(schoolId, className, date, e) {
  try {
    const user = getUserFromRequest(e);
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }
    
    const students = getStudents(schoolId, className);
    const attendance = getTodayAttendance(schoolId, className, date);
    
    const absent = students.filter(s => {
      return !attendance[s.studentId] || !attendance[s.studentId].checkIn || attendance[s.studentId].status === 'A';
    });
    
    return { success: true, data: absent };
  } catch (e) {
    console.error('Get absent students error:', e);
    return { success: false, error: e.toString() };
  }
}

/**
 * Export attendance to Google Drive (daily)
 */
function exportToDrive(date) {
  try {
    const sheetIds = getSheetIds();
    if (!sheetIds.exportFolder) {
      return { success: false, error: 'Export folder not configured' };
    }
    
    const targetDate = date || getCurrentDate();
    const sheet = getSheet(sheetIds.attendanceLog, 'Attendance_Log');
    const data = sheet.getDataRange().getValues();
    
    // Filter for target date
    const filteredData = [data[0]]; // Header
    for (let i = 1; i < data.length; i++) {
      const rowDate = Utilities.formatDate(new Date(data[i][1]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      if (rowDate === targetDate) {
        filteredData.push(data[i]);
      }
    }
    
    // Create new sheet
    const exportSpreadsheet = SpreadsheetApp.create(`Attendance_${targetDate}`);
    const exportSheet = exportSpreadsheet.getActiveSheet();
    exportSheet.getRange(1, 1, filteredData.length, filteredData[0].length).setValues(filteredData);
    
    // Move to folder
    const file = DriveApp.getFileById(exportSpreadsheet.getId());
    const folder = DriveApp.getFolderById(sheetIds.exportFolder);
    file.moveTo(folder);
    
    return { success: true, fileId: file.getId() };
  } catch (e) {
    console.error('Export error:', e);
    return { success: false, error: e.toString() };
  }
}

// ============================================
// API ENDPOINTS (doGet, doPost)
// ============================================

/**
 * Handle OPTIONS requests (CORS preflight for POST requests)
 * Apps Script Web Apps should automatically handle CORS, but we provide explicit support
 */
function doOptions(e) {
  // Return empty response with proper headers for CORS preflight
  // Apps Script Web Apps automatically add CORS headers when deployed as Web App
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Create JSON response (Apps Script Web Apps automatically add CORS headers)
 * But we need to ensure it's not a redirect
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle GET requests
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    // Log all parameters for debugging
    console.log('doGet called with action:', action);
    console.log('All parameters:', JSON.stringify(e.parameter));
    console.log('userEmail parameter:', e.parameter.userEmail);
    
    // For 'auth' action, try to get user but don't fail if not authenticated yet
    // This allows OAuth to trigger automatically
    let user = null;
    if (action === 'auth') {
      try {
        user = getUserFromRequest(e);
      } catch (err) {
        // User not authenticated yet - OAuth will trigger automatically
        // Don't return error, let the auth flow continue
        user = null;
      }
    } else {
      user = getUserFromRequest(e);
      console.log('getUserFromRequest returned:', user ? 'user found' : 'null');
      if (!user) {
        console.log('No user found, returning Unauthorized');
        return createJsonResponse({
          success: false,
          error: 'Unauthorized',
          debug: {
            hasUserEmailParam: !!e.parameter.userEmail,
            userEmailValue: e.parameter.userEmail || 'not provided'
          }
        });
      }
    }
    
    switch (action) {
      case 'auth':
        // If redirect parameter is provided, redirect back to frontend with user data
        // NOTE: Web App must be deployed with:
        // - Execute as: Me
        // - Who has access: Anyone (or Anyone with Google account)
        const redirectUrl = e.parameter.redirect;
        if (redirectUrl) {
          // Try to get user again (in case OAuth just completed)
          if (!user) {
            try {
              user = getUserFromRequest(e);
            } catch (err) {
              user = null;
            }
          }
          
          if (user) {
            // User is authenticated - redirect back to frontend with user data
            const userData = encodeURIComponent(JSON.stringify(user));
            const finalUrl = redirectUrl + '?user=' + userData;
            // Use HtmlService for proper HTML Content-Type header
            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Redirecting to ClassLedger...</title>
<meta http-equiv="refresh" content="0;url=${finalUrl}">
<script>
(function() {
  try {
    const userData = '${userData}';
    const redirectUrl = '${finalUrl}';
    try {
      sessionStorage.setItem('user', decodeURIComponent(userData));
      sessionStorage.setItem('authenticated', 'true');
    } catch (e) {
      console.log('sessionStorage not available');
    }
    window.location.replace(redirectUrl);
  } catch (e) {
    console.error('Redirect error:', e);
    window.location.href = '${finalUrl}';
  }
})();
</script>
</head>
<body>
<div style="text-align: center; padding: 3rem; font-family: Arial, sans-serif;">
<h2>Redirecting to ClassLedger...</h2>
<p>Please wait...</p>
<p style="font-size: 0.875rem; color: #666;">
If you are not redirected automatically, 
<a href="${finalUrl}" style="color: #0066cc;">click here</a>.
</p>
</div>
</body>
</html>`;
            return HtmlService.createHtmlOutput(htmlContent);
          } else {
            // User not authorized - redirect back with error
            const errorUrl = redirectUrl + '?error=unauthorized';
            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Access Denied</title>
<meta http-equiv="refresh" content="0;url=${errorUrl}">
<script>
window.location.replace('${errorUrl}');
</script>
</head>
<body>
<div style="text-align: center; padding: 3rem; font-family: Arial, sans-serif;">
<h2>Access Denied</h2>
<p>Redirecting...</p>
<p style="font-size: 0.875rem; color: #666;">
<a href="${errorUrl}" style="color: #0066cc;">Click here</a> if not redirected.
</p>
</div>
</body>
</html>`;
            return HtmlService.createHtmlOutput(htmlContent);
          }
        }
        // Return JSON for API calls (no redirect parameter)
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          user: user || null
        })).setMimeType(ContentService.MimeType.JSON);
        
      case 'getUser':
        return createJsonResponse({
          success: true,
          user: user
        });
        
      case 'getStudents':
        const schoolId = e.parameter.schoolId || user.schoolId;
        const className = e.parameter.class;
        
        // If no class specified, return all students for the school (for Admin/Principal to get all classes)
        if (!className) {
          const allStudents = getAllStudentsForSchool(schoolId);
          return createJsonResponse({
            success: true,
            data: allStudents
          });
        }
        
        const students = getStudents(schoolId, className);
        return createJsonResponse({
          success: true,
          data: students
        });
      
      case 'getAllClasses':
        // New endpoint to get all classes for a school
        const classesSchoolId = e.parameter.schoolId || user.schoolId;
        const classes = getAllClassesForSchool(classesSchoolId);
        return createJsonResponse({
          success: true,
          data: classes
        });
        
      case 'getSchool':
        const school = getSchool(user.schoolId);
        return createJsonResponse({
          success: true,
          data: school
        });
        
      case 'getTodayAttendance':
        const attSchoolId = e.parameter.schoolId || user.schoolId;
        const attClass = e.parameter.class;
        const attDate = e.parameter.date || getCurrentDate();
        const attendance = getTodayAttendance(attSchoolId, attClass, attDate);
        return createJsonResponse({
          success: true,
          data: attendance
        });
        
      case 'getReport':
        const repSchoolId = e.parameter.schoolId || user.schoolId;
        const repClass = e.parameter.class;
        const startDate = e.parameter.startDate;
        const endDate = e.parameter.endDate;
        const report = getAttendanceReport(repSchoolId, repClass, startDate, endDate, e);
        return createJsonResponse(report);
        
      case 'getAbsentStudents':
        const absSchoolId = e.parameter.schoolId || user.schoolId;
        const absClass = e.parameter.class;
        const absDate = e.parameter.date || getCurrentDate();
        const absent = getAbsentStudents(absSchoolId, absClass, absDate, e);
        return createJsonResponse(absent);
        
      default:
        return createJsonResponse({
          success: false,
          error: 'Invalid action'
        });
    }
  } catch (e) {
    return createJsonResponse({
      success: false,
      error: e.toString()
    });
  }
}

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    // Log all parameters for debugging
    console.log('doPost called');
    console.log('POST parameters:', JSON.stringify(e.parameter));
    console.log('userEmail parameter:', e.parameter.userEmail);
    console.log('POST data:', e.postData ? e.postData.contents : 'no postData');
    console.log('POST content type:', e.postData ? e.postData.type : 'no postData');
    
    // Handle both JSON and form-encoded POST data
    let data = {};
    let action = '';
    
    if (e.postData && e.postData.contents) {
      const contentType = e.postData.type || '';
      if (contentType.includes('application/json')) {
        // JSON format
        data = JSON.parse(e.postData.contents);
        action = data.action;
      } else {
        // Form-encoded format (application/x-www-form-urlencoded)
        // Apps Script automatically parses form data into e.parameter
        action = e.parameter.action || '';
        // Get all fields from parameters (handles all POST actions)
        data = {
          action: action,
          studentId: e.parameter.studentId || '',
          status: e.parameter.status || '',
          type: e.parameter.type || '',
          remark: e.parameter.remark || '',
          logId: e.parameter.logId || '',
          enabled: e.parameter.enabled || '',
          date: e.parameter.date || '',
          attendanceData: e.parameter.attendanceData || '' // For batch operations
        };
        // If attendanceData is a JSON string, parse it
        if (data.attendanceData && typeof data.attendanceData === 'string') {
          try {
            data.attendanceData = JSON.parse(data.attendanceData);
          } catch (e) {
            console.error('Failed to parse attendanceData:', e);
          }
        }
      }
    } else {
      // No POST data, try to get action from parameters
      action = e.parameter.action || '';
      data = e.parameter;
    }
    
    console.log('POST action:', action);
    console.log('POST parsed data:', JSON.stringify(data));
    
    const user = getUserFromRequest(e);
    console.log('getUserFromRequest returned:', user ? 'user found' : 'null');
    
    if (!user) {
      console.log('No user found in POST, returning Unauthorized');
      return createJsonResponse({
        success: false,
        error: 'Unauthorized',
        debug: {
          hasUserEmailParam: !!e.parameter.userEmail,
          userEmailValue: e.parameter.userEmail || 'not provided'
        }
      });
    }
    
    switch (action) {
      case 'markAttendance':
        const result = markAttendance(
          data.studentId,
          data.status,
          data.type || 'CHECK_IN',
          data.remark || '',
          e
        );
        return createJsonResponse(result);
        
      case 'markAttendanceBatch':
        const batchResult = markAttendanceBatch(data.attendanceData || [], e);
        return createJsonResponse(batchResult);
        
      case 'editAttendance':
        const editResult = editAttendance(
          data.logId,
          data.status,
          data.remark || '',
          e
        );
        return createJsonResponse(editResult);
        
      case 'exportToDrive':
        const exportResult = exportToDrive(data.date);
        return createJsonResponse(exportResult);
        
      case 'updateWhatsAppAlertSetting':
        const updateResult = updateWhatsAppAlertSetting(data.studentId, data.enabled, e);
        return createJsonResponse(updateResult);
        
      default:
        return createJsonResponse({
          success: false,
          error: 'Invalid action'
        });
    }
  } catch (e) {
    return createJsonResponse({
      success: false,
      error: e.toString()
    });
  }
}

// ============================================
// TRIGGERS (Optional - for automated tasks)
// ============================================

/**
 * Daily export trigger (set up via Apps Script Triggers)
 */
function dailyExportTrigger() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = Utilities.formatDate(yesterday, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  exportToDrive(dateStr);
  logAudit('SYSTEM', 'DAILY_EXPORT', { date: dateStr });
}

// ============================================
// FUTURE-READY FEATURES (STUB FUNCTIONS)
// ============================================

// ============================================
// WHATSAPP ALERT SYSTEM
// ============================================

/**
 * Get WhatsApp credentials from Script Properties
 */
function getWhatsAppCredentials() {
  const props = PropertiesService.getScriptProperties();
  return {
    token: props.getProperty('WHATSAPP_TOKEN'),
    phoneNumberId: props.getProperty('PHONE_NUMBER_ID')
  };
}

/**
 * Format phone number for WhatsApp API (remove +, spaces, etc.)
 * WhatsApp API requires format: country code + number (e.g., 919876543210)
 */
function formatPhoneNumber(phone) {
  if (!phone) return null;
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // If starts with 0, remove it (for Indian numbers)
  if (cleaned.startsWith('0')) {
    return cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Check if WhatsApp alert already sent for student today
 */
function isWhatsAppAlertSentToday(studentId, date) {
  try {
    const sheetIds = getSheetIds();
    const sheet = getSheet(sheetIds.whatsappLog, 'WhatsApp_Log');
    const data = sheet.getDataRange().getValues();
    
    const targetDate = date || getCurrentDate();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowStudentId = String(row[1]);
      const rowDate = Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      const rowStatus = String(row[3]);
      
      if (rowStudentId === studentId && rowDate === targetDate && rowStatus === 'SENT') {
        return true;
      }
    }
    
    return false;
  } catch (e) {
    console.error('Check WhatsApp alert sent error:', e);
    return false; // If error, allow sending (fail-safe)
  }
}

/**
 * Log WhatsApp alert attempt to WhatsApp_Log sheet
 */
function logWhatsAppAlert(studentId, parentMobile, status, response) {
  try {
    const sheetIds = getSheetIds();
    const sheet = getSheet(sheetIds.whatsappLog, 'WhatsApp_Log');
    
    const timestamp = new Date();
    const row = [
      timestamp,
      studentId,
      parentMobile || '',
      status, // SENT, FAILED, SKIPPED
      JSON.stringify(response || {})
    ];
    
    sheet.appendRow(row);
  } catch (e) {
    console.error('Log WhatsApp alert error:', e);
    // Don't fail the main operation if logging fails
  }
}

/**
 * Get student details including parent name
 * For now, we'll use student name as parent name placeholder
 * In production, you may want to add parent_name to Student_Master
 */
function getStudentDetails(studentId) {
  try {
    const sheetIds = getSheetIds();
    const sheet = getSheet(sheetIds.studentMaster, 'Student_Master');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (String(row[0]) === studentId) {
        return {
          studentId: String(row[0]),
          studentName: String(row[2]),
          schoolId: String(row[1]),
          parentMobile: String(row[6]),
          // Parent name - if not in sheet, use "अभिभावक" (Guardian)
          parentName: row.length > 9 ? String(row[9]) : 'अभिभावक'
        };
      }
    }
    return null;
  } catch (e) {
    console.error('Get student details error:', e);
    return null;
  }
}

/**
 * Format date in Hindi format (DD/MM/YYYY)
 */
function formatDateHindi(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Send WhatsApp alert for absent student
 * Uses WhatsApp Cloud API (Meta) with template message
 * 
 * @param {Object} student - Student object with studentId, name, parentMobile, etc.
 * @param {string} date - Attendance date (YYYY-MM-DD)
 * @returns {Object} Result object with success status
 */
function sendWhatsAppAbsentAlert(student, date) {
  try {
    // Validate inputs
    if (!student || !student.studentId) {
      logWhatsAppAlert(student?.studentId || 'UNKNOWN', student?.parentMobile || '', 'FAILED', { error: 'Invalid student data' });
      return { success: false, error: 'Invalid student data' };
    }
    
    // Check if alert already sent today
    if (isWhatsAppAlertSentToday(student.studentId, date)) {
      logWhatsAppAlert(student.studentId, student.parentMobile || '', 'SKIPPED', { reason: 'Already sent today' });
      return { success: false, error: 'Alert already sent today', skipped: true };
    }
    
    // Check if WhatsApp alerts enabled for this student
    if (!student.whatsappAlertEnabled) {
      logWhatsAppAlert(student.studentId, student.parentMobile || '', 'SKIPPED', { reason: 'WhatsApp alerts disabled' });
      return { success: false, error: 'WhatsApp alerts disabled for this student', skipped: true };
    }
    
    // Validate parent mobile
    const parentMobile = formatPhoneNumber(student.parentMobile);
    if (!parentMobile || parentMobile.length < 10) {
      logWhatsAppAlert(student.studentId, student.parentMobile || '', 'FAILED', { error: 'Invalid parent mobile number' });
      return { success: false, error: 'Invalid parent mobile number' };
    }
    
    // Get student details
    const studentDetails = getStudentDetails(student.studentId);
    if (!studentDetails) {
      logWhatsAppAlert(student.studentId, parentMobile, 'FAILED', { error: 'Student not found' });
      return { success: false, error: 'Student not found' };
    }
    
    // Get school details
    const school = getSchool(studentDetails.schoolId);
    if (!school) {
      logWhatsAppAlert(student.studentId, parentMobile, 'FAILED', { error: 'School not found' });
      return { success: false, error: 'School not found' };
    }
    
    // Get WhatsApp credentials
    const credentials = getWhatsAppCredentials();
    if (!credentials.token || !credentials.phoneNumberId) {
      logWhatsAppAlert(student.studentId, parentMobile, 'FAILED', { error: 'WhatsApp credentials not configured' });
      return { success: false, error: 'WhatsApp credentials not configured' };
    }
    
    // Format date in Hindi format
    const dateHindi = formatDateHindi(date);
    
    // Prepare Hindi message (EXACT template as specified - DO NOT CHANGE)
    const hindiMessage = `नमस्ते ${studentDetails.parentName},

आज ${studentDetails.studentName} विद्यालय में उपस्थित नहीं रहे।
दिनांक: ${dateHindi}

कृपया कक्षा शिक्षक से विद्यालय आकर संपर्क करें
एवं छात्र की अनुपस्थिति का कारण बताते हुए
एक आवेदन पत्र जमा करें।

– ${school.schoolName}
(ClassLedger by Tarka)`;
    
    // Prepare API request
    const apiUrl = `https://graph.facebook.com/v19.0/${credentials.phoneNumberId}/messages`;
    
    // WhatsApp Cloud API requires phone number in format: country_code + number (e.g., 919876543210)
    // Assuming Indian numbers (country code 91)
    const whatsappPhoneNumber = parentMobile.startsWith('91') ? parentMobile : `91${parentMobile}`;
    
    const payload = {
      messaging_product: 'whatsapp',
      to: whatsappPhoneNumber,
      type: 'text',
      text: {
        body: hindiMessage
      }
    };
    
    const options = {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${credentials.token}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true // Don't throw on HTTP errors
    };
    
    // Send WhatsApp message
    const response = UrlFetchApp.fetch(apiUrl, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    let result;
    if (responseCode === 200) {
      const responseData = JSON.parse(responseText);
      result = {
        success: true,
        messageId: responseData.messages?.[0]?.id || 'unknown',
        status: 'SENT'
      };
      
      // Log success
      logWhatsAppAlert(student.studentId, parentMobile, 'SENT', result);
      
      // Audit log
      logAudit('SYSTEM', 'WHATSAPP_ALERT_SENT', {
        studentId: student.studentId,
        studentName: studentDetails.studentName,
        parentMobile: parentMobile,
        date: date,
        messageId: result.messageId
      });
    } else {
      // Log failure
      const errorData = JSON.parse(responseText);
      result = {
        success: false,
        error: errorData.error?.message || 'Unknown error',
        code: responseCode,
        status: 'FAILED'
      };
      
      logWhatsAppAlert(student.studentId, parentMobile, 'FAILED', result);
      
      // Audit log
      logAudit('SYSTEM', 'WHATSAPP_ALERT_FAILED', {
        studentId: student.studentId,
        parentMobile: parentMobile,
        date: date,
        error: result.error,
        code: responseCode
      });
    }
    
    return result;
  } catch (e) {
    // Log exception
    const errorMsg = e.toString();
    logWhatsAppAlert(student?.studentId || 'UNKNOWN', student?.parentMobile || '', 'FAILED', { error: errorMsg });
    
    // Audit log
    logAudit('SYSTEM', 'WHATSAPP_ALERT_ERROR', {
      studentId: student?.studentId || 'UNKNOWN',
      error: errorMsg
    });
    
    return { success: false, error: errorMsg };
  }
}

/**
 * Trigger WhatsApp alerts for absent students
 * Runs AFTER 10:30 AM IST (morning attendance window closes)
 * Sends alerts ONLY for students with whatsapp_alert_enabled = TRUE
 * Sends ONLY ONCE per student per day
 * 
 * This function should be called via time-based trigger after 10:30 AM IST
 */
function triggerWhatsAppAbsentAlerts() {
  try {
    const currentTime = getCurrentTime();
    const currentDate = getCurrentDate();
    
    // Verify it's after 10:30 AM IST
    // Note: Apps Script uses script timezone, ensure it's set to IST
    const currentMinutes = parseTime(currentTime);
    const thresholdMinutes = parseTime('10:30');
    
    if (currentMinutes < thresholdMinutes) {
      logAudit('SYSTEM', 'WHATSAPP_ALERT_SKIPPED', {
        reason: 'Before 10:30 AM',
        currentTime: currentTime
      });
      return { success: false, error: 'Too early - alerts only sent after 10:30 AM IST' };
    }
    
    // Get all schools
    const sheetIds = getSheetIds();
    const schoolSheet = getSheet(sheetIds.schoolMaster, 'School_Master');
    const schoolData = schoolSheet.getDataRange().getValues();
    
    let totalAlertsSent = 0;
    let totalAlertsFailed = 0;
    let totalAlertsSkipped = 0;
    
    // Process each school
    for (let i = 1; i < schoolData.length; i++) {
      const schoolRow = schoolData[i];
      const schoolId = String(schoolRow[0]);
      const schoolActive = schoolRow[2] === true || String(schoolRow[2]).toLowerCase() === 'true';
      
      if (!schoolActive) continue;
      
      // Get all classes for this school
      const studentSheet = getSheet(sheetIds.studentMaster, 'Student_Master');
      const studentData = studentSheet.getDataRange().getValues();
      
      const classes = new Set();
      for (let j = 1; j < studentData.length; j++) {
        const studentRow = studentData[j];
        if (String(studentRow[1]) === schoolId) {
          classes.add(String(studentRow[3]));
        }
      }
      
      // Process each class
      for (const className of classes) {
        // Get absent students for today
        const students = getStudents(schoolId, className);
        const attendance = getTodayAttendance(schoolId, className, currentDate);
        
        const absentStudents = students.filter(s => {
          const hasAttendance = attendance[s.studentId] && attendance[s.studentId].checkIn;
          const isAbsent = !hasAttendance || attendance[s.studentId].status === 'A';
          return isAbsent && s.whatsappAlertEnabled;
        });
        
        // Send alerts for absent students
        for (const student of absentStudents) {
          const result = sendWhatsAppAbsentAlert(student, currentDate);
          
          if (result.success) {
            totalAlertsSent++;
          } else if (result.skipped) {
            totalAlertsSkipped++;
          } else {
            totalAlertsFailed++;
          }
          
          // Small delay to avoid rate limiting
          Utilities.sleep(500); // 500ms delay between messages
        }
      }
    }
    
    // Log summary
    logAudit('SYSTEM', 'WHATSAPP_ALERT_BATCH_COMPLETE', {
      date: currentDate,
      sent: totalAlertsSent,
      failed: totalAlertsFailed,
      skipped: totalAlertsSkipped,
      total: totalAlertsSent + totalAlertsFailed + totalAlertsSkipped
    });
    
    return {
      success: true,
      date: currentDate,
      summary: {
        sent: totalAlertsSent,
        failed: totalAlertsFailed,
        skipped: totalAlertsSkipped,
        total: totalAlertsSent + totalAlertsFailed + totalAlertsSkipped
      }
    };
  } catch (e) {
    console.error('Trigger WhatsApp alerts error:', e);
    logAudit('SYSTEM', 'WHATSAPP_ALERT_BATCH_ERROR', {
      error: e.toString()
    });
    return { success: false, error: e.toString() };
  }
}

/**
 * Legacy stub function - now redirects to WhatsApp implementation
 * Kept for backward compatibility
 */
function sendParentAlert(studentId, parentMobile, date, status) {
  // Redirect to WhatsApp implementation if status is absent
  if (status === 'A') {
    const student = getStudentDetails(studentId);
    if (student) {
      student.whatsappAlertEnabled = true; // Assume enabled for legacy calls
      return sendWhatsAppAbsentAlert(student, date);
    }
  }
  
  // For non-absent cases, log but don't send
  logAudit('SYSTEM', 'PARENT_ALERT_SKIPPED', {
    studentId: studentId,
    status: status,
    reason: 'Only absent students receive alerts'
  });
  
  return {
    success: false,
    message: 'Alerts only sent for absent students',
    service: 'WHATSAPP'
  };
}

/**
 * Legacy stub function - now uses WhatsApp implementation
 * Kept for backward compatibility
 */
function triggerAbsentStudentAlerts(schoolId, className, date) {
  // Use WhatsApp implementation
  return triggerWhatsAppAbsentAlerts();
}

/**
 * Update WhatsApp alert setting for a student
 * Admin/Teacher can enable/disable WhatsApp alerts per student
 * 
 * @param {string} studentId - Student ID
 * @param {boolean} enabled - Enable (true) or disable (false) alerts
 * @returns {Object} Result object
 */
function updateWhatsAppAlertSetting(studentId, enabled, e) {
  try {
    const user = getUserFromRequest(e);
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }
    
    // Only admin and teacher can update settings
    if (user.role !== 'admin' && user.role !== 'teacher') {
      return { success: false, error: 'Access denied - only admin and teacher can update settings' };
    }
    
    const sheetIds = getSheetIds();
    const sheet = getSheet(sheetIds.studentMaster, 'Student_Master');
    const data = sheet.getDataRange().getValues();
    
    // Find student row
    let studentRowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === studentId) {
        studentRowIndex = i + 1; // Sheet row number (1-indexed)
        break;
      }
    }
    
    if (studentRowIndex === -1) {
      return { success: false, error: 'Student not found' };
    }
    
    // Check if column exists, if not, add it
    const headers = data[0];
    let whatsappColumnIndex = -1;
    
    for (let i = 0; i < headers.length; i++) {
      if (String(headers[i]).toLowerCase() === 'whatsapp_alert_enabled') {
        whatsappColumnIndex = i;
        break;
      }
    }
    
    // If column doesn't exist, add it
    if (whatsappColumnIndex === -1) {
      whatsappColumnIndex = headers.length;
      sheet.getRange(1, whatsappColumnIndex + 1).setValue('whatsapp_alert_enabled');
    }
    
    // Update the value
    sheet.getRange(studentRowIndex, whatsappColumnIndex + 1).setValue(enabled === true);
    
    // Audit log
    logAudit(user.email, 'UPDATE_WHATSAPP_ALERT_SETTING', {
      studentId: studentId,
      enabled: enabled
    });
    
    return {
      success: true,
      message: `WhatsApp alerts ${enabled ? 'enabled' : 'disabled'} for student`
    };
  } catch (e) {
    console.error('Update WhatsApp alert setting error:', e);
    return { success: false, error: e.toString() };
  }
}

/**
 * Add new academic year (STUB)
 * Future implementation: Archive current year data, create new year structure
 */
function addAcademicYear(year, startDate, endDate) {
  // STUB FUNCTION - Ready for future implementation
  // TODO: Implement academic year management
  logAudit('SYSTEM', 'ACADEMIC_YEAR_ADDED', {
    year: year,
    startDate: startDate,
    endDate: endDate
  });
  
  return { success: true, message: 'Academic year stub - implement data migration' };
}

/**
 * Add new class to system (STUB)
 * Future implementation: Create class structure, assign default teachers
 */
function addNewClass(schoolId, className, section, capacity) {
  // STUB FUNCTION - Ready for future implementation
  // TODO: Create class in Student_Master structure
  logAudit('SYSTEM', 'CLASS_ADDED', {
    schoolId: schoolId,
    className: className,
    section: section,
    capacity: capacity
  });
  
  return { success: true, message: 'Class addition stub - implement class creation' };
}

