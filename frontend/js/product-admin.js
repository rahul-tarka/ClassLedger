/**
 * Product Admin Dashboard
 * Manages all schools, creates new schools, assigns school admins
 * 
 * IMPORTANT: Product Admin is COMPLETELY INDEPENDENT of schools
 * - Product Admin has NO school_id (not linked to any school)
 * - Product Admin can manage ALL schools (multi-tenant)
 * - Product Admin is for product owner only
 * - School Admin is school-specific and has school_id
 */

let currentUser = null;

// Pagination state for schools list
let schoolsPaginationState = {
  currentPage: 1,
  itemsPerPage: 5, // Default: 5 rows to minimize scrolling
  allData: []
};

// Pagination state for school details modal (admins, principals, teachers, students)
let schoolDetailsPaginationState = {
  admins: { currentPage: 1, itemsPerPage: 5, allData: [] },
  principals: { currentPage: 1, itemsPerPage: 5, allData: [] },
  teachers: { currentPage: 1, itemsPerPage: 5, allData: [] },
  students: { currentPage: 1, itemsPerPage: 5, allData: [] }
};

// Pagination state for school admin allowed emails
let schoolAdminAllowedEmailsPaginationState = {
  currentPage: 1,
  itemsPerPage: 5, // Default: 5 rows to minimize scrolling
  allData: []
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await initProductAdmin();
});

/**
 * Initialize product admin dashboard
 */
async function initProductAdmin() {
  try {
    // Check authentication
    const supabase = getSupabase();
    if (!supabase) {
      window.location.href = 'login.html';
      return;
    }
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      window.location.href = 'login.html';
      return;
    }
    
    // Check if user is product admin
    const { data: productAdmin, error: adminError } = await supabase
      .from('product_admins')
      .select('*')
      .eq('email', user.email)
      .eq('active', true)
      .single();
    
    if (adminError || !productAdmin) {
      // Not a product admin, redirect based on role
      const { data: teacher } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', user.email)
        .eq('active', true)
        .single();
      
      if (teacher) {
        redirectToDashboard(teacher.role);
      } else {
        window.location.href = 'login.html?error=unauthorized';
      }
      return;
    }
    
    currentUser = productAdmin;
    document.getElementById('userName').textContent = productAdmin.name || productAdmin.email;
    
    // Load dashboard data
    await loadDashboardData();
    
    // Load school admin allowed emails
    await loadSchoolAdminAllowedEmails();
    
    // Setup form handlers
    const form = document.getElementById('addSchoolForm');
    if (form) {
      form.addEventListener('submit', handleAddSchool);
    }
    
    const emailForm = document.getElementById('addSchoolAdminEmailForm');
    if (emailForm) {
      emailForm.addEventListener('submit', handleAddSchoolAdminEmail);
    }
  } catch (error) {
    console.error('Init product admin error:', error);
    showToast('Error loading dashboard', 'error');
  }
}

/**
 * Load dashboard statistics and schools
 */
async function loadDashboardData() {
  try {
    const supabase = getSupabase();
    
    // Load all schools (Product Admin can see ALL schools - no school_id filter)
    // Product Admin is independent of schools - can manage any school
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (schoolsError) throw schoolsError;
    
    // Load stats
    const activeSchools = schools.filter(s => s.active).length;
    
    // Load total users (teachers)
    const { data: teachers, error: teachersError } = await supabase
      .from('teachers')
      .select('email')
      .eq('active', true);
    
    const totalUsers = teachers?.length || 0;
    
    // Load total students
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('student_id')
      .eq('active', true);
    
    const totalStudents = students?.length || 0;
    
    // Update stats
    document.getElementById('totalSchools').textContent = schools.length;
    document.getElementById('activeSchools').textContent = activeSchools;
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalStudents').textContent = totalStudents;
    
    // Render schools list
    renderSchoolsList(schools);
  } catch (error) {
    console.error('Load dashboard data error:', error);
    showToast('Error loading data', 'error');
  }
}

/**
 * Render schools list with pagination
 */
