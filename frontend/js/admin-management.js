/**
 * ClassLedger by Tarka - Admin Management Module
 * Full CRUD operations for students, teachers, and system settings
 */

// Pagination state
let studentsPaginationState = {
  currentPage: 1,
  itemsPerPage: 25,
  filteredData: []
};

let teachersPaginationState = {
  currentPage: 1,
  itemsPerPage: 25,
  filteredData: []
};

/**
 * Load all students for management
 */
async function loadAllStudentsForManagement() {
  try {
    showLoading('studentsList', 'Loading students...');
    const user = getCurrentUser();
    const supabase = getSupabase();
    
    if (!supabase || !user?.schoolId) {
      throw new Error('Supabase not initialized or user not found');
    }
    
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .eq('school_id', user.schoolId)
      .eq('active', true)
      .order('class', { ascending: true })
      .order('section', { ascending: true })
      .order('roll', { ascending: true });
    
    if (error) throw error;
    
    // Transform to match expected format
    const formattedStudents = (students || []).map(s => ({
      studentId: s.student_id,
      name: s.name,
      class: s.class,
      section: s.section,
      roll: s.roll,
      parentMobile: s.parent_mobile,
      parentName: s.parent_name,
      whatsappAlertEnabled: s.whatsapp_alert_enabled,
      active: s.active
    }));
    
    // Store in cache and update filters
    allStudentsCache = formattedStudents;
    studentsPaginationState.filteredData = formattedStudents;
    
    // Populate class filter
    const classes = [...new Set(formattedStudents.map(s => s.class))].sort();
    const classFilter = document.getElementById('studentClassFilter');
    if (classFilter) {
      const currentValue = classFilter.value;
      classFilter.innerHTML = '<option value="">All Classes</option>' + 
        classes.map(c => `<option value="${c}" ${c === currentValue ? 'selected' : ''}>${c}</option>`).join('');
    }
    
    renderStudentsTableWithPagination();
  } catch (error) {
    console.error('Load students error:', error);
    showToast('Error loading students', 'error');
    document.getElementById('studentsList').innerHTML = '<p class="text-center">Error loading students</p>';
  }
}

/**
 * Render students table with pagination
 */
function renderStudentsTableWithPagination() {
  const { currentPage, itemsPerPage, filteredData } = studentsPaginationState;
  const paginationResult = paginateData(filteredData, currentPage, itemsPerPage);
  
  renderStudentsTable(paginationResult.data);
  
  // Create pagination controls
  createPagination(
    currentPage,
    paginationResult.totalPages,
    'changeStudentsPage',
    'studentsPagination'
  );
  
  // Create pagination info
  createPaginationInfo(paginationResult, 'studentsPaginationInfo');
  
  // Create items per page selector
  createItemsPerPageSelector(
    itemsPerPage,
    'changeStudentsItemsPerPage',
    'studentsItemsPerPage'
  );
}

/**
 * Change students page
 */
