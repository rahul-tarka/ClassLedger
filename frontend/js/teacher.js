/**
 * ClassLedger by Tarka - Teacher Dashboard Module
 * Handles attendance marking for teachers
 */

let currentUser = null;
let students = [];
let todayAttendance = {};
let selectedClass = null;

// Pagination state for students list
let studentsPaginationState = {
  currentPage: 1,
  itemsPerPage: 5, // Default: 5 rows to minimize scrolling
  allData: []
};

/**
 * Initialize teacher dashboard
 */
async function initTeacherDashboard() {
  // Check authentication
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }
  
  currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'teacher') {
    showAccessDenied();
    return;
  }
  
  // Setup UI
  setupHeader();
  await loadSchoolInfo();
  await loadClasses();
  
  // Auto-select first class if available
  if (currentUser.classAssigned && currentUser.classAssigned.length > 0) {
    selectedClass = currentUser.classAssigned[0];
    await loadStudents();
    await loadTodayAttendance();
  } else {
    showMessage('No classes assigned. Please contact administrator.', 'error');
  }
}

/**
 * Setup header with user info
 */
function setupHeader() {
  const userNameEl = document.getElementById('userName');
  const userRoleEl = document.getElementById('userRole');
  
  if (userNameEl) userNameEl.textContent = currentUser.name;
  if (userRoleEl) userRoleEl.textContent = 'Teacher';
}

/**
 * Load school information
 */
async function loadSchoolInfo() {
  try {
    console.log('Loading school info...');
    const user = getCurrentUser();
    const supabase = getSupabase();
    
    if (!supabase || !user?.schoolId) return;
    
    const { data: school, error } = await supabase
      .from('schools')
      .select('*')
      .eq('school_id', user.schoolId)
      .single();
    
    if (error) throw error;
    
    const schoolNameEl = document.getElementById('schoolName');
    if (schoolNameEl && school) {
      schoolNameEl.textContent = school.school_name;
    }
  } catch (error) {
    console.error('Load school error:', error);
    showMessage('Error loading school information: ' + error.message, 'error');
  }
}

/**
 * Load available classes for teacher
 */
function loadClasses() {
  if (!currentUser.classAssigned || currentUser.classAssigned.length === 0) {
    return;
  }
  
  const classSelect = document.getElementById('classSelect');
  if (classSelect) {
    classSelect.innerHTML = '<option value="">Select Class</option>';
    currentUser.classAssigned.forEach(className => {
      const option = document.createElement('option');
      option.value = className;
      option.textContent = className;
      classSelect.appendChild(option);
    });
    
    classSelect.addEventListener('change', async (e) => {
      selectedClass = e.target.value;
      if (selectedClass) {
        // Show loading indicators
        showSelectLoading('classSelect');
        showLoading('studentsList', 'Loading students...');
        showLoading('summaryContainer', 'Loading attendance...');
        
        try {
          await loadStudents();
          await loadTodayAttendance();
        } finally {
          hideSelectLoading('classSelect');
        }
      } else {
        // Clear when no class selected
        document.getElementById('studentsList').innerHTML = '<p class="text-center">Please select a class</p>';
        document.getElementById('summaryContainer').style.display = 'none';
      }
    });
  }
}

/**
 * Load students for selected class
 */
async function loadStudents() {
  if (!selectedClass) return;
  
  try {
    showLoading('studentsList');
    console.log('Loading students for class:', selectedClass);
    const user = getCurrentUser();
    const supabase = getSupabase();
    
    if (!supabase || !user?.schoolId) {
      throw new Error('Supabase not initialized or user not found');
    }
    
    const { data: studentsData, error } = await supabase
      .from('students')
      .select('*')
      .eq('school_id', user.schoolId)
      .eq('class', selectedClass)
      .eq('active', true)
      .order('roll', { ascending: true });
    
    if (error) throw error;
    
    // Transform to expected format
    students = (studentsData || []).map(s => ({
      studentId: s.student_id,
      name: s.name,
      class: s.class,
      section: s.section,
      roll: s.roll,
      parentMobile: s.parent_mobile
    }));
    
    console.log('Loaded students:', students.length);
    renderStudents();
  } catch (error) {
    console.error('Load students error:', error);
    showMessage('Error loading students: ' + error.message, 'error');
  } finally {
    hideLoading('studentsList');
  }
}

/**
 * Load today's attendance
 */
