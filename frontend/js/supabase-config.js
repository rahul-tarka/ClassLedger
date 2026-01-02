/**
 * ClassLedger - Supabase Client Configuration
 * Get these values from Supabase Dashboard → Settings → API
 */

// Supabase Configuration
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

// Initialize on load
if (typeof window !== 'undefined') {
  // Load Supabase library if not already loaded
  if (typeof supabase === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = () => {
      initSupabase();
    };
    document.head.appendChild(script);
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      initSupabase();
    });
  }
}

