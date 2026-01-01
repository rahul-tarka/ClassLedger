/**
 * ClassLedger by Tarka - Bulk Operations Module
 * Version 2.0 Feature
 */

/**
 * Bulk mark attendance
 */
async function bulkMarkAttendance(studentIds, status, remark = '') {
  if (!studentIds || studentIds.length === 0) {
    Toast.error('No students selected');
    return;
  }
  
  const confirmed = await confirmAction(
    `Mark ${status === 'P' ? 'Present' : status === 'A' ? 'Absent' : 'Late'} for ${studentIds.length} students?`,
    'Bulk Mark Attendance'
  );
  
  if (!confirmed) return;
  
  try {
    showLoading('studentsList', `Marking attendance for ${studentIds.length} students...`);
    
    const results = [];
    for (const studentId of studentIds) {
      try {
        const response = await apiPost('markAttendance', {
          studentId: studentId,
          status: status,
          type: 'CHECK_IN',
          remark: remark
        });
        results.push({ studentId, success: response.success });
      } catch (e) {
        results.push({ studentId, success: false, error: e.message });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;
    
    if (failCount === 0) {
      Toast.success(`Successfully marked attendance for ${successCount} students`);
    } else {
      Toast.warning(`Marked ${successCount} students, ${failCount} failed`);
    }
    
    // Refresh attendance
    await loadTodayAttendance();
  } catch (error) {
    console.error('Bulk mark error:', error);
    Toast.error('Error in bulk marking attendance');
  }
}

/**
 * Enable bulk selection mode
 */
function enableBulkSelection() {
  const studentsList = document.getElementById('studentsList');
  if (!studentsList) return;
  
  // Add checkboxes to each student item
  const studentItems = studentsList.querySelectorAll('.student-item');
  studentItems.forEach(item => {
    if (!item.querySelector('input[type="checkbox"]')) {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'bulk-select-checkbox';
      checkbox.dataset.studentId = item.dataset.studentId;
      item.insertBefore(checkbox, item.firstChild);
    }
  });
  
  // Add bulk actions bar
  if (!document.getElementById('bulkActionsBar')) {
    const bulkBar = document.createElement('div');
    bulkBar.id = 'bulkActionsBar';
    bulkBar.className = 'bulk-actions';
    bulkBar.innerHTML = `
      <input type="checkbox" id="selectAll" onchange="toggleSelectAll(this.checked)">
      <label for="selectAll">Select All</label>
      <span id="selectedCount" style="margin-left: auto; margin-right: 1rem;">0 selected</span>
      <button class="btn btn-success" onclick="bulkMarkSelected('P')">Mark Present</button>
      <button class="btn btn-danger" onclick="bulkMarkSelected('A')">Mark Absent</button>
      <button class="btn btn-warning" onclick="bulkMarkSelected('L')">Mark Late</button>
      <button class="btn btn-secondary" onclick="disableBulkSelection()">Cancel</button>
    `;
    studentsList.parentElement.insertBefore(bulkBar, studentsList);
  }
  
  updateSelectedCount();
}

/**
 * Disable bulk selection mode
 */
function disableBulkSelection() {
  document.querySelectorAll('.bulk-select-checkbox').forEach(cb => cb.remove());
  const bulkBar = document.getElementById('bulkActionsBar');
  if (bulkBar) bulkBar.remove();
}

/**
 * Toggle select all
 */
function toggleSelectAll(checked) {
  document.querySelectorAll('.bulk-select-checkbox').forEach(cb => {
    cb.checked = checked;
  });
  updateSelectedCount();
}

/**
 * Update selected count
 */
function updateSelectedCount() {
  const count = document.querySelectorAll('.bulk-select-checkbox:checked').length;
  const countEl = document.getElementById('selectedCount');
  if (countEl) {
    countEl.textContent = `${count} selected`;
  }
  
  // Add event listeners to checkboxes
  document.querySelectorAll('.bulk-select-checkbox').forEach(cb => {
    cb.removeEventListener('change', updateSelectedCount);
    cb.addEventListener('change', updateSelectedCount);
  });
}

/**
 * Bulk mark selected students
 */
async function bulkMarkSelected(status) {
  const selected = Array.from(document.querySelectorAll('.bulk-select-checkbox:checked'))
    .map(cb => cb.dataset.studentId);
  
  if (selected.length === 0) {
    Toast.warning('Please select at least one student');
    return;
  }
  
  await bulkMarkAttendance(selected, status);
  disableBulkSelection();
}