function renderSchoolsList(schools) {
  const container = document.getElementById('schoolsList');
  if (!container) return;
  
  // Store all data for pagination
  schoolsPaginationState.allData = schools || [];
  
  if (schoolsPaginationState.allData.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No schools yet. Add your first school!</p>';
    // Clear pagination
    const paginationContainer = document.getElementById('schoolsPagination');
    const paginationInfo = document.getElementById('schoolsPaginationInfo');
    const itemsPerPageSelector = document.getElementById('schoolsItemsPerPage');
    if (paginationContainer) paginationContainer.innerHTML = '';
    if (paginationInfo) paginationInfo.innerHTML = '';
    if (itemsPerPageSelector) itemsPerPageSelector.innerHTML = '';
    return;
  }
  
  // Paginate data
  const paginationResult = paginateData(
    schoolsPaginationState.allData,
    schoolsPaginationState.currentPage,
    schoolsPaginationState.itemsPerPage
  );
  
  const html = `
    <table class="schools-table">
      <thead>
        <tr>
          <th>School Name</th>
          <th>School Admin</th>
          <th>Contact</th>
          <th>Status</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${paginationResult.data.map(school => {
          // Get school admin
          const adminEmail = school.product_admin_email || 'N/A';
          
          return `
            <tr>
              <td><strong>${school.school_name}</strong></td>
              <td>${adminEmail}</td>
              <td>
                ${school.phone ? `<div>📞 ${school.phone}</div>` : ''}
                ${school.email ? `<div>✉️ ${school.email}</div>` : ''}
              </td>
              <td>
                <span class="badge ${school.active ? 'badge-active' : 'badge-inactive'}">
                  ${school.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>${new Date(school.created_at).toLocaleDateString()}</td>
              <td>
                <button class="btn btn-secondary" onclick="viewSchool('${school.school_id}')">View</button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
  
  // Render pagination controls
  createPagination(
    paginationResult.currentPage,
    paginationResult.totalPages,
    (page) => {
      schoolsPaginationState.currentPage = page;
      renderSchoolsList(schoolsPaginationState.allData);
    },
    'schoolsPagination'
  );
  
  // Render pagination info
  createPaginationInfo(paginationResult, 'schoolsPaginationInfo');
  
  // Render items per page selector
  createItemsPerPageSelector(
    schoolsPaginationState.itemsPerPage,
    (itemsPerPage) => {
      schoolsPaginationState.itemsPerPage = itemsPerPage;
      schoolsPaginationState.currentPage = 1;
      renderSchoolsList(schoolsPaginationState.allData);
    },
    'schoolsItemsPerPage'
  );
}

/**
 * Handle add school form submission
 */
async function handleAddSchool(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const schoolData = {
    school_id: generateSchoolId(),
    school_name: formData.get('schoolName'),
    address: formData.get('schoolAddress') || null,
    phone: formData.get('schoolPhone') || null,
    email: formData.get('schoolEmail') || null,
    product_admin_email: currentUser.email,
    active: true
  };
  
  const adminData = {
    email: formData.get('adminEmail'),
    school_id: schoolData.school_id,
    name: formData.get('adminName'),
    role: 'admin',
    phone: formData.get('adminPhone') || null,
    class_assigned: [],
    active: true
  };
  
  try {
    showLoading('Creating school and admin...');
    
    const supabase = getSupabase();
    
    // Create school
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert(schoolData)
      .select()
      .single();
    
    if (schoolError) throw schoolError;
    
    // Create school admin
    const { data: admin, error: adminError } = await supabase
      .from('teachers')
      .insert(adminData)
      .select()
      .single();
    
    if (adminError) throw adminError;
    
    // Close modal
    closeAddSchoolModal();
    
    // Reload data
    await loadDashboardData();
    
    showToast('School and admin created successfully!', 'success');
  } catch (error) {
    console.error('Add school error:', error);
    showToast('Error creating school: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Open add school modal
 */
function openAddSchoolModal() {
  document.getElementById('addSchoolModal').style.display = 'flex';
  document.getElementById('addSchoolForm').reset();
}

/**
 * Close add school modal
 */
function closeAddSchoolModal() {
  document.getElementById('addSchoolModal').style.display = 'none';
}

/**
 * View school details with full management
 */
async function viewSchool(schoolId) {
  try {
    showLoading('Loading school details...');
    const supabase = getSupabase();
    if (!supabase) return;
    
    // Get school details
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('school_id', schoolId)
      .single();
    
    if (schoolError || !school) {
      showToast('School not found', 'error');
      return;
    }
    
    // Get all school admins (role = 'admin')
    const { data: admins } = await supabase
      .from('teachers')
      .select('*')
      .eq('school_id', schoolId)
      .eq('role', 'admin')
      .eq('active', true)
      .order('created_at', { ascending: false });
    
    // Get all principals
    const { data: principals } = await supabase
      .from('teachers')
      .select('*')
      .eq('school_id', schoolId)
      .eq('role', 'principal')
      .eq('active', true)
      .order('created_at', { ascending: false });
    
    // Get all teachers
    const { data: teachers } = await supabase
      .from('teachers')
      .select('*')
      .eq('school_id', schoolId)
      .eq('role', 'teacher')
      .eq('active', true)
      .order('name', { ascending: true });
    
    // Get all students
    const { data: students } = await supabase
      .from('students')
      .select('*')
      .eq('school_id', schoolId)
      .eq('active', true)
      .order('class', { ascending: true })
      .order('section', { ascending: true })
      .order('roll', { ascending: true });
    
    // Get school stats
    const { data: attendanceLogs } = await supabase
      .from('attendance_log')
      .select('log_id')
      .eq('school_id', schoolId)
      .gte('date', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
    
    // Create comprehensive modal
    const modal = document.createElement('div');
    modal.id = 'schoolDetailsModal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; overflow-y: auto;';
    modal.innerHTML = `
      <div class="card" style="max-width: 1200px; width: 100%; max-height: 90vh; overflow-y: auto; margin: auto; position: relative;">
        <button onclick="closeSchoolDetailsModal()" style="position: absolute; top: 1rem; right: 1rem; background: var(--danger-color); color: white; border: none; width: 2rem; height: 2rem; border-radius: 50%; cursor: pointer; font-size: 1.25rem; z-index: 10;">&times;</button>
        
        <div style="margin-bottom: 2rem;">
          <h2 style="margin-bottom: 0.5rem;">🏫 ${school.school_name || 'N/A'}</h2>
          <p style="color: var(--text-secondary);">School ID: ${school.school_id}</p>
        </div>
        
        <!-- Tabs -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 2rem; border-bottom: 2px solid var(--border-color);">
          <button class="tab-btn active" data-tab="overview" onclick="switchSchoolTab('overview')" style="padding: 0.75rem 1.5rem; background: none; border: none; border-bottom: 3px solid var(--primary-color); cursor: pointer; font-weight: 600; color: var(--primary-color);">📊 Overview</button>
          <button class="tab-btn" data-tab="admins" onclick="switchSchoolTab('admins')" style="padding: 0.75rem 1.5rem; background: none; border: none; cursor: pointer; color: var(--text-secondary);">👥 Admins</button>
          <button class="tab-btn" data-tab="principals" onclick="switchSchoolTab('principals')" style="padding: 0.75rem 1.5rem; background: none; border: none; cursor: pointer; color: var(--text-secondary);">🎓 Principals</button>
          <button class="tab-btn" data-tab="teachers" onclick="switchSchoolTab('teachers')" style="padding: 0.75rem 1.5rem; background: none; border: none; cursor: pointer; color: var(--text-secondary);">👨‍🏫 Teachers</button>
          <button class="tab-btn" data-tab="students" onclick="switchSchoolTab('students')" style="padding: 0.75rem 1.5rem; background: none; border: none; cursor: pointer; color: var(--text-secondary);">👦 Students</button>
        </div>
        
        <!-- Overview Tab -->
        <div id="tab-overview" class="school-tab-content">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div style="padding: 1.5rem; background: var(--bg-color); border-radius: 0.5rem; border-left: 4px solid var(--primary-color);">
              <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Total Admins</div>
              <div style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">${admins?.length || 0}</div>
            </div>
            <div style="padding: 1.5rem; background: var(--bg-color); border-radius: 0.5rem; border-left: 4px solid var(--secondary-color);">
              <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Total Principals</div>
              <div style="font-size: 2rem; font-weight: 700; color: var(--secondary-color);">${principals?.length || 0}</div>
            </div>
            <div style="padding: 1.5rem; background: var(--bg-color); border-radius: 0.5rem; border-left: 4px solid var(--success-color);">
              <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Total Teachers</div>
              <div style="font-size: 2rem; font-weight: 700; color: var(--success-color);">${teachers?.length || 0}</div>
            </div>
            <div style="padding: 1.5rem; background: var(--bg-color); border-radius: 0.5rem; border-left: 4px solid var(--warning-color);">
              <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Total Students</div>
              <div style="font-size: 2rem; font-weight: 700; color: var(--warning-color);">${students?.length || 0}</div>
            </div>
            <div style="padding: 1.5rem; background: var(--bg-color); border-radius: 0.5rem; border-left: 4px solid var(--primary-color);">
              <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Attendance Records (30 days)</div>
              <div style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">${attendanceLogs?.length || 0}</div>
            </div>
          </div>
          
          <div style="display: grid; gap: 1.5rem;">
            <div>
              <h3 style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.875rem; text-transform: uppercase;">School Information</h3>
              <div style="display: grid; gap: 0.75rem;">
                <p><strong>Name:</strong> ${school.school_name || 'N/A'}</p>
                <p><strong>ID:</strong> ${school.school_id}</p>
                <p><strong>Address:</strong> ${school.address || 'N/A'}</p>
                <p><strong>Phone:</strong> ${school.phone || 'N/A'}</p>
                <p><strong>Email:</strong> ${school.email || 'N/A'}</p>
                <p><strong>Status:</strong> <span class="badge ${school.active ? 'badge-success' : 'badge-danger'}">${school.active ? '✅ Active' : '❌ Inactive'}</span></p>
                <p><strong>Created:</strong> ${new Date(school.created_at).toLocaleDateString()}</p>
                <p><strong>Last Updated:</strong> ${new Date(school.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Admins Tab -->
        <div id="tab-admins" class="school-tab-content" style="display: none;">
          <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <h3>School Administrators (${admins?.length || 0})</h3>
            <button class="btn btn-primary" onclick="addSchoolAdmin('${schoolId}')" style="padding: 0.5rem 1rem; font-size: 0.875rem;">+ Add Admin</button>
          </div>
          ${admins && admins.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: var(--bg-color); border-bottom: 2px solid var(--border-color);">
                  <th style="padding: 0.75rem; text-align: left;">Name</th>
                  <th style="padding: 0.75rem; text-align: left;">Email</th>
                  <th style="padding: 0.75rem; text-align: left;">Phone</th>
                  <th style="padding: 0.75rem; text-align: left;">Created</th>
                  <th style="padding: 0.75rem; text-align: center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${admins.map(admin => `
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.75rem;">${admin.name}</td>
                    <td style="padding: 0.75rem;">${admin.email}</td>
                    <td style="padding: 0.75rem;">${admin.phone || 'N/A'}</td>
                    <td style="padding: 0.75rem;">${new Date(admin.created_at).toLocaleDateString()}</td>
                    <td style="padding: 0.75rem; text-align: center;">
                      <button class="btn btn-secondary" onclick="editSchoolAdmin('${admin.email}', '${schoolId}')" style="padding: 0.25rem 0.75rem; font-size: 0.875rem; margin-right: 0.5rem;">Edit</button>
                      <button class="btn btn-danger" onclick="deleteSchoolAdmin('${admin.email}', '${schoolId}')" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;">Delete</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No administrators found.</p>'}
        </div>
        
        <!-- Principals Tab -->
        <div id="tab-principals" class="school-tab-content" style="display: none;">
          <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <h3>Principals (${principals?.length || 0})</h3>
            <button class="btn btn-primary" onclick="addPrincipal('${schoolId}')" style="padding: 0.5rem 1rem; font-size: 0.875rem;">+ Add Principal</button>
          </div>
          ${principals && principals.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: var(--bg-color); border-bottom: 2px solid var(--border-color);">
                  <th style="padding: 0.75rem; text-align: left;">Name</th>
                  <th style="padding: 0.75rem; text-align: left;">Email</th>
                  <th style="padding: 0.75rem; text-align: left;">Phone</th>
                  <th style="padding: 0.75rem; text-align: left;">Created</th>
                  <th style="padding: 0.75rem; text-align: center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${principals.map(principal => `
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.75rem;">${principal.name}</td>
                    <td style="padding: 0.75rem;">${principal.email}</td>
                    <td style="padding: 0.75rem;">${principal.phone || 'N/A'}</td>
                    <td style="padding: 0.75rem;">${new Date(principal.created_at).toLocaleDateString()}</td>
                    <td style="padding: 0.75rem; text-align: center;">
                      <button class="btn btn-secondary" onclick="editPrincipal('${principal.email}', '${schoolId}')" style="padding: 0.25rem 0.75rem; font-size: 0.875rem; margin-right: 0.5rem;">Edit</button>
                      <button class="btn btn-danger" onclick="deletePrincipal('${principal.email}', '${schoolId}')" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;">Delete</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No principals found.</p>'}
        </div>
        
        <!-- Teachers Tab -->
        <div id="tab-teachers" class="school-tab-content" style="display: none;">
          <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <h3>Teachers (${teachers?.length || 0})</h3>
            <button class="btn btn-primary" onclick="addTeacher('${schoolId}')" style="padding: 0.5rem 1rem; font-size: 0.875rem;">+ Add Teacher</button>
          </div>
          ${teachers && teachers.length > 0 ? `
            <div style="max-height: 400px; overflow-y: auto;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead style="position: sticky; top: 0; background: var(--bg-color);">
                  <tr style="border-bottom: 2px solid var(--border-color);">
                    <th style="padding: 0.75rem; text-align: left;">Name</th>
                    <th style="padding: 0.75rem; text-align: left;">Email</th>
                    <th style="padding: 0.75rem; text-align: left;">Classes</th>
                    <th style="padding: 0.75rem; text-align: left;">Phone</th>
                    <th style="padding: 0.75rem; text-align: center;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${teachers.map(teacher => `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                      <td style="padding: 0.75rem;">${teacher.name}</td>
                      <td style="padding: 0.75rem;">${teacher.email}</td>
                      <td style="padding: 0.75rem;">${teacher.class_assigned && teacher.class_assigned.length > 0 ? teacher.class_assigned.join(', ') : 'None'}</td>
                      <td style="padding: 0.75rem;">${teacher.phone || 'N/A'}</td>
                      <td style="padding: 0.75rem; text-align: center;">
                        <button class="btn btn-secondary" onclick="editTeacher('${teacher.email}', '${schoolId}')" style="padding: 0.25rem 0.75rem; font-size: 0.875rem; margin-right: 0.5rem;">Edit</button>
                        <button class="btn btn-danger" onclick="deleteTeacher('${teacher.email}', '${schoolId}')" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;">Delete</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No teachers found.</p>'}
        </div>
        
        <!-- Students Tab -->
        <div id="tab-students" class="school-tab-content" style="display: none;">
          <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <h3>Students (${students?.length || 0})</h3>
            <button class="btn btn-primary" onclick="addStudent('${schoolId}')" style="padding: 0.5rem 1rem; font-size: 0.875rem;">+ Add Student</button>
          </div>
          ${students && students.length > 0 ? `
            <div style="max-height: 400px; overflow-y: auto;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead style="position: sticky; top: 0; background: var(--bg-color);">
                  <tr style="border-bottom: 2px solid var(--border-color);">
                    <th style="padding: 0.75rem; text-align: left;">Name</th>
                    <th style="padding: 0.75rem; text-align: left;">Class</th>
                    <th style="padding: 0.75rem; text-align: left;">Section</th>
                    <th style="padding: 0.75rem; text-align: left;">Roll</th>
                    <th style="padding: 0.75rem; text-align: left;">Parent</th>
                    <th style="padding: 0.75rem; text-align: center;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${students.map(student => `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                      <td style="padding: 0.75rem;">${student.name}</td>
                      <td style="padding: 0.75rem;">${student.class}</td>
                      <td style="padding: 0.75rem;">${student.section}</td>
                      <td style="padding: 0.75rem;">${student.roll}</td>
                      <td style="padding: 0.75rem;">${student.parent_name || 'N/A'}</td>
                      <td style="padding: 0.75rem; text-align: center;">
                        <button class="btn btn-secondary" onclick="editStudent('${student.student_id}', '${schoolId}')" style="padding: 0.25rem 0.75rem; font-size: 0.875rem; margin-right: 0.5rem;">Edit</button>
                        <button class="btn btn-danger" onclick="deleteStudent('${student.student_id}', '${schoolId}')" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;">Delete</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No students found.</p>'}
        </div>
        
        <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
          <button class="btn btn-primary" onclick="closeSchoolDetailsModal()">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Store school data for management functions
    window.currentSchoolData = { school, admins, principals, teachers, students, schoolId };
    
  } catch (error) {
    console.error('View school error:', error);
    showToast('Error loading school details', 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Switch school details tab
 */
function switchSchoolTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.school-tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  
  // Remove active class from all buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.borderBottom = 'none';
    btn.style.color = 'var(--text-secondary)';
  });
  
  // Show selected tab
  const tabContent = document.getElementById(`tab-${tabName}`);
  if (tabContent) {
    tabContent.style.display = 'block';
  }
  
  // Activate button
  const btn = document.querySelector(`[data-tab="${tabName}"]`);
  if (btn) {
    btn.classList.add('active');
    btn.style.borderBottom = '3px solid var(--primary-color)';
    btn.style.color = 'var(--primary-color)';
  }
}

/**
 * Close school details modal
 */
function closeSchoolDetailsModal() {
  const modal = document.getElementById('schoolDetailsModal');
  if (modal) modal.remove();
  window.currentSchoolData = null;
}

/**
 * Add School Admin
 */
async function addSchoolAdmin(schoolId) {
  const name = prompt('Enter admin name:');
  if (!name) return;
  
  const email = prompt('Enter admin email:');
  if (!email) return;
  
  const phone = prompt('Enter admin phone (optional):') || null;
  
  try {
    showLoading('Adding school admin...');
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('teachers')
      .insert({
        email,
        school_id: schoolId,
        name,
        role: 'admin',
        phone,
        class_assigned: [],
        active: true
      });
    
    if (error) throw error;
    
    showToast('School admin added successfully!', 'success');
    closeSchoolDetailsModal();
    await viewSchool(schoolId);
  } catch (error) {
    console.error('Add admin error:', error);
    showToast('Error adding admin: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Add Principal
 */
async function addPrincipal(schoolId) {
  const name = prompt('Enter principal name:');
  if (!name) return;
  
  const email = prompt('Enter principal email:');
  if (!email) return;
  
  const phone = prompt('Enter principal phone (optional):') || null;
  
  try {
    showLoading('Adding principal...');
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('teachers')
      .insert({
        email,
        school_id: schoolId,
        name,
        role: 'principal',
        phone,
        class_assigned: [],
        active: true
      });
    
    if (error) throw error;
    
    showToast('Principal added successfully!', 'success');
    closeSchoolDetailsModal();
    await viewSchool(schoolId);
  } catch (error) {
    console.error('Add principal error:', error);
    showToast('Error adding principal: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Add Teacher
 */
async function addTeacher(schoolId) {
  const name = prompt('Enter teacher name:');
  if (!name) return;
  
  const email = prompt('Enter teacher email:');
  if (!email) return;
  
  const classes = prompt('Enter assigned classes (comma-separated, optional):') || '';
  const classAssigned = classes ? classes.split(',').map(c => c.trim()).filter(c => c) : [];
  
  const phone = prompt('Enter teacher phone (optional):') || null;
  
  try {
    showLoading('Adding teacher...');
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('teachers')
      .insert({
        email,
        school_id: schoolId,
        name,
        role: 'teacher',
        phone,
        class_assigned: classAssigned,
        active: true
      });
    
    if (error) throw error;
    
    showToast('Teacher added successfully!', 'success');
    closeSchoolDetailsModal();
    await viewSchool(schoolId);
  } catch (error) {
    console.error('Add teacher error:', error);
    showToast('Error adding teacher: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Add Student
 */
async function addStudent(schoolId) {
  const name = prompt('Enter student name:');
  if (!name) return;
  
  const className = prompt('Enter class:');
  if (!className) return;
  
  const section = prompt('Enter section:');
  if (!section) return;
  
  const roll = parseInt(prompt('Enter roll number:'));
  if (!roll) return;
  
  const parentName = prompt('Enter parent name (optional):') || null;
  const parentMobile = prompt('Enter parent mobile (optional):') || null;
  
  try {
    showLoading('Adding student...');
    const supabase = getSupabase();
    
    const studentId = 'STU' + Date.now().toString().slice(-10);
    
    const { error } = await supabase
      .from('students')
      .insert({
        student_id: studentId,
        school_id: schoolId,
        name,
        class: className,
        section,
        roll,
        parent_name: parentName,
        parent_mobile: parentMobile,
        active: true,
        whatsapp_alert_enabled: false
      });
    
    if (error) throw error;
    
    showToast('Student added successfully!', 'success');
    closeSchoolDetailsModal();
    await viewSchool(schoolId);
  } catch (error) {
    console.error('Add student error:', error);
    showToast('Error adding student: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Edit School Admin
 */
async function editSchoolAdmin(email, schoolId) {
  try {
    const supabase = getSupabase();
    const { data: admin, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email)
      .eq('school_id', schoolId)
      .single();
    
    if (error || !admin) {
      showToast('Admin not found', 'error');
      return;
    }
    
    const name = prompt('Enter admin name:', admin.name || '');
    if (!name) return;
    
    const newEmail = prompt('Enter admin email:', admin.email || '');
    if (!newEmail) return;
    
    const phone = prompt('Enter admin phone (optional):', admin.phone || '') || null;
    
    showLoading('Updating admin...');
    
    const updateData = {
      name,
      phone,
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
      await supabase.from('teachers').delete().eq('email', email).eq('school_id', schoolId);
      await supabase.from('teachers').insert({
        email: newEmail,
        school_id: schoolId,
        name,
        role: 'admin',
        phone,
        class_assigned: admin.class_assigned || [],
        active: admin.active
      });
    } else {
      await supabase
        .from('teachers')
        .update(updateData)
        .eq('email', email)
        .eq('school_id', schoolId);
    }
    
    showToast('Admin updated successfully!', 'success');
    closeSchoolDetailsModal();
    await viewSchool(schoolId);
  } catch (error) {
    console.error('Edit admin error:', error);
    showToast('Error updating admin: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

async function deleteSchoolAdmin(email, schoolId) {
  if (!confirm(`Are you sure you want to delete admin ${email}?`)) return;
  
  try {
    showLoading('Deleting admin...');
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('teachers')
      .update({ active: false })
      .eq('email', email)
      .eq('school_id', schoolId);
    
    if (error) throw error;
    
    showToast('Admin deleted successfully!', 'success');
    closeSchoolDetailsModal();
    await viewSchool(schoolId);
  } catch (error) {
    console.error('Delete admin error:', error);
    showToast('Error deleting admin: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Edit Principal
 */
async function editPrincipal(email, schoolId) {
  try {
    const supabase = getSupabase();
    const { data: principal, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email)
      .eq('school_id', schoolId)
      .single();
    
    if (error || !principal) {
      showToast('Principal not found', 'error');
      return;
    }
    
    const name = prompt('Enter principal name:', principal.name || '');
    if (!name) return;
    
    const newEmail = prompt('Enter principal email:', principal.email || '');
    if (!newEmail) return;
    
    const phone = prompt('Enter principal phone (optional):', principal.phone || '') || null;
    
    showLoading('Updating principal...');
    
    const updateData = {
      name,
      phone,
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
      await supabase.from('teachers').delete().eq('email', email).eq('school_id', schoolId);
      await supabase.from('teachers').insert({
        email: newEmail,
        school_id: schoolId,
        name,
        role: 'principal',
        phone,
        class_assigned: principal.class_assigned || [],
        active: principal.active
      });
    } else {
      await supabase
        .from('teachers')
        .update(updateData)
        .eq('email', email)
        .eq('school_id', schoolId);
    }
    
    showToast('Principal updated successfully!', 'success');
    closeSchoolDetailsModal();
    await viewSchool(schoolId);
  } catch (error) {
    console.error('Edit principal error:', error);
    showToast('Error updating principal: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

async function deletePrincipal(email, schoolId) {
  if (!confirm(`Are you sure you want to delete principal ${email}?`)) return;
  
  try {
    showLoading('Deleting principal...');
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('teachers')
      .update({ active: false })
      .eq('email', email)
      .eq('school_id', schoolId);
    
    if (error) throw error;
    
    showToast('Principal deleted successfully!', 'success');
    closeSchoolDetailsModal();
    await viewSchool(schoolId);
  } catch (error) {
    console.error('Delete principal error:', error);
    showToast('Error deleting principal: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Edit Teacher
 */
async function editTeacher(email, schoolId) {
  try {
    const supabase = getSupabase();
    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email)
      .eq('school_id', schoolId)
      .single();
    
    if (error || !teacher) {
      showToast('Teacher not found', 'error');
      return;
    }
    
    const name = prompt('Enter teacher name:', teacher.name || '');
    if (!name) return;
    
    const newEmail = prompt('Enter teacher email:', teacher.email || '');
    if (!newEmail) return;
    
    const classes = prompt('Enter assigned classes (comma-separated):', (teacher.class_assigned || []).join(', ')) || '';
    const classAssigned = classes ? classes.split(',').map(c => c.trim()).filter(c => c) : [];
    
    const phone = prompt('Enter teacher phone (optional):', teacher.phone || '') || null;
    
    showLoading('Updating teacher...');
    
    const updateData = {
      name,
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
      await supabase.from('teachers').delete().eq('email', email).eq('school_id', schoolId);
      await supabase.from('teachers').insert({
        email: newEmail,
        school_id: schoolId,
        name,
        role: 'teacher',
        phone,
        class_assigned: classAssigned,
        active: teacher.active
      });
    } else {
      await supabase
        .from('teachers')
        .update(updateData)
        .eq('email', email)
        .eq('school_id', schoolId);
    }
    
    showToast('Teacher updated successfully!', 'success');
    closeSchoolDetailsModal();
    await viewSchool(schoolId);
  } catch (error) {
    console.error('Edit teacher error:', error);
    showToast('Error updating teacher: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

async function deleteTeacher(email, schoolId) {
  if (!confirm(`Are you sure you want to delete teacher ${email}?`)) return;
  
  try {
    showLoading('Deleting teacher...');
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('teachers')
      .update({ active: false })
      .eq('email', email)
      .eq('school_id', schoolId);
    
    if (error) throw error;
    
    showToast('Teacher deleted successfully!', 'success');
    closeSchoolDetailsModal();
    await viewSchool(schoolId);
  } catch (error) {
    console.error('Delete teacher error:', error);
    showToast('Error deleting teacher: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Edit Student
 */
async function editStudent(studentId, schoolId) {
  try {
    const supabase = getSupabase();
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', studentId)
      .eq('school_id', schoolId)
      .single();
    
    if (error || !student) {
      showToast('Student not found', 'error');
      return;
    }
    
    const name = prompt('Enter student name:', student.name || '');
    if (!name) return;
    
    const className = prompt('Enter class:', student.class || '');
    if (!className) return;
    
    const section = prompt('Enter section:', student.section || '');
    if (!section) return;
    
    const roll = parseInt(prompt('Enter roll number:', student.roll || ''));
    if (!roll) return;
    
    const parentName = prompt('Enter parent name (optional):', student.parent_name || '') || null;
    const parentMobile = prompt('Enter parent mobile (optional):', student.parent_mobile || '') || null;
    
    showLoading('Updating student...');
    
    const { error: updateError } = await supabase
      .from('students')
      .update({
        name,
        class: className,
        section,
        roll,
        parent_name: parentName,
        parent_mobile: parentMobile,
        updated_at: new Date().toISOString()
      })
      .eq('student_id', studentId)
      .eq('school_id', schoolId);
    
    if (updateError) throw updateError;
    
    showToast('Student updated successfully!', 'success');
    closeSchoolDetailsModal();
    await viewSchool(schoolId);
  } catch (error) {
    console.error('Edit student error:', error);
    showToast('Error updating student: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

async function deleteStudent(studentId, schoolId) {
  if (!confirm(`Are you sure you want to delete this student?`)) return;
  
  try {
    showLoading('Deleting student...');
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('students')
      .update({ active: false })
      .eq('student_id', studentId)
      .eq('school_id', schoolId);
    
    if (error) throw error;
    
    showToast('Student deleted successfully!', 'success');
    closeSchoolDetailsModal();
    await viewSchool(schoolId);
  } catch (error) {
    console.error('Delete student error:', error);
    showToast('Error deleting student: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Logout
 */
async function logout() {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
  sessionStorage.clear();
  window.location.href = 'login.html';
}

/**
 * Load allowed emails for school admins
 * Product Admin can see all school admin emails across all schools
 */
async function loadSchoolAdminAllowedEmails() {
  try {
    const supabase = getSupabase();
    if (!supabase) return;
    
    // Get all school admins (role = 'admin') from all schools
    const { data: schoolAdmins, error } = await supabase
      .from('teachers')
      .select('email, name, school_id, active, created_at, schools(school_name)')
      .eq('role', 'admin')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform to allowed emails format
    const allowedEmails = (schoolAdmins || []).map(admin => ({
      id: admin.email, // Use email as ID for display
      email_pattern: admin.email,
      type: 'email',
      active: admin.active,
      school_id: admin.school_id,
      school_name: admin.schools?.school_name || 'N/A',
      name: admin.name,
      created_at: admin.created_at
    }));
    
    renderSchoolAdminAllowedEmails(allowedEmails);
  } catch (error) {
    console.error('Load school admin allowed emails error:', error);
    showToast('Error loading school admin emails', 'error');
  }
}

/**
 * Render school admin allowed emails list with pagination
 */
function renderSchoolAdminAllowedEmails(emails) {
  const container = document.getElementById('schoolAdminAllowedEmailsList');
  if (!container) return;
  
  // Store all data for pagination
  schoolAdminAllowedEmailsPaginationState.allData = emails || [];
  
  if (schoolAdminAllowedEmailsPaginationState.allData.length === 0) {
    container.innerHTML = `
      <div class="card" style="background: #fff3cd; padding: 1.5rem; text-align: center;">
        <p style="color: #856404; margin: 0;">
          <strong>No school admins found.</strong><br>
          School admins are created when you add a new school.
        </p>
      </div>
    `;
    // Clear pagination
    const paginationContainer = document.getElementById('schoolAdminAllowedEmailsPagination');
    const paginationInfo = document.getElementById('schoolAdminAllowedEmailsPaginationInfo');
    const itemsPerPageSelector = document.getElementById('schoolAdminAllowedEmailsItemsPerPage');
    if (paginationContainer) paginationContainer.innerHTML = '';
    if (paginationInfo) paginationInfo.innerHTML = '';
    if (itemsPerPageSelector) itemsPerPageSelector.innerHTML = '';
    return;
  }
  
  // Paginate data
  const paginationResult = paginateData(
    schoolAdminAllowedEmailsPaginationState.allData,
    schoolAdminAllowedEmailsPaginationState.currentPage,
    schoolAdminAllowedEmailsPaginationState.itemsPerPage
  );
  
  const html = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #ddd;">Name</th>
          <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #ddd;">Email</th>
          <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #ddd;">School</th>
          <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #ddd;">Status</th>
          <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #ddd;">Created</th>
        </tr>
      </thead>
      <tbody>
        ${paginationResult.data.map(email => `
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 1rem;">${email.name || 'N/A'}</td>
            <td style="padding: 1rem; font-family: monospace;">${email.email_pattern}</td>
            <td style="padding: 1rem;">${email.school_name}</td>
            <td style="padding: 1rem;">
              <span style="padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem;
                           background: ${email.active ? '#4CAF50' : '#f44336'}; 
                           color: white;">
                ${email.active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td style="padding: 1rem;">${new Date(email.created_at).toLocaleDateString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
  
  // Render pagination controls
  createPagination(
    paginationResult.currentPage,
    paginationResult.totalPages,
    (page) => {
      schoolAdminAllowedEmailsPaginationState.currentPage = page;
      renderSchoolAdminAllowedEmails(schoolAdminAllowedEmailsPaginationState.allData);
    },
    'schoolAdminAllowedEmailsPagination'
  );
  
  // Render pagination info
  createPaginationInfo(paginationResult, 'schoolAdminAllowedEmailsPaginationInfo');
  
  // Render items per page selector
  createItemsPerPageSelector(
    schoolAdminAllowedEmailsPaginationState.itemsPerPage,
    (itemsPerPage) => {
      schoolAdminAllowedEmailsPaginationState.itemsPerPage = itemsPerPage;
      schoolAdminAllowedEmailsPaginationState.currentPage = 1;
      renderSchoolAdminAllowedEmails(schoolAdminAllowedEmailsPaginationState.allData);
    },
    'schoolAdminAllowedEmailsItemsPerPage'
  );
}

/**
 * Handle add school admin email form submission
 * Note: School admins are created when adding a school, not separately
 */
async function handleAddSchoolAdminEmail(e) {
  if (e && e.preventDefault) e.preventDefault();
  
  showToast('School admins are created when you add a new school. Use "Add School" button to create a new school admin.', 'info');
  
  // Reset form
  const form = document.getElementById('addSchoolAdminEmailForm');
  if (form) form.reset();
}

/**
 * Generate school ID
 */
function generateSchoolId() {
  return 'SCH' + Date.now().toString().slice(-6);
}

/**
 * Redirect to dashboard based on role
 */
function redirectToDashboard(role) {
  switch (role) {
    case 'teacher':
      window.location.href = 'teacher-dashboard.html';
      break;
    case 'admin':
      window.location.href = 'admin-dashboard.html';
      break;
    case 'principal':
      window.location.href = 'principal-dashboard.html';
      break;
    default:
      window.location.href = 'login.html';
  }
}

/**
 * Show loading
 */
function showLoading(message) {
  const loader = document.createElement('div');
  loader.id = 'loader';
  loader.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;';
  loader.innerHTML = `<div style="background: white; padding: 2rem; border-radius: 8px;">${message || 'Loading...'}</div>`;
  document.body.appendChild(loader);
}

/**
 * Hide loading
 */
function hideLoading() {
  const loader = document.getElementById('loader');
  if (loader) loader.remove();
}

/**
 * Show toast
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.style.cssText = `position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem; background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'}; color: white; border-radius: 4px; z-index: 10000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

