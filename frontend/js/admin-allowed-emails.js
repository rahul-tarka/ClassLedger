/**
 * Admin - Manage Allowed Emails
 * School admin can define which emails/domains can login
 */

let currentUser = null;
let currentSchoolId = null;

// Pagination state
let allowedEmailsPaginationState = {
  currentPage: 1,
  itemsPerPage: 5, // Default: 5 rows to minimize scrolling
  allData: []
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await initAllowedEmails();
});

/**
 * Initialize
 */
async function initAllowedEmails() {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      window.location.href = 'login.html';
      return;
    }
    
    currentUser = user;
    currentSchoolId = user.schoolId;
    
    // Load allowed emails
    await loadAllowedEmails();
    
    // Setup form handler
    const form = document.getElementById('addEmailForm');
    if (form) {
      form.addEventListener('submit', handleAddEmail);
    }
  } catch (error) {
    console.error('Init allowed emails error:', error);
    showToast('Error loading page', 'error');
  }
}

/**
 * Load allowed emails
 */
async function loadAllowedEmails() {
  try {
    const supabase = getSupabase();
    if (!supabase) return;
    
    const { data: allowedEmails, error } = await supabase
      .from('school_allowed_emails')
      .select('*')
      .eq('school_id', currentSchoolId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    renderAllowedEmails(allowedEmails || []);
  } catch (error) {
    console.error('Load allowed emails error:', error);
    showToast('Error loading allowed emails', 'error');
  }
}

/**
 * Render allowed emails list with pagination
 */
function renderAllowedEmails(emails) {
  const container = document.getElementById('allowedEmailsList');
  if (!container) return;
  
  // Store all data for pagination
  allowedEmailsPaginationState.allData = emails || [];
  
  if (allowedEmailsPaginationState.allData.length === 0) {
    container.innerHTML = `
      <div class="card" style="background: #fff3cd; padding: 1.5rem; text-align: center;">
        <p style="color: #856404; margin: 0;">
          <strong>No allowed emails defined.</strong><br>
          Add email addresses or domains to allow teachers and principals to login.
        </p>
      </div>
    `;
    // Clear pagination
    const paginationContainer = document.getElementById('allowedEmailsPagination');
    const paginationInfo = document.getElementById('allowedEmailsPaginationInfo');
    const itemsPerPageSelector = document.getElementById('allowedEmailsItemsPerPage');
    if (paginationContainer) paginationContainer.innerHTML = '';
    if (paginationInfo) paginationInfo.innerHTML = '';
    if (itemsPerPageSelector) itemsPerPageSelector.innerHTML = '';
    return;
  }
  
  // Paginate data
  const paginationResult = paginateData(
    allowedEmailsPaginationState.allData,
    allowedEmailsPaginationState.currentPage,
    allowedEmailsPaginationState.itemsPerPage
  );
  
  const html = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #ddd;">Type</th>
          <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #ddd;">Email/Domain</th>
          <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #ddd;">Status</th>
          <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #ddd;">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${paginationResult.data.map(email => `
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 1rem;">
              <span style="padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem; 
                           background: ${email.type === 'email' ? '#e3f2fd' : '#f3e5f5'}; 
                           color: ${email.type === 'email' ? '#1976d2' : '#7b1fa2'};">
                ${email.type === 'email' ? 'Email' : 'Domain'}
              </span>
            </td>
            <td style="padding: 1rem; font-family: monospace;">${email.email_pattern}</td>
            <td style="padding: 1rem;">
              <span style="padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem;
                           background: ${email.active ? '#4CAF50' : '#f44336'}; 
                           color: white;">
                ${email.active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td style="padding: 1rem;">
              <button class="btn btn-secondary" onclick="toggleEmailStatus(${email.id}, ${!email.active})">
                ${email.active ? 'Deactivate' : 'Activate'}
              </button>
              <button class="btn btn-danger" onclick="deleteEmail(${email.id})" style="margin-left: 0.5rem;">
                Delete
              </button>
            </td>
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
      allowedEmailsPaginationState.currentPage = page;
      renderAllowedEmails(allowedEmailsPaginationState.allData);
    },
    'allowedEmailsPagination'
  );
  
  // Render pagination info
  createPaginationInfo(paginationResult, 'allowedEmailsPaginationInfo');
  
  // Render items per page selector
  createItemsPerPageSelector(
    allowedEmailsPaginationState.itemsPerPage,
    (itemsPerPage) => {
      allowedEmailsPaginationState.itemsPerPage = itemsPerPage;
      allowedEmailsPaginationState.currentPage = 1;
      renderAllowedEmails(allowedEmailsPaginationState.allData);
    },
    'allowedEmailsItemsPerPage'
  );
}

/**
 * Handle add email form submission
 */
async function handleAddEmail(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const emailPattern = formData.get('emailPattern').trim();
  const type = formData.get('emailType');
  
  // Validate
  if (type === 'domain' && !emailPattern.startsWith('@')) {
    showToast('Domain must start with @ (e.g., @school.com)', 'error');
    return;
  }
  
  if (type === 'email' && !emailPattern.includes('@')) {
    showToast('Please enter a valid email address', 'error');
    return;
  }
  
  try {
    showLoading('Adding to allowed list...');
    
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('school_allowed_emails')
      .insert({
        school_id: currentSchoolId,
        email_pattern: emailPattern,
        type: type,
        active: true,
        created_by: currentUser.email
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Reload list
    await loadAllowedEmails();
    
    // Reset form
    e.target.reset();
    
    showToast('Email/domain added successfully!', 'success');
  } catch (error) {
    console.error('Add email error:', error);
    if (error.code === '23505') { // Unique constraint violation
      showToast('This email/domain is already in the list', 'error');
    } else {
      showToast('Error adding email: ' + error.message, 'error');
    }
  } finally {
    hideLoading();
  }
}

/**
 * Toggle email status
 */
async function toggleEmailStatus(id, newStatus) {
  try {
    showLoading('Updating status...');
    
    const supabase = getSupabase();
    const { error } = await supabase
      .from('school_allowed_emails')
      .update({ active: newStatus })
      .eq('id', id);
    
    if (error) throw error;
    
    await loadAllowedEmails();
    showToast('Status updated successfully!', 'success');
  } catch (error) {
    console.error('Toggle status error:', error);
    showToast('Error updating status', 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Delete email
 */
async function deleteEmail(id) {
  if (!confirm('Are you sure you want to remove this email/domain from the allowed list?')) {
    return;
  }
  
  try {
    showLoading('Deleting...');
    
    const supabase = getSupabase();
    const { error } = await supabase
      .from('school_allowed_emails')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    await loadAllowedEmails();
    showToast('Deleted successfully!', 'success');
  } catch (error) {
    console.error('Delete email error:', error);
    showToast('Error deleting email', 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Get current user
 */
function getCurrentUser() {
  const userStr = sessionStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
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

