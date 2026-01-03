/**
 * Product Admin Dashboard
 * Manages all schools, creates new schools, assigns school admins
 */

let currentUser = null;

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
    
    // Setup form handler
    const form = document.getElementById('addSchoolForm');
    if (form) {
      form.addEventListener('submit', handleAddSchool);
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
    
    // Load all schools
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
 * Render schools list
 */
function renderSchoolsList(schools) {
  const container = document.getElementById('schoolsList');
  if (!container) return;
  
  if (schools.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No schools yet. Add your first school!</p>';
    return;
  }
  
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
        ${schools.map(school => {
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
 * View school details
 */
async function viewSchool(schoolId) {
  try {
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
    
    // Get school admin
    const { data: admin } = await supabase
      .from('teachers')
      .select('*')
      .eq('school_id', schoolId)
      .eq('role', 'admin')
      .eq('active', true)
      .single();
    
    // Get school stats
    const { data: teachers } = await supabase
      .from('teachers')
      .select('email')
      .eq('school_id', schoolId)
      .eq('active', true);
    
    const { data: students } = await supabase
      .from('students')
      .select('student_id')
      .eq('school_id', schoolId)
      .eq('active', true);
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'schoolDetailsModal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;';
    modal.innerHTML = `
      <div class="card" style="max-width: 700px; max-height: 90vh; overflow-y: auto; margin: 2rem; position: relative;">
        <button onclick="closeSchoolDetailsModal()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-secondary);">&times;</button>
        <h2 style="margin-bottom: 1.5rem;">School Details</h2>
        <div style="display: grid; gap: 1.5rem;">
          <div>
            <h3 style="margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.875rem; text-transform: uppercase;">School Information</h3>
            <p><strong>Name:</strong> ${school.school_name || 'N/A'}</p>
            <p><strong>ID:</strong> ${school.school_id}</p>
            <p><strong>Address:</strong> ${school.address || 'N/A'}</p>
            <p><strong>Phone:</strong> ${school.phone || 'N/A'}</p>
            <p><strong>Email:</strong> ${school.email || 'N/A'}</p>
            <p><strong>Status:</strong> <span class="badge ${school.active ? 'badge-success' : 'badge-danger'}">${school.active ? 'Active' : 'Inactive'}</span></p>
            <p><strong>Created:</strong> ${new Date(school.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 style="margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.875rem; text-transform: uppercase;">School Admin</h3>
            <p><strong>Name:</strong> ${admin?.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${admin?.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${admin?.phone || 'N/A'}</p>
          </div>
          <div>
            <h3 style="margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.875rem; text-transform: uppercase;">Statistics</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
              <div style="padding: 1rem; background: var(--bg-color); border-radius: 0.5rem;">
                <div style="font-size: 0.875rem; color: var(--text-secondary);">Teachers</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">${teachers?.length || 0}</div>
              </div>
              <div style="padding: 1rem; background: var(--bg-color); border-radius: 0.5rem;">
                <div style="font-size: 0.875rem; color: var(--text-secondary);">Students</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">${students?.length || 0}</div>
              </div>
            </div>
          </div>
        </div>
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
          <button class="btn btn-primary" onclick="closeSchoolDetailsModal()">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  } catch (error) {
    console.error('View school error:', error);
    showToast('Error loading school details', 'error');
  }
}

/**
 * Close school details modal
 */
function closeSchoolDetailsModal() {
  const modal = document.getElementById('schoolDetailsModal');
  if (modal) modal.remove();
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

