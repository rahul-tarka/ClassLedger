/**
 * Header Scroll Hide/Show Functionality
 * Hides header on scroll down, shows on scroll up
 */

(function() {
  'use strict';
  
  let lastScrollTop = 0;
  let scrollThreshold = 10; // Minimum scroll distance to trigger hide/show
  let ticking = false;
  let header = null;
  let headerHeight = 0;
  
  function initHeaderScroll() {
    header = document.querySelector('header');
    if (!header) return;
    
    // Calculate header height
    headerHeight = header.offsetHeight;
    
    // Add padding to body to compensate for fixed header
    document.body.classList.add('has-fixed-header');
    document.body.style.paddingTop = headerHeight + 'px';
    
    // Initial check
    handleScroll();
    
    // Listen to scroll events with throttling
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Recalculate on resize
    window.addEventListener('resize', function() {
      headerHeight = header.offsetHeight;
      document.body.style.paddingTop = headerHeight + 'px';
    });
  }
  
  function handleScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Only hide/show if scrolled more than threshold
        if (Math.abs(scrollTop - lastScrollTop) < scrollThreshold) {
          ticking = false;
          return;
        }
        
        if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
          // Scrolling down - hide header
          header.classList.add('header-hidden');
        } else {
          // Scrolling up - show header
          header.classList.remove('header-hidden');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        ticking = false;
      });
      
      ticking = true;
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderScroll);
  } else {
    initHeaderScroll();
  }
})();

