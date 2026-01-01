/**
 * ClassLedger by Tarka - Principal Dashboard Module
 * Read-only dashboards for principals
 */

// Principal dashboard uses the same logic as admin but with read-only restrictions
// Import admin functions and override edit capabilities

let currentUser = null;

/**
 * Initialize principal dashboard
 */
async function initPrincipalDashboard() {
  // Check authentication
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }
  
  currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'principal') {
    showAccessDenied();
    return;
  }
  
  // Setup UI
  setupHeader();
  await loadSchoolInfo();
  
  // Load overview statistics
  await loadOverviewStats();
  
  // Setup filters
  setupFilters();
  
  // Disable all edit buttons (read-only mode)
  disableEditButtons();
}

/**
 * Setup header with user info
 */
function setupHeader() {
  const userNameEl = document.getElementById('userName');
  const userRoleEl = document.getElementById('userRole');
  
  if (userNameEl) userNameEl.textContent = currentUser.name;
  if (userRoleEl) userRoleEl.textContent = 'Principal';
}

/**
 * Load school information
 */
async function loadSchoolInfo() {
  try {
    const response = await apiGet('getSchool');
    if (response.success && response.data) {
      const schoolNameEl = document.getElementById('schoolName');
      if (schoolNameEl) {
        schoolNameEl.textContent = response.data.schoolName;
      }
    }
  } catch (error) {
    console.error('Load school error:', error);
  }
}

/**
 * Load overview statistics
 */
async function loadOverviewStats() {
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Get all classes
    const studentsResponse = await apiGet('getStudents', {});
    if (studentsResponse.success) {
      const classes = [...new Set(studentsResponse.data.map(s => s.class))];
      
      let totalPresent = 0;
      let totalAbsent = 0;
      let totalLate = 0;
      let totalStudents = 0;
      
      // Aggregate across all classes
      for (const className of classes) {
        const attendanceResponse = await apiGet('getTodayAttendance', {
          class: className,
          date: today
        });
        
        if (attendanceResponse.success) {
          const attendance = attendanceResponse.data || {};
          const classStudents = studentsResponse.data.filter(s => s.class === className);
          totalStudents += classStudents.length;
          
          Object.keys(attendance).forEach(studentId => {
            const att = attendance[studentId];
            if (att && att.checkIn) {
              const status = att.status;
              if (status === 'P') totalPresent++;
              if (status === 'A') totalAbsent++;
              if (status === 'L') totalLate++;
            }
          });
        }
      }
      
      renderOverviewStats({
        totalStudents,
        present: totalPresent,
        absent: totalAbsent,
        late: totalLate
      });
    }
  } catch (error) {
    console.error('Load overview error:', error);
  }
}

/**
 * Render overview statistics
 */
function renderOverviewStats(stats) {
  const container = document.getElementById('overviewStats');
  if (!container) return;
  
  const attendanceRate = stats.totalStudents > 0 
    ? ((stats.present / stats.totalStudents) * 100).toFixed(1)
    : 0;
  
  container.innerHTML = `
    <div class="summary">
      <div class="summary-card">
        <div class="summary-label">Total Students</div>
        <div class="summary-value">${stats.totalStudents}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Present Today</div>
        <div class="summary-value present">${stats.present}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Absent Today</div>
        <div class="summary-value absent">${stats.absent}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Late Today</div>
        <div class="summary-value late">${stats.late}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Attendance Rate</div>
        <div class="summary-value">${attendanceRate}%</div>
      </div>
    </div>
  `;
}

/**
 * Setup filters for reports
 */
function setupFilters() {
  // Reuse admin dashboard functionality but in read-only mode
  // Principal can view all reports but cannot edit
}

/**
 * Disable all edit buttons (read-only mode)
 */
function disableEditButtons() {
  const editButtons = document.querySelectorAll('button[data-action="edit"]');
  editButtons.forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
  });
  
  // Show read-only badge
  const header = document.querySelector('header');
  if (header) {
    const badge = document.createElement('span');
    badge.textContent = 'Read-Only Mode';
    badge.style.cssText = 'background: var(--warning-color); color: white; padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.875rem;';
    header.querySelector('.user-info')?.appendChild(badge);
  }
}

/**
 * Load class-wise report
 */
async function loadClassReport(className, date) {
  try {
    const response = await apiGet('getTodayAttendance', {
      class: className,
      date: date || new Date().toISOString().split('T')[0]
    });
    
    if (response.success) {
      return response.data;
    }
  } catch (error) {
    console.error('Load class report error:', error);
  }
  return {};
}

/**
 * Show message
 */
function showMessage(message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'}`;
  alert.textContent = message;
  
  const container = document.querySelector('.container');
  if (container) {
    container.insertBefore(alert, container.firstChild);
    
    setTimeout(() => {
      alert.remove();
    }, 5000);
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPrincipalDashboard);
} else {
  initPrincipalDashboard();
}