function changeStudentsPage(page) {
  studentsPaginationState.currentPage = page;
  renderStudentsTableWithPagination();
  // Scroll to top of table
  document.getElementById('studentsList')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Change students items per page
 */
function changeStudentsItemsPerPage(itemsPerPage) {
  studentsPaginationState.itemsPerPage = itemsPerPage;
  studentsPaginationState.currentPage = 1; // Reset to first page
  renderStudentsTableWithPagination();
}

/**
 * Render students table
 */
function renderStudentsTable(students) {
  const container = document.getElementById('studentsList');
  if (!container) return;
  
  if (!students || students.length === 0) {
    container.innerHTML = '<p class="text-center">No students found</p>';
    return;
  }
  
  let html = `
    <div style="overflow-x: auto;">
      <table class="table" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: var(--bg-color); border-bottom: 2px solid var(--border-color);">
            <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Student ID</th>
            <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Name</th>
            <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Class</th>
            <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Section</th>
            <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Roll</th>
            <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Parent Mobile</th>
            <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Status</th>
            <th style="padding: 0.75rem; text-align: center; font-weight: 600;">Actions</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  students.forEach(student => {
    // Get attendance correlation (quick stats)
    const attendanceStats = getStudentAttendanceStats(student.studentId);
    
    html += `
      <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.2s;" 
          onmouseover="this.style.background='var(--bg-color)'" 
          onmouseout="this.style.background='transparent'">
        <td style="padding: 0.75rem;">
          <div style="font-weight: 500;">${student.studentId || ''}</div>
          ${attendanceStats ? `<div style="font-size: 0.75rem; color: var(--text-secondary);">📊 ${attendanceStats.present}/${attendanceStats.total} days</div>` : ''}
        </td>
        <td style="padding: 0.75rem;">
          <div style="font-weight: 500;">${student.name || ''}</div>
          ${student.parentName ? `<div style="font-size: 0.75rem; color: var(--text-secondary);">👤 ${student.parentName}</div>` : ''}
        </td>
        <td style="padding: 0.75rem;">
          <span class="badge badge-info" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem;">${student.class || ''}</span>
        </td>
        <td style="padding: 0.75rem;">${student.section || ''}</td>
        <td style="padding: 0.75rem; font-weight: 500;">${student.roll || ''}</td>
        <td style="padding: 0.75rem;">
          ${student.parentMobile ? `<a href="tel:${student.parentMobile}" style="color: var(--primary-color); text-decoration: none;">📞 ${student.parentMobile}</a>` : 'N/A'}
        </td>
        <td style="padding: 0.75rem;">
          <span class="badge ${student.active ? 'badge-success' : 'badge-danger'}">
            ${student.active ? '✅ Active' : '❌ Inactive'}
          </span>
          ${student.whatsappAlertEnabled ? '<div style="font-size: 0.75rem; color: var(--success-color); margin-top: 0.25rem;">📱 Alerts ON</div>' : ''}
        </td>
        <td style="padding: 0.75rem; text-align: center;">
          <div style="display: flex; gap: 0.5rem; justify-content: center;">
            <button class="btn btn-sm btn-primary" onclick="openEditStudentModal('${student.studentId}')" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;">✏️ Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student.studentId}')" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;">🗑️ Delete</button>
          </div>
        </td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  container.innerHTML = html;
}

/**
 * Get student attendance stats (correlation)
 */
function getStudentAttendanceStats(studentId) {
  // This would be enhanced to fetch from cache or make a quick query
  // For now, return null (can be enhanced later)
  return null;
}

/**
 * Search students
 */
let allStudentsCache = [];
async function searchStudents() {
  const searchTerm = document.getElementById('studentSearch')?.value.toLowerCase() || '';
  
  if (!allStudentsCache.length) {
    const user = getCurrentUser();
    const supabase = getSupabase();
    
    if (!supabase || !user?.schoolId) return;
    
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .eq('school_id', user.schoolId)
      .eq('active', true);
    
    if (!error && students) {
      allStudentsCache = students.map(s => ({
        studentId: s.student_id,
        name: s.name,
        class: s.class,
        section: s.section,
        roll: s.roll,
        parentMobile: s.parent_mobile,
        parentName: s.parent_name,
        whatsappAlertEnabled: s.whatsapp_alert_enabled,
        active: s.active
      }));
    }
  }
  
  const filtered = allStudentsCache.filter(student => {
    return (
      (student.name || '').toLowerCase().includes(searchTerm) ||
      (student.studentId || '').toLowerCase().includes(searchTerm) ||
      (student.class || '').toLowerCase().includes(searchTerm) ||
      (student.roll || '').toString().includes(searchTerm)
    );
  });
  
  studentsPaginationState.filteredData = filtered;
  studentsPaginationState.currentPage = 1; // Reset to first page
  renderStudentsTableWithPagination();
}

/**
 * Filter students by class and status
 */
function filterStudents() {
  const classFilter = document.getElementById('studentClassFilter')?.value || '';
  const statusFilter = document.getElementById('studentStatusFilter')?.value || '';
  const searchTerm = document.getElementById('studentSearch')?.value.toLowerCase() || '';
  
  let filtered = allStudentsCache.filter(student => {
    const matchesClass = !classFilter || student.class === classFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && student.active) ||
      (statusFilter === 'inactive' && !student.active);
    const matchesSearch = !searchTerm || 
      (student.name || '').toLowerCase().includes(searchTerm) ||
      (student.studentId || '').toLowerCase().includes(searchTerm) ||
      (student.class || '').toLowerCase().includes(searchTerm) ||
      (student.roll || '').toString().includes(searchTerm);
    
    return matchesClass && matchesStatus && matchesSearch;
  });
  
  studentsPaginationState.filteredData = filtered;
  studentsPaginationState.currentPage = 1;
  renderStudentsTableWithPagination();
}

/**
 * Open add student modal
 */
