/**
 * Check if onboarding is needed
 * Redirects to onboarding page if no school exists
 */

async function checkOnboardingNeeded() {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      console.warn('Supabase not initialized, skipping onboarding check');
      return false;
    }
    
    // Check if any school exists
    const { data: schools, error } = await supabase
      .from('schools')
      .select('school_id')
      .limit(1);
    
    if (error) {
      console.error('Check onboarding error:', error);
      return false;
    }
    
    // If no schools exist, redirect to onboarding
    if (!schools || schools.length === 0) {
      // Check if we're already on onboarding page
      if (window.location.pathname.includes('onboarding.html')) {
        return true; // Already on onboarding
      }
      
      // Redirect to onboarding
      window.location.href = 'onboarding.html';
      return true;
    }
    
    return false; // Onboarding not needed
  } catch (error) {
    console.error('Onboarding check error:', error);
    return false;
  }
}

// Run check on page load (for login and index pages)
if (typeof window !== 'undefined') {
  // Only check on login.html and index.html, not on onboarding.html itself
  if (window.location.pathname.includes('login.html') || 
      window.location.pathname === '/' || 
      window.location.pathname.endsWith('index.html')) {
    window.addEventListener('DOMContentLoaded', async () => {
      // Small delay to ensure Supabase is initialized
      setTimeout(async () => {
        await checkOnboardingNeeded();
      }, 500);
    });
  }
}

