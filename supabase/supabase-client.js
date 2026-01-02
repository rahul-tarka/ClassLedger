/**
 * ClassLedger - Supabase Client Configuration
 * Replace Google Apps Script API with Supabase
 */

// Supabase Configuration
// Get these from Supabase Dashboard → Settings → API
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL'; // e.g., https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Public anon key

// Initialize Supabase client
let supabaseClient = null;

/**
 * Initialize Supabase client
 */
function initSupabase() {
  if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseClient;
  } else {
    console.error('Supabase JS library not loaded. Add: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
    return null;
  }
}

/**
 * Get current Supabase client
 */
function getSupabase() {
  if (!supabaseClient) {
    return initSupabase();
  }
  return supabaseClient;
}

/**
 * Sign in with Google
 */
async function signInWithGoogle() {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase not initialized' };
  
  try {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login.html`
      }
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get current user
 */
async function getCurrentUser() {
  const client = getSupabase();
  if (!client) return null;
  
  try {
    const { data: { user }, error } = await client.auth.getUser();
    
    if (error || !user) return null;
    
    // Get user details from teachers table
    const { data: teacher, error: teacherError } = await client
      .from('teachers')
      .select('*')
      .eq('email', user.email)
      .eq('active', true)
      .single();
    
    if (teacherError || !teacher) return null;
    
    return {
      email: teacher.email,
      name: teacher.name,
      role: teacher.role,
      schoolId: teacher.school_id,
      classAssigned: teacher.class_assigned || []
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Sign out
 */
async function signOut() {
  const client = getSupabase();
  if (!client) return;
  
  await client.auth.signOut();
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('authenticated');
}

/**
 * Check if user is authenticated
 */
async function isAuthenticated() {
  const client = getSupabase();
  if (!client) return false;
  
  try {
    const { data: { user } } = await client.auth.getUser();
    return !!user;
  } catch (error) {
    return false;
  }
}

/**
 * API Request wrapper for Supabase
 */
async function supabaseRequest(table, action, filters = {}, data = null) {
  const client = getSupabase();
  if (!client) {
    return { success: false, error: 'Supabase not initialized' };
  }
  
  try {
    let result;
    
    switch (action) {
      case 'select':
        let query = client.from(table).select('*');
        
        // Apply filters
        Object.keys(filters).forEach(key => {
          if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
            query = query.eq(key, filters[key]);
          }
        });
        
        result = await query;
        break;
        
      case 'insert':
        result = await client.from(table).insert(data).select();
        break;
        
      case 'update':
        const updateFilters = { ...filters };
        delete updateFilters.id; // Remove id from filters, use it for update
        result = await client.from(table).update(data).eq('id', filters.id).select();
        break;
        
      case 'delete':
        result = await client.from(table).delete().eq('id', filters.id);
        break;
        
      default:
        return { success: false, error: 'Invalid action' };
    }
    
    if (result.error) {
      return { success: false, error: result.error.message };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initSupabase();
  });
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initSupabase,
    getSupabase,
    signInWithGoogle,
    getCurrentUser,
    signOut,
    isAuthenticated,
    supabaseRequest
  };
}