function openAddStudentModal() {
  // Simple prompt for now, can be enhanced with proper modal
  const name = prompt('Enter student name:');
  if (!name) return;
  
  const className = prompt('Enter class:');
  if (!className) return;
  
  const section = prompt('Enter section:') || 'A';
  const roll = prompt('Enter roll number:') || '1';
  const parentMobile = prompt('Enter parent mobile:') || '';
  
  addStudent({
    name,
    class: className,
    section,
    roll: parseInt(roll) || 1,
    parentMobile
  });
}

/**
 * Add new student
 */
async function addStudent(studentData) {
  try {
    const user = getCurrentUser();
    const supabase = getSupabase();
    
    if (!supabase || !user?.schoolId) {
      throw new Error('Supabase not initialized or user not found');
    }
    
    const studentId = 'STU' + Date.now().toString().slice(-10);
    
    const { error } = await supabase
      .from('students')
      .insert({
        student_id: studentId,
        school_id: user.schoolId,
        name: studentData.name,
        class: studentData.class,
        section: studentData.section,
        roll: studentData.roll,
        parent_mobile: studentData.parentMobile || null,
        parent_name: studentData.parentName || null,
        active: true,
        whatsapp_alert_enabled: false
      });
    
    if (error) throw error;
    
      showToast('Student added successfully', 'success');
      allStudentsCache = []; // Clear cache
      await loadAllStudentsForManagement();
  } catch (error) {
    console.error('Add student error:', error);
    showToast('Error adding student: ' + error.message, 'error');
  }
}

/**
 * Open edit student modal
 */
function openEditStudentModal(studentId) {
  const student = allStudentsCache.find(s => s.studentId === studentId);
  if (!student) {
    showToast('Student not found', 'error');
    return;
  }
  
  const name = prompt('Enter student name:', student.name || '');
  if (name === null) return;
  
  const className = prompt('Enter class:', student.class || '');
  if (className === null) return;
  
  const section = prompt('Enter section:', student.section || 'A');
  const roll = prompt('Enter roll number:', student.roll || '1');
  const parentMobile = prompt('Enter parent mobile:', student.parentMobile || '');
  const active = confirm('Is student active?') ? 'true' : 'false';
  
  updateStudent(studentId, {
    name,
    class: className,
    section,
    roll: parseInt(roll) || 1,
    parentMobile,
    active
  });
}

/**
 * Update student
 */
async function updateStudent(studentId, studentData) {
  try {
    const user = getCurrentUser();
    const supabase = getSupabase();
    
    if (!supabase || !user?.schoolId) {
      throw new Error('Supabase not initialized or user not found');
    }
    
    const { error } = await supabase
      .from('students')
      .update({
        name: studentData.name,
        class: studentData.class,
        section: studentData.section,
        roll: studentData.roll,
        parent_mobile: studentData.parentMobile || null,
        parent_name: studentData.parentName || null,
        active: studentData.active !== 'false',
        updated_at: new Date().toISOString()
      })
      .eq('student_id', studentId)
      .eq('school_id', user.schoolId);
    
    if (error) throw error;
    
    showToast('Student updated successfully', 'success');
    await loadAllStudentsForManagement();
    allStudentsCache = []; // Clear cache
  } catch (error) {
    console.error('Update student error:', error);
    showToast('Error updating student: ' + error.message, 'error');
  }
}

/**
 * Delete student
 */
async function deleteStudent(studentId) {
  if (!confirm(`Are you sure you want to delete student ${studentId}?`)) {
    return;
  }
  
  try {
    const user = getCurrentUser();
    const supabase = getSupabase();
    
    if (!supabase || !user?.schoolId) {
      throw new Error('Supabase not initialized or user not found');
    }
    
    const { error } = await supabase
      .from('students')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('student_id', studentId)
      .eq('school_id', user.schoolId);
    
    if (error) throw error;
    
    showToast('Student deleted successfully', 'success');
    await loadAllStudentsForManagement();
    allStudentsCache = []; // Clear cache
  } catch (error) {
    console.error('Delete student error:', error);
    showToast('Error deleting student: ' + error.message, 'error');
  }
}

/**
 * Open bulk import modal
 */
function openBulkImportModal() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await bulkImportStudents(file);
      await loadAllStudentsForManagement();
      allStudentsCache = []; // Clear cache
    }
  };
  input.click();
}

/**
 * Load all teachers for management
 */