async function loadTodayAttendance() {
  if (!selectedClass) return;
  
  try {
    const user = getCurrentUser();
    const supabase = getSupabase();
    
    if (!supabase || !user?.schoolId) return;
    
    const today = new Date().toISOString().split('T')[0];
    const studentIds = students.map(s => s.studentId);
    
    const { data: logs, error } = await supabase
      .from('attendance_log')
      .select('*')
      .eq('school_id', user.schoolId)
      .eq('date', today)
      .in('student_id', studentIds);
    
    if (error) throw error;
    
    // Transform to expected format
    todayAttendance = {};
    (logs || []).forEach(log => {
      todayAttendance[log.student_id] = {
        checkIn: {
          time: log.check_in_time || '',
          teacherEmail: log.teacher_email || ''
        },
        status: log.status || 'A'
      };
    });
    
    updateSummary();
    updateStudentButtons();
  } catch (error) {
    console.error('Load attendance error:', error);
  }
}

/**
 * Render students list with pagination
 */
function renderStudents() {
  const container = document.getElementById('studentsList');
  if (!container) return;
  
  // Store all data for pagination
  studentsPaginationState.allData = students || [];
  
  if (studentsPaginationState.allData.length === 0) {
    container.innerHTML = '<p class="text-center">No students found</p>';
    // Clear pagination
    const paginationContainer = document.getElementById('teacherStudentsPagination');
    const paginationInfo = document.getElementById('teacherStudentsPaginationInfo');
    const itemsPerPageSelector = document.getElementById('teacherStudentsItemsPerPage');
    if (paginationContainer) paginationContainer.innerHTML = '';
    if (paginationInfo) paginationInfo.innerHTML = '';
    if (itemsPerPageSelector) itemsPerPageSelector.innerHTML = '';
    return;
  }
  
  // Paginate data
  const paginationResult = paginateData(
    studentsPaginationState.allData,
    studentsPaginationState.currentPage,
    studentsPaginationState.itemsPerPage
  );
  
  container.innerHTML = paginationResult.data.map(student => `
    <div class="student-item" data-student-id="${student.studentId}">
      <div class="student-info">
        <div class="student-name">${student.name}</div>
        <div class="student-details">
          Roll: ${student.roll} | Section: ${student.section}
        </div>
      </div>
      <div class="attendance-buttons" data-student-id="${student.studentId}">
        <button class="btn-attendance btn-present" 
                onclick="markAttendance('${student.studentId}', 'P')"
                data-status="P">
          Present
        </button>
        <button class="btn-attendance btn-absent" 
                onclick="markAttendance('${student.studentId}', 'A')"
                data-status="A">
          Absent
        </button>
        <button class="btn-attendance btn-late" 
                onclick="markAttendance('${student.studentId}', 'L')"
                data-status="L">
          Late
        </button>
      </div>
    </div>
  `).join('');
  
  // Render pagination controls
  createPagination(
    paginationResult.currentPage,
    paginationResult.totalPages,
    (page) => {
      studentsPaginationState.currentPage = page;
      renderStudents();
    },
    'teacherStudentsPagination'
  );
  
  // Render pagination info
  createPaginationInfo(paginationResult, 'teacherStudentsPaginationInfo');
  
  // Render items per page selector
  createItemsPerPageSelector(
    studentsPaginationState.itemsPerPage,
    (itemsPerPage) => {
      studentsPaginationState.itemsPerPage = itemsPerPage;
      studentsPaginationState.currentPage = 1;
      renderStudents();
    },
    'teacherStudentsItemsPerPage'
  );
  
  // Update buttons after rendering
  updateStudentButtons();
}

/**
 * Update attendance buttons based on current status
 */
function updateStudentButtons() {
  students.forEach(student => {
    const attendance = todayAttendance[student.studentId];
    const buttons = document.querySelectorAll(`[data-student-id="${student.studentId}"] .btn-attendance`);
    
    buttons.forEach(btn => {
      btn.classList.remove('active');
      if (attendance && attendance.checkIn) {
        const currentStatus = attendance.status;
        if (btn.dataset.status === currentStatus) {
          btn.classList.add('active');
        }
        // Disable buttons if already marked (can edit within 15 min)
        if (attendance.checkIn && !canEdit(attendance.time)) {
          btn.disabled = true;
        }
      }
    });
  });
}

/**
 * Get late remark input (card-based)
 */
