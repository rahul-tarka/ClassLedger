/**
 * ClassLedger by Tarka - Mobile Table Converter
 * Converts tables to mobile-friendly card layout
 */

/**
 * Convert table to cards on mobile
 */
function convertTableToCards(tableId, cardClass = 'mobile-card') {
  const table = document.getElementById(tableId)?.querySelector('table');
  if (!table) return;
  
  // Check if mobile
  if (window.innerWidth > 767) {
    // Desktop - show table, hide cards
    table.style.display = 'table';
    const existingCards = document.querySelectorAll(`.${cardClass}`);
    existingCards.forEach(card => card.remove());
    return;
  }
  
  // Mobile - hide table, show cards
  table.style.display = 'none';
  
  // Remove existing cards
  const existingCards = document.querySelectorAll(`.${cardClass}`);
  existingCards.forEach(card => card.remove());
  
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');
  if (!thead || !tbody) return;
  
  const headers = Array.from(thead.querySelectorAll('th')).map(th => th.textContent.trim());
  const rows = tbody.querySelectorAll('tr');
  
  const container = table.parentElement;
  
  rows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    if (cells.length === 0) return;
    
    const card = document.createElement('div');
    card.className = cardClass;
    card.style.cssText = `
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 0.75rem;
      box-shadow: var(--shadow);
    `;
    
    let cardHTML = '<div style="display: flex; flex-direction: column; gap: 0.75rem;">';
    
    cells.forEach((cell, cellIndex) => {
      if (cellIndex >= headers.length) return;
      
      const header = headers[cellIndex];
      const content = cell.innerHTML;
      
      // Skip if content is empty
      if (!content.trim()) return;
      
      // Check if it's an action column
      const isAction = cell.querySelector('button') || cell.querySelector('a.btn');
      
      if (isAction) {
        cardHTML += `
          <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color);">
            ${content}
          </div>
        `;
      } else {
        cardHTML += `
          <div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.5px;">
              ${header}
            </div>
            <div style="font-size: 0.9375rem; color: var(--text-primary);">
              ${content}
            </div>
          </div>
        `;
      }
    });
    
    cardHTML += '</div>';
    card.innerHTML = cardHTML;
    container.appendChild(card);
  });
}

/**
 * Initialize mobile table conversion for all tables
 */
function initMobileTables() {
  // Convert all tables in containers with id
  const tableContainers = [
    'studentsList',
    'teachersList',
    'absentStudents',
    'teacherAccountability'
  ];
  
  tableContainers.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (container) {
      convertTableToCards(containerId, `mobile-card-${containerId}`);
    }
  });
  
  // Also handle tables in dateRangeReport
  const reportContainer = document.getElementById('dateRangeReport');
  if (reportContainer) {
    const table = reportContainer.querySelector('table');
    if (table) {
      convertTableToCards('dateRangeReport', 'mobile-card-report');
    }
  }
}

/**
 * Watch for window resize
 */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    initMobileTables();
  }, 250);
});

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initMobileTables, 100);
  });
} else {
  setTimeout(initMobileTables, 100);
}

// Re-initialize after dynamic content loads
const observer = new MutationObserver(() => {
  setTimeout(initMobileTables, 100);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

