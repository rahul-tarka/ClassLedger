/**
 * ClassLedger by Tarka - Holiday Calendar Module
 * Version 2.0 Feature
 */

let holidays = [];

/**
 * Load holidays from backend (stored in Script Properties or Sheet)
 */
async function loadHolidays() {
  try {
    // For now, use localStorage. In future, fetch from backend
    const saved = localStorage.getItem('holidays');
    if (saved) {
      holidays = JSON.parse(saved);
    }
    return holidays;
  } catch (e) {
    console.error('Load holidays error:', e);
    return [];
  }
}

/**
 * Save holidays
 */
function saveHolidays() {
  localStorage.setItem('holidays', JSON.stringify(holidays));
}

/**
 * Add holiday
 */
function addHoliday(date, name) {
  if (!holidays.find(h => h.date === date)) {
    holidays.push({ date, name });
    saveHolidays();
    return true;
  }
  return false;
}

/**
 * Remove holiday
 */
function removeHoliday(date) {
  holidays = holidays.filter(h => h.date !== date);
  saveHolidays();
}

/**
 * Check if date is holiday
 */
function isHoliday(date) {
  return holidays.some(h => h.date === date);
}

/**
 * Get holiday name for date
 */
function getHolidayName(date) {
  const holiday = holidays.find(h => h.date === date);
  return holiday ? holiday.name : null;
}

/**
 * Render holiday calendar
 */
function renderHolidayCalendar(containerId, year, month) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  let html = `
    <div class="holiday-calendar">
      ${dayNames.map(day => `<div class="calendar-day" style="font-weight: 600; background: var(--bg-color);">${day}</div>`).join('')}
  `;
  
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    html += '<div class="calendar-day"></div>';
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const isHolidayDate = isHoliday(dateStr);
    const isToday = dateStr === todayStr;
    
    let classes = 'calendar-day';
    if (isHolidayDate) classes += ' holiday';
    if (isToday) classes += ' today';
    
    const holidayName = getHolidayName(dateStr);
    const title = holidayName ? `title="${holidayName}"` : '';
    
    html += `<div class="${classes}" ${title} data-date="${dateStr}">${day}</div>`;
  }
  
  html += '</div>';
  
  container.innerHTML = html;
  
  // Add click handlers
  container.querySelectorAll('.calendar-day[data-date]').forEach(day => {
    day.addEventListener('click', () => {
      const date = day.dataset.date;
      if (isHoliday(date)) {
        removeHoliday(date);
        Toast.success('Holiday removed');
      } else {
        const name = prompt('Enter holiday name:');
        if (name) {
          addHoliday(date, name);
          Toast.success('Holiday added');
        }
      }
      renderHolidayCalendar(containerId, year, month);
    });
  });
}