function getLateRemarkInput() {
  return new Promise((resolve) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10000; max-width: 400px; width: 90%; background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
    card.innerHTML = `
      <h3 style="margin-bottom: 1rem;">Late Arrival Reason</h3>
      <p style="color: #666; margin-bottom: 1rem; font-size: 0.875rem;">Enter reason for late arrival (optional)</p>
      <textarea id="lateRemarkInput" class="form-input" rows="3" placeholder="Enter reason..." style="width: 100%; margin-bottom: 1rem;"></textarea>
      <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
        <button class="btn btn-secondary" onclick="this.closest('.card').remove(); window.__lateRemarkResult = '';">Skip</button>
        <button class="btn btn-primary" onclick="window.__lateRemarkResult = document.getElementById('lateRemarkInput').value.trim(); this.closest('.card').remove();">Save</button>
      </div>
    `;
    
    document.body.appendChild(card);
    
    // Focus textarea
    setTimeout(() => document.getElementById('lateRemarkInput')?.focus(), 100);
    
    // Handle save
    card.querySelector('.btn-primary').addEventListener('click', () => {
      const remark = document.getElementById('lateRemarkInput').value.trim();
      resolve(remark);
    });
    
    // Handle skip
    card.querySelector('.btn-secondary').addEventListener('click', () => {
      resolve('');
    });
    
    // Handle Enter key
    card.querySelector('#lateRemarkInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        card.querySelector('.btn-primary').click();
      }
    });
  });
}

/**
 * Check if attendance can be edited (within 15 minutes)
 */
function canEdit(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const logTime = new Date();
  logTime.setHours(hours, minutes, 0, 0);
  
  const now = new Date();
  const diffMinutes = (now - logTime) / (1000 * 60);
  
  return diffMinutes <= 15;
}

/**
 * Mark attendance for a student
 */
async function markAttendance(studentId, status) {
  if (!selectedClass) {
    showToast('Please select a class', 'error');
    return;
  }
  
  const student = students.find(s => s.studentId === studentId);
  if (!student) return;
  
  // Check if already marked
  const existing = todayAttendance[studentId];
  if (existing && existing.checkIn) {
    if (!canEdit(existing.time)) {
      showToast('Attendance already marked. Edit window expired (15 minutes)', 'error');
      return;
    }
    
    // Show edit confirmation using new confirm dialog
    const confirmed = typeof confirmDialog !== 'undefined' 
      ? await confirmDialog('Attendance already exists. Do you want to update it?', 'Update Attendance')
      : confirm('Attendance already exists. Do you want to update it?');
    
    if (!confirmed) {
      return;
    }
    
    // Edit existing
    await editAttendance(existing.logId, status);
    return;
  }
  
  // Show remark card for late students
  let remark = '';
  if (status === 'L') {
    remark = await getLateRemarkInput();
  }
  
  try {
    showLoading('studentsList');
    const user = getCurrentUser();
    const supabase = getSupabase();
    
    if (!supabase || !user?.schoolId) {
      throw new Error('Supabase not initialized or user not found');
    }
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0].substring(0, 5);
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    const logId = 'LOG' + Date.now().toString();
    
    const { error } = await supabase
      .from('attendance_log')
      .insert({
        log_id: logId,
        date: today,
        check_in_time: now,
        student_id: studentId,
        school_id: user.schoolId,
        class: selectedClass,
        section: students.find(s => s.studentId === studentId)?.section || '',
        status: status,
        teacher_email: user.email,
        remark: remark || null,
        day_name: dayName
      });
    
    if (error) throw error;
    
    showToast('Attendance marked successfully', 'success');
    await loadTodayAttendance();
    // Auto-save after marking
    if (autoSave) {
      const attendanceData = getAttendanceDataForAutoSave();
      autoSave.save(selectedClass, attendanceData);
    }
  } catch (error) {
    console.error('Mark attendance error:', error);
    showToast('Error marking attendance: ' + error.message, 'error');
  } finally {
    hideLoading('studentsList');
  }
}

/**
 * Edit existing attendance
 */
async function editAttendance(logId, newStatus) {
  let remark = '';
  if (newStatus === 'L') {
    remark = await getLateRemarkInput();
  }
  
  try {
    const user = getCurrentUser();
    const supabase = getSupabase();
    
    if (!supabase || !user?.schoolId) {
      throw new Error('Supabase not initialized or user not found');
    }
    
    const { error } = await supabase
      .from('attendance_log')
      .update({
        status: newStatus,
        remark: remark || null,
        updated_at: new Date().toISOString()
      })
      .eq('log_id', logId)
      .eq('school_id', user.schoolId);
    
    if (error) throw error;
    
    showToast('Attendance updated successfully', 'success');
    await loadTodayAttendance();
  } catch (error) {
    console.error('Edit attendance error:', error);
    showToast('Error updating attendance: ' + error.message, 'error');
  }
}

