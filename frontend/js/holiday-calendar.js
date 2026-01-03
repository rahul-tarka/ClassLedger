/**
 * ClassLedger by Tarka - Holiday Calendar Module
 * Manage holidays and exclude them from reports
 */

let holidays = [];

// Pagination state for holidays
let holidaysPaginationState = {
  currentPage: 1,
  itemsPerPage: 5, // Default: 5 rows to minimize scrolling
  allData: []
};

/**
 * Load holidays from backend (stored in Script Properties or separate sheet)
 */
async function loadHolidays() {
  try {
    // For now, use default holidays (can be stored in database if needed)
    // Format: [{"date":"2024-01-26","name":"Republic Day","type":"national"}]
    holidays = getDefaultHolidays();
  } catch (error) {
    console.error('Load holidays error:', error);
    // Use default holidays if error
    holidays = getDefaultHolidays();
  }
}

/**
 * Get default holidays (India)
 */
function getDefaultHolidays() {
  const currentYear = new Date().getFullYear();
  return [
    { date: `${currentYear}-01-26`, name: 'Republic Day', type: 'national' },
    { date: `${currentYear}-08-15`, name: 'Independence Day', type: 'national' },
    { date: `${currentYear}-10-02`, name: 'Gandhi Jayanti', type: 'national' },
    { date: `${currentYear}-01-01`, name: 'New Year', type: 'general' }
  ];
}

/**
 * Check if a date is a holiday
 */
function isHoliday(dateString) {
  return holidays.some(h => h.date === dateString);
}

/**
 * Get holiday name for a date
 */
function getHolidayName(dateString) {
  const holiday = holidays.find(h => h.date === dateString);
  return holiday ? holiday.name : null;
}

/**
 * Filter out holidays from date range
 */
function filterHolidays(dateArray) {
  return dateArray.filter(date => !isHoliday(date));
}

/**
 * Add holiday
 */
async function addHoliday(date, name, type = 'general') {
  try {
    // For now, store in localStorage (can be moved to database if needed)
    holidays.push({ date, name, type });
    localStorage.setItem('holidays', JSON.stringify(holidays));
    showToast('Holiday added successfully', 'success');
    return true;
  } catch (error) {
    console.error('Add holiday error:', error);
    showToast('Error adding holiday', 'error');
    return false;
  }
}

/**
 * Remove holiday
 */
async function removeHoliday(date) {
  try {
    // For now, store in localStorage (can be moved to database if needed)
    holidays = holidays.filter(h => h.date !== date);
    localStorage.setItem('holidays', JSON.stringify(holidays));
    showToast('Holiday removed successfully', 'success');
    return true;
  } catch (error) {
    console.error('Remove holiday error:', error);
    showToast('Error removing holiday', 'error');
    return false;
  }
}

/**
 * Render holiday calendar with pagination
 * @param {string} containerId - Container ID for holidays
 * @param {number} year - Optional year (for backward compatibility)
 * @param {number} month - Optional month (for backward compatibility)
 */
function renderHolidayCalendar(containerId, year, month) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Store all data for pagination (flatten holidays list)
  holidaysPaginationState.allData = holidays || [];
  
  if (holidaysPaginationState.allData.length === 0) {
    container.innerHTML = '<p class="text-center">No holidays configured</p>';
    // Clear pagination
    const paginationContainer = document.getElementById('holidaysPagination');
    const paginationInfo = document.getElementById('holidaysPaginationInfo');
    const itemsPerPageSelector = document.getElementById('holidaysItemsPerPage');
    if (paginationContainer) paginationContainer.innerHTML = '';
    if (paginationInfo) paginationInfo.innerHTML = '';
    if (itemsPerPageSelector) itemsPerPageSelector.innerHTML = '';
    return;
  }
  
  // Sort holidays by date
  const sortedHolidays = [...holidaysPaginationState.allData].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
  
  // Paginate data
  const paginationResult = paginateData(
    sortedHolidays,
    holidaysPaginationState.currentPage,
    holidaysPaginationState.itemsPerPage
  );
  
  // Group paginated holidays by month
  const byMonth = {};
  paginationResult.data.forEach(holiday => {
    const month = holiday.date.substring(0, 7); // YYYY-MM
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(holiday);
  });
  
  container.innerHTML = `
    <div class="holiday-calendar">
      ${Object.keys(byMonth).sort().map(month => {
        const monthHolidays = byMonth[month];
        const monthName = new Date(month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        
        return `
          <div class="holiday-month" style="margin-bottom: 1.5rem;">
            <h4>${monthName}</h4>
            <div class="holiday-list">
              ${monthHolidays.map(holiday => `
                <div class="holiday-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--card-bg); border-radius: 0.375rem; margin-bottom: 0.5rem;">
                  <div>
                    <strong>${formatDate(holiday.date)}</strong>
                    <span style="margin-left: 1rem; color: var(--text-secondary);">${holiday.name}</span>
                    <span class="holiday-badge ${holiday.type}" style="margin-left: 0.5rem; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; background: ${holiday.type === 'national' ? '#fee2e2' : '#dbeafe'}; color: ${holiday.type === 'national' ? '#991b1b' : '#1e40af'};">
                      ${holiday.type}
                    </span>
                  </div>
                  <button class="btn btn-sm btn-danger" onclick="removeHoliday('${holiday.date}').then(() => renderHolidayCalendar('${containerId}'))">
                    Remove
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  // Render pagination controls
  createPagination(
    paginationResult.currentPage,
    paginationResult.totalPages,
    (page) => {
      holidaysPaginationState.currentPage = page;
      renderHolidayCalendar(containerId);
    },
    'holidaysPagination'
  );
  
  // Render pagination info
  createPaginationInfo(paginationResult, 'holidaysPaginationInfo');
  
  // Render items per page selector
  createItemsPerPageSelector(
    holidaysPaginationState.itemsPerPage,
    (itemsPerPage) => {
      holidaysPaginationState.itemsPerPage = itemsPerPage;
      holidaysPaginationState.currentPage = 1;
      renderHolidayCalendar(containerId);
    },
    'holidaysItemsPerPage'
  );
}