async function loadAllTeachersForManagement() {
  try {
    showLoading('teachersList', 'Loading teachers...');
    const user = getCurrentUser();
    const supabase = getSupabase();
    
    if (!supabase || !user?.schoolId) {
      throw new Error('Supabase not initialized or user not found');
    }
    
    const { data: teachers, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('school_id', user.schoolId)
      .eq('active', true)
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    // Transform to match expected format
    const formattedTeachers = (teachers || []).map(t => ({
      email: t.email,
      name: t.name,
      role: t.role,
      classAssigned: t.class_assigned || [],
      phone: t.phone,
      active: t.active,
      created_at: t.created_at
    }));
    
    // Store in cache
    teachersPaginationState.filteredData = formattedTeachers;
    
    renderTeachersTableWithPagination();
  } catch (error) {
    console.error('Load teachers error:', error);
    showToast('Error loading teachers', 'error');
    document.getElementById('teachersList').innerHTML = '<p class="text-center">Error loading teachers</p>';
  }
}

/**
 * Render teachers table with pagination
 */
function renderTeachersTableWithPagination() {
  const { currentPage, itemsPerPage, filteredData } = teachersPaginationState;
  const paginationResult = paginateData(filteredData, currentPage, itemsPerPage);
  
  renderTeachersTable(paginationResult.data);
  
  // Create pagination controls
  createPagination(
    currentPage,
    paginationResult.totalPages,
    'changeTeachersPage',
    'teachersPagination'
  );
  
  // Create pagination info
  createPaginationInfo(paginationResult, 'teachersPaginationInfo');
  
  // Create items per page selector
  createItemsPerPageSelector(
    itemsPerPage,
    'changeTeachersItemsPerPage',
    'teachersItemsPerPage'
  );
}

/**
 * Change teachers page
 */
function changeTeachersPage(page) {
  teachersPaginationState.currentPage = page;
  renderTeachersTableWithPagination();
  document.getElementById('teachersList')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Change teachers items per page
 */
function changeTeachersItemsPerPage(itemsPerPage) {
  teachersPaginationState.itemsPerPage = itemsPerPage;
  teachersPaginationState.currentPage = 1;
  renderTeachersTableWithPagination();
}

/**
 * Render teachers table
 */
function renderTeachersTable(teachers) {
  const container = document.getElementById('teachersList');
  if (!container) return;
  
  if (!teachers || teachers.length === 0) {
    container.innerHTML = '<p class="text-center">No teachers found</p>';
    return;
  }
  
  let html = `
    <div style="overflow-x: auto;">
      <table class="table" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: var(--bg-color); border-bottom: 2px solid var(--border-color);">
            <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Email</th>
            <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Name</th>
            <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Role</th>
            <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Classes Assigned</th>
            <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Status</th>
            <th style="padding: 0.75rem; text-align: center; font-weight: 600;">Actions</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  teachers.forEach(teacher => {
    const classCount = (teacher.classAssigned || []).length;
    const roleBadgeColor = teacher.role === 'admin' ? 'badge-danger' : 
                          teacher.role === 'principal' ? 'badge-warning' : 'badge-info';
    
    html += `
      <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.2s;" 
          onmouseover="this.style.background='var(--bg-color)'" 
          onmouseout="this.style.background='transparent'">
        <td style="padding: 0.75rem;">
          <div style="font-weight: 500;">${teacher.email || ''}</div>
          ${teacher.phone ? `<div style="font-size: 0.75rem; color: var(--text-secondary);">📞 ${teacher.phone}</div>` : ''}
        </td>
        <td style="padding: 0.75rem;">
          <div style="font-weight: 500;">${teacher.name || ''}</div>
          ${teacher.created_at ? `<div style="font-size: 0.75rem; color: var(--text-secondary);">Joined: ${new Date(teacher.created_at).toLocaleDateString()}</div>` : ''}
        </td>
        <td style="padding: 0.75rem;">
          <span class="badge ${roleBadgeColor}" style="padding: 0.25rem 0.75rem; border-radius: 0.25rem;">
            ${teacher.role === 'admin' ? '👑 Admin' : teacher.role === 'principal' ? '🎓 Principal' : '👨‍🏫 Teacher'}
          </span>
        </td>
        <td style="padding: 0.75rem;">
          ${classCount > 0 ? `
            <div style="display: flex; flex-wrap: wrap; gap: 0.25rem;">
              ${(teacher.classAssigned || []).slice(0, 3).map(c => `
                <span class="badge badge-info" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">${c}</span>
              `).join('')}
              ${classCount > 3 ? `<span style="font-size: 0.75rem; color: var(--text-secondary);">+${classCount - 3} more</span>` : ''}
            </div>
          ` : '<span style="color: var(--text-secondary); font-style: italic;">No classes assigned</span>'}
        </td>
        <td style="padding: 0.75rem;">
          <span class="badge ${teacher.active ? 'badge-success' : 'badge-danger'}">
            ${teacher.active ? '✅ Active' : '❌ Inactive'}
          </span>
        </td>
        <td style="padding: 0.75rem; text-align: center;">
          <div style="display: flex; gap: 0.5rem; justify-content: center;">
            <button class="btn btn-sm btn-primary" onclick="openEditTeacherModal('${teacher.email}')" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;">✏️ Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteTeacher('${teacher.email}')" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;">🗑️ Delete</button>
          </div>
        </td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  container.innerHTML = html;
}

/**
 * Search teachers
 */
function searchTeachers() {
  const searchTerm = document.getElementById('teacherSearch')?.value.toLowerCase() || '';
  filterTeachers();
}

/**
 * Filter teachers by role and status
 */
function filterTeachers() {
  const roleFilter = document.getElementById('teacherRoleFilter')?.value || '';
  const statusFilter = document.getElementById('teacherStatusFilter')?.value || '';
  const searchTerm = document.getElementById('teacherSearch')?.value.toLowerCase() || '';
  
  // Get all teachers from cache (would need to be stored)
  const allTeachers = teachersPaginationState.filteredData.length > 0 ? 
    teachersPaginationState.filteredData : 
    []; // Fallback - would need to reload if empty
  
  let filtered = allTeachers.filter(teacher => {
    const matchesRole = !roleFilter || teacher.role === roleFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && teacher.active) ||
      (statusFilter === 'inactive' && !teacher.active);
    const matchesSearch = !searchTerm || 
      (teacher.name || '').toLowerCase().includes(searchTerm) ||
      (teacher.email || '').toLowerCase().includes(searchTerm);
    
    return matchesRole && matchesStatus && matchesSearch;
  });
  
  teachersPaginationState.filteredData = filtered;
  teachersPaginationState.currentPage = 1;
  renderTeachersTableWithPagination();
}

/**
 * Open add teacher modal
 */
function openAddTeacherModal() {
  const email = prompt('Enter teacher email:');
  if (!email) return;
  
  const name = prompt('Enter teacher name:');
  if (!name) return;
  
  const role = prompt('Enter role (teacher/admin/principal):', 'teacher') || 'teacher';
  const classes = prompt('Enter classes (comma-separated):', '') || '';
  
  addTeacher({
    email,
    name,
    role,
    classAssigned: classes.split(',').map(c => c.trim()).filter(c => c)
  });
}

/**
 * Add new teacher
 */
async function addTeacher(teacherData) {
  try {
    const user = getCurrentUser();
    const supabase = getSupabase();
    
    if (!supabase || !user?.schoolId) {
      throw new Error('Supabase not initialized or user not found');
    }
    
    // Check if teacher already exists
    const { data: existing } = await supabase
      .from('teachers')
      .select('email')
      .eq('email', teacherData.email)
      .single();
    
    if (existing) {
      showToast('Teacher with this email already exists', 'error');
      return;
    }
    
    const { error } = await supabase
      .from('teachers')
      .insert({
        email: teacherData.email,
        school_id: user.schoolId,
        name: teacherData.name,
        role: teacherData.role || 'teacher',
        class_assigned: teacherData.classAssigned || [],
        phone: teacherData.phone || null,
        active: true
      });
    
    if (error) throw error;
    
    showToast('Teacher added successfully', 'success');
    await loadAllTeachersForManagement();
  } catch (error) {
    console.error('Add teacher error:', error);
    showToast('Error adding teacher: ' + error.message, 'error');
  }
}

/**
 * Open edit teacher modal
 */
async function openEditTeacherModal(email) {
  try {
    const supabase = getSupabase();
    const user = getCurrentUser();
    
    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email)
      .eq('school_id', user.schoolId)
      .single();
    
    if (error || !teacher) {
      showToast('Teacher not found', 'error');
      return;
    }
    
    const name = prompt('Enter teacher name:', teacher.name || '');
    if (!name) return;
    
    const newEmail = prompt('Enter teacher email:', teacher.email || '');
    if (!newEmail) return;
    
    const role = prompt('Enter role (teacher/admin/principal):', teacher.role || 'teacher') || 'teacher';
    const classes = prompt('Enter classes (comma-separated):', (teacher.class_assigned || []).join(', ')) || '';
    const classAssigned = classes ? classes.split(',').map(c => c.trim()).filter(c => c) : [];
    
    const phone = prompt('Enter phone (optional):', teacher.phone || '') || null;
    
    showLoading('Updating teacher...');
    
    const updateData = {
      name,
      role,
      phone,
      class_assigned: classAssigned,
      updated_at: new Date().toISOString()
    };
    
    // If email changed, need to handle it carefully (email is primary key)
    if (newEmail !== email) {
      // Check if new email already exists
      const { data: existing } = await supabase
        .from('teachers')
        .select('email')
        .eq('email', newEmail)
        .single();
      
      if (existing) {
        showToast('Email already exists. Please use a different email.', 'error');
        hideLoading();
        return;
      }
      
      // Delete old and insert new (since email is primary key)
      await supabase.from('teachers').delete().eq('email', email).eq('school_id', user.schoolId);
      await supabase.from('teachers').insert({
        email: newEmail,
        school_id: user.schoolId,
        name,
        role,
        phone,
        class_assigned: classAssigned,
        active: teacher.active
      });
    } else {
      await supabase
        .from('teachers')
        .update(updateData)
        .eq('email', email)
        .eq('school_id', user.schoolId);
    }
    
    showToast('Teacher updated successfully!', 'success');
    await loadAllTeachersForManagement();
  } catch (error) {
    console.error('Edit teacher error:', error);
    showToast('Error updating teacher: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Delete teacher
 */
async function deleteTeacher(email) {
  if (!confirm(`Are you sure you want to delete teacher ${email}?`)) {
    return;
  }
  
  try {
    const user = getCurrentUser();
    const supabase = getSupabase();
    
    if (!supabase || !user?.schoolId) {
      throw new Error('Supabase not initialized or user not found');
    }
    
    const { error } = await supabase
      .from('teachers')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('email', email)
      .eq('school_id', user.schoolId);
    
    if (error) throw error;
    
    showToast('Teacher deleted successfully', 'success');
    await loadAllTeachersForManagement();
  } catch (error) {
    console.error('Delete teacher error:', error);
    showToast('Error deleting teacher: ' + error.message, 'error');
  }
}

/**
 * Save system settings
 */
async function saveSystemSettings() {
  try {
    const settings = {
      checkInStart: document.getElementById('checkInStart')?.value || '07:00',
      checkInEnd: document.getElementById('checkInEnd')?.value || '10:30',
      checkOutStart: document.getElementById('checkOutStart')?.value || '12:30',
      checkOutEnd: document.getElementById('checkOutEnd')?.value || '15:30',
      lateThreshold: document.getElementById('lateThreshold')?.value || '09:15',
      editWindow: parseInt(document.getElementById('editWindow')?.value || '15')
    };
    
    // Store in localStorage for now (can be moved to database if needed)
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    
    showToast('Settings saved successfully', 'success');
  } catch (error) {
    console.error('Save settings error:', error);
    showToast('Error saving settings', 'error');
  }
}

/**
 * Load system settings
 */
async function loadSystemSettings() {
  try {
    // Load from localStorage (can be moved to database if needed)
    const settingsStr = localStorage.getItem('systemSettings');
    const settings = settingsStr ? JSON.parse(settingsStr) : {
      checkInStart: '07:00',
      checkInEnd: '10:30',
      checkOutStart: '12:30',
      checkOutEnd: '15:30',
      lateThreshold: '09:15',
      editWindow: 15
    };
    
    if (document.getElementById('checkInStart')) document.getElementById('checkInStart').value = settings.checkInStart || '07:00';
    if (document.getElementById('checkInEnd')) document.getElementById('checkInEnd').value = settings.checkInEnd || '10:30';
    if (document.getElementById('checkOutStart')) document.getElementById('checkOutStart').value = settings.checkOutStart || '12:30';
    if (document.getElementById('checkOutEnd')) document.getElementById('checkOutEnd').value = settings.checkOutEnd || '15:30';
    if (document.getElementById('lateThreshold')) document.getElementById('lateThreshold').value = settings.lateThreshold || '09:15';
    if (document.getElementById('editWindow')) document.getElementById('editWindow').value = settings.editWindow || 15;
  } catch (error) {
    console.error('Load settings error:', error);
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (getCurrentUser()?.role === 'admin') {
      loadAllStudentsForManagement();
      loadAllTeachersForManagement();
      loadSystemSettings();
    }
  });
} else {
  if (getCurrentUser()?.role === 'admin') {
    loadAllStudentsForManagement();
    loadAllTeachersForManagement();
    loadSystemSettings();
  }
}