/**
 * Mark check-out for a student
 */
async function markCheckOut(studentId) {
  try {
    const user = getCurrentUser();
    const supabase = getSupabase();
    
    if (!supabase || !user?.schoolId) {
      throw new Error('Supabase not initialized or user not found');
    }
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0].substring(0, 5);
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    const logId = 'LOG' + Date.now().toString();
    
    const { error } = await supabase
      .from('attendance_log')
      .insert({
        log_id: logId,
        date: today,
        check_in_time: now,
        student_id: studentId,
        school_id: user.schoolId,
        class: selectedClass,
        section: students.find(s => s.studentId === studentId)?.section || '',
        status: null, // No status for check-out
        teacher_email: user.email,
        remark: 'CHECK_OUT',
        day_name: dayName
      });
    
    if (error) throw error;
    
    showMessage('Check-out recorded successfully', 'success');
    await loadTodayAttendance();
  } catch (error) {
    console.error('Check-out error:', error);
    showMessage('Error recording check-out: ' + error.message, 'error');
  }
}

/**
 * Update summary statistics
 */
function updateSummary() {
  let present = 0;
  let absent = 0;
  let late = 0;
  let total = students.length;
  
  students.forEach(student => {
    const attendance = todayAttendance[student.studentId];
    if (attendance && attendance.checkIn) {
      const status = attendance.status;
      if (status === 'P') present++;
      if (status === 'A') absent++;
      if (status === 'L') late++;
    } else {
      absent++; // Not marked = absent
    }
  });
  
  const presentEl = document.getElementById('summaryPresent');
  const absentEl = document.getElementById('summaryAbsent');
  const lateEl = document.getElementById('summaryLate');
  const totalEl = document.getElementById('summaryTotal');
  
  if (presentEl) presentEl.textContent = present;
  if (absentEl) absentEl.textContent = absent;
  if (lateEl) lateEl.textContent = late;
  if (totalEl) totalEl.textContent = total;
}

/**
 * Submit attendance (confirmation)
 */
function submitAttendance() {
  const marked = Object.keys(todayAttendance).length;
  const total = students.length;
  
  if (marked === 0) {
    showToast('Please mark attendance for at least one student', 'error');
    return;
  }
  
  confirmDialog(`Submit attendance for ${marked} out of ${total} students?`, 'Confirm Submission').then(confirmed => {
    if (confirmed) {
      showToast('Attendance submitted successfully', 'success');
      // Attendance is already saved, just show confirmation
    }
  });
}

/**
 * Utility functions
 */
function showLoading(elementId, message = 'Loading...') {
  const el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = `<div class="loading"><div class="spinner"></div>${message}</div>`;
  }
}

function hideLoading(elementId) {
  // Will be replaced by render functions
}

/**
 * Show loading indicator on select/dropdown
 */
function showSelectLoading(selectId) {
  const select = document.getElementById(selectId);
  if (select) {
    select.classList.add('select-loading');
    select.disabled = true;
  }
}

/**
 * Hide loading indicator on select/dropdown
 */
function hideSelectLoading(selectId) {
  const select = document.getElementById(selectId);
  if (select) {
    select.classList.remove('select-loading');
    select.disabled = false;
  }
}

function showMessage(message, type = 'info') {
  // Use Toast if available, otherwise fallback to alert
  if (typeof Toast !== 'undefined') {
    Toast[type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'](message);
  } else {
    // Fallback to old alert system
    const alert = document.createElement('div');
    alert.className = `alert alert-${type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'}`;
    alert.textContent = message;
    
    const container = document.querySelector('.container');
    if (container) {
      container.insertBefore(alert, container.firstChild);
      setTimeout(() => alert.remove(), 5000);
    }
  }
}

/**
 * Get attendance data for auto-save
 */
function getAttendanceDataForAutoSave() {
  return todayAttendance || {};
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initTeacherDashboard();
    
    // Setup real-time updates cleanup on page unload
    window.addEventListener('beforeunload', () => {
      if (typeof realTimeUpdates !== 'undefined') {
        realTimeUpdates.stopAll();
      }
      if (typeof autoSave !== 'undefined') {
        autoSave.stopAutoSave();
      }
    });
  });
} else {
  initTeacherDashboard();
  
  // Setup real-time updates cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (typeof realTimeUpdates !== 'undefined') {
      realTimeUpdates.stopAll();
    }
    if (typeof autoSave !== 'undefined') {
      autoSave.stopAutoSave();
    }
  });
}

