/**
 * ClassLedger - Supabase Authentication Module
 * Handles multi-tenant authentication with product admin, school admin, and allowed emails
 */

/**
 * Authenticate user after Google OAuth
 */
async function authenticateUser() {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }
    
    // Get authenticated user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user || !user.email) {
      console.error('Auth error:', authError);
      return { success: false, error: 'Not authenticated' };
    }
    
    const userEmail = user.email;
    console.log('🔍 Authenticating user:', userEmail);
    
    // Step 1: Check if Product Admin
    const { data: productAdmin, error: productAdminError } = await supabase
      .from('product_admins')
      .select('*')
      .eq('email', userEmail)
      .eq('active', true)
      .single();
    
    console.log('📋 Product Admin check:', { productAdmin, error: productAdminError });
    
    if (productAdmin && !productAdminError) {
      // Product Admin
      const userData = {
        email: productAdmin.email,
        name: productAdmin.name,
        role: 'product_admin',
        type: 'product_admin'
      };
      
      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('authenticated', 'true');
      
      return {
        success: true,
        user: userData,
        redirect: 'product-admin-dashboard.html'
      };
    }
    
    // Step 2: Check if School Admin (in teachers table with role='admin')
    const { data: schoolAdmin, error: schoolAdminError } = await supabase
      .from('teachers')
      .select('*, schools(*)')
      .eq('email', userEmail)
      .eq('role', 'admin')
      .eq('active', true)
      .single();
    
    console.log('📋 School Admin check:', { schoolAdmin, error: schoolAdminError });
    
    if (schoolAdmin && !schoolAdminError) {
      // School Admin
      const userData = {
        email: schoolAdmin.email,
        name: schoolAdmin.name,
        role: 'admin',
        schoolId: schoolAdmin.school_id,
        classAssigned: schoolAdmin.class_assigned || [],
        type: 'school_admin'
      };
      
      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('authenticated', 'true');
      
      return {
        success: true,
        user: userData,
        redirect: 'admin-dashboard.html'
      };
    }
    
    // Step 3: Check if Teacher/Principal (must be in teachers table AND in allowed emails)
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('*, schools(*)')
      .eq('email', userEmail)
      .eq('active', true)
      .single();
    
    console.log('📋 Teacher/Principal check:', { teacher, error: teacherError });
    
    if (teacher && !teacherError) {
      // User exists in teachers table, now check allowed emails
      const isAllowed = await checkEmailAllowed(userEmail, teacher.school_id);
      
      if (!isAllowed) {
        return {
          success: false,
          error: 'Your email is not in the allowed list. Please contact your school administrator.'
        };
      }
      
      // Teacher or Principal
      const userData = {
        email: teacher.email,
        name: teacher.name,
        role: teacher.role,
        schoolId: teacher.school_id,
        classAssigned: teacher.class_assigned || [],
        type: 'teacher_or_principal'
      };
      
      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('authenticated', 'true');
      
      const redirect = teacher.role === 'principal' 
        ? 'principal-dashboard.html' 
        : 'teacher-dashboard.html';
      
      return {
        success: true,
        user: userData,
        redirect: redirect
      };
    }
    
    // User not found in any table
    console.error('❌ User not found in any table:', userEmail);
    console.log('💡 Please check:');
    console.log('   1. Is email in product_admins table?');
    console.log('   2. Is email in teachers table?');
    console.log('   3. Is active = true?');
    
    return {
      success: false,
      error: `You are not authorized to use ClassLedger. Email: ${userEmail}. Please contact your administrator.`
    };
    
  } catch (error) {
    console.error('Authenticate user error:', error);
    return {
      success: false,
      error: error.message || 'Authentication failed'
    };
  }
}

/**
 * Check if email is in allowed list for school
 */
async function checkEmailAllowed(email, schoolId) {
  try {
    const supabase = getSupabase();
    if (!supabase) return false;
    
    // Get all allowed email patterns for this school
    const { data: allowedEmails, error } = await supabase
      .from('school_allowed_emails')
      .select('*')
      .eq('school_id', schoolId)
      .eq('active', true);
    
    if (error || !allowedEmails || allowedEmails.length === 0) {
      // No allowed emails defined - allow all (for backward compatibility)
      // Or you can return false to require explicit allow list
      return true; // Change to false if you want strict checking
    }
    
    // Check if email matches any pattern
    for (const pattern of allowedEmails) {
      if (pattern.type === 'email') {
        // Exact email match
        if (pattern.email_pattern.toLowerCase() === email.toLowerCase()) {
          return true;
        }
      } else if (pattern.type === 'domain') {
        // Domain match (e.g., @school.com)
        const domain = pattern.email_pattern.toLowerCase();
        if (email.toLowerCase().endsWith(domain)) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Check email allowed error:', error);
    return false;
  }
}

/**
 * Sign in with Google
 */
async function signInWithGoogle() {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }
    
    // Get current path and construct redirect URL with base path for GitHub Pages
    const currentPath = window.location.pathname;
    // Remove filename and keep directory path (e.g., /ClassLedger/login.html -> /ClassLedger/)
    const basePath = currentPath.replace(/[^/]*$/, '');
    const redirectUrl = `${window.location.origin}${basePath}login.html`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    
    if (error) {
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Sign in with Google error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sign out
 */
async function signOut() {
  try {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    
    sessionStorage.clear();
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Sign out error:', error);
    sessionStorage.clear();
    window.location.href = 'login.html';
  }
}

/**
 * Get current user from session
 */
function getCurrentUser() {
  const userStr = sessionStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Global logout function (for HTML onclick handlers)
 */
async function logout() {
  await signOut();
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return sessionStorage.getItem('authenticated') === 'true';
}

/**
 * Redirect to appropriate dashboard
 */
function redirectToDashboard(role) {
  switch (role) {
    case 'product_admin':
      window.location.href = 'product-admin-dashboard.html';
      break;
    case 'admin':
      window.location.href = 'admin-dashboard.html';
      break;
    case 'teacher':
      window.location.href = 'teacher-dashboard.html';
      break;
    case 'principal':
      window.location.href = 'principal-dashboard.html';
      break;
    default:
      window.location.href = 'login.html?error=unauthorized';
  }
}

/**
 * Show access denied message
 */
function showAccessDenied(message = null) {
  const main = document.querySelector('main') || document.body;
  main.innerHTML = `
    <div class="container">
      <div class="card">
        <div class="text-center">
          <h1 style="color: var(--danger-color); margin-bottom: 1rem;">Access Denied</h1>
          <p style="font-size: 1.125rem; margin-bottom: 2rem;">
            ${message || 'You are not authorized to use ClassLedger.'}
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

