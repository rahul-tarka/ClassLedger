/**
 * ClassLedger by Tarka - Authentication Module
 * Handles Google OAuth and user validation
 */

// API Configuration
// TODO: Replace with your Apps Script Web App URL after deployment
const API_URL = 'YOUR_WEB_APP_URL';

/**
 * Initialize Google Sign-In
 */
function initGoogleSignIn() {
  // Google OAuth is handled via Apps Script's built-in authentication
  // When user accesses the app, they'll be prompted to sign in
  checkAuth();
}

/**
 * Check if user is authenticated and authorized
 */
async function checkAuth() {
  try {
    const response = await fetch(`${API_URL}?action=auth`);
    const data = await response.json();
    
    if (data.success && data.user) {
      // User is authorized
      const user = data.user;
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('authenticated', 'true');
      
      // Redirect based on role
      redirectToDashboard(user.role);
    } else {
      // User not authorized or not logged in
      showAccessDenied();
    }
  } catch (error) {
    console.error('Auth check error:', error);
    showAccessDenied();
  }
}

/**
 * Redirect to appropriate dashboard based on role
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
      showAccessDenied();
  }
}

/**
 * Show access denied message
 */
function showAccessDenied() {
  const main = document.querySelector('main') || document.body;
  main.innerHTML = `
    <div class="container">
      <div class="card">
        <div class="text-center">
          <h1 style="color: var(--danger-color); margin-bottom: 1rem;">Access Denied</h1>
          <p style="font-size: 1.125rem; margin-bottom: 2rem;">
            You are not authorized to use ClassLedger.
          </p>
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">
            Please contact your school administrator to be added to the system.
          </p>
          <a href="index.html" class="btn btn-primary">Return to Homepage</a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Get current user from session
 */
function getCurrentUser() {
  const userStr = sessionStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return sessionStorage.getItem('authenticated') === 'true';
}

/**
 * Logout user
 */
function logout() {
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('authenticated');
  window.location.href = 'index.html';
}

/**
 * Make authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * Make authenticated POST request
 */
async function apiPost(action, data) {
  return apiRequest('', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: action,
      ...data
    })
  });
}

/**
 * Make authenticated GET request
 */
async function apiGet(action, params = {}) {
  const queryString = new URLSearchParams({
    action: action,
    ...params
  }).toString();
  
  return apiRequest(`?${queryString}`);
}

