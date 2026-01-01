/**
 * ClassLedger by Tarka - Utility Functions
 * Shared utilities for all modules
 */

/**
 * Toast Notification System
 */
class Toast {
  static show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add icon based on type
    const icon = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    }[type] || 'ℹ';
    
    toast.innerHTML = `<span class="toast-icon">${icon}</span> ${message}`;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
  
  static success(message, duration) {
    this.show(message, 'success', duration);
  }
  
  static error(message, duration) {
    this.show(message, 'error', duration);
  }
  
  static warning(message, duration) {
    this.show(message, 'warning', duration);
  }
  
  static info(message, duration) {
    this.show(message, 'info', duration);
  }
}

/**
 * Skeleton Loader
 */
function showSkeleton(elementId, count = 3) {
  const el = document.getElementById(elementId);
  if (!el) return;
  
  el.innerHTML = Array(count).fill(0).map(() => `
    <div class="skeleton-item">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text" style="width: 80%;"></div>
    </div>
  `).join('');
}

/**
 * Confirmation Dialog
 */
function confirmAction(message, title = 'Confirm') {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="btn-close" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <p>${message}</p>
        </div>
        <div class="modal-footer" style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove(); arguments[0].stopPropagation();">Cancel</button>
          <button class="btn btn-primary" onclick="this.closest('.modal').remove(); window.__confirmResult = true;">Confirm</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const confirmBtn = modal.querySelector('.btn-primary');
    const cancelBtn = modal.querySelector('.btn-secondary');
    
    confirmBtn.onclick = () => {
      modal.remove();
      resolve(true);
    };
    
    cancelBtn.onclick = () => {
      modal.remove();
      resolve(false);
    };
    
    // Close on backdrop click
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.remove();
        resolve(false);
      }
    };
  });
}

/**
 * Auto-save draft attendance
 */
class AutoSave {
  constructor() {
    this.draftKey = 'attendance_draft';
    this.autoSaveInterval = null;
  }
  
  save(classId, attendanceData) {
    try {
      const draft = {
        classId,
        data: attendanceData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(this.draftKey, JSON.stringify(draft));
    } catch (e) {
      console.error('Auto-save failed:', e);
    }
  }
  
  load() {
    try {
      const draft = localStorage.getItem(this.draftKey);
      if (draft) {
        return JSON.parse(draft);
      }
    } catch (e) {
      console.error('Auto-load failed:', e);
    }
    return null;
  }
  
  clear() {
    localStorage.removeItem(this.draftKey);
  }
  
  startAutoSave(classId, getAttendanceData) {
    this.stopAutoSave();
    this.autoSaveInterval = setInterval(() => {
      const data = getAttendanceData();
      if (data && Object.keys(data).length > 0) {
        this.save(classId, data);
      }
    }, 30000); // Auto-save every 30 seconds
  }
  
  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }
}

const autoSave = new AutoSave();

/**
 * Keyboard Shortcuts
 */
class KeyboardShortcuts {
  constructor() {
    this.shortcuts = new Map();
    this.init();
  }
  
  init() {
    document.addEventListener('keydown', (e) => {
      const key = this.getKeyString(e);
      const handler = this.shortcuts.get(key);
      if (handler && !this.isInputFocused()) {
        e.preventDefault();
        handler();
      }
    });
  }
  
  register(key, handler) {
    this.shortcuts.set(key, handler);
  }
  
  unregister(key) {
    this.shortcuts.delete(key);
  }
  
  getKeyString(e) {
    let key = '';
    if (e.ctrlKey || e.metaKey) key += 'Ctrl+';
    if (e.shiftKey) key += 'Shift+';
    if (e.altKey) key += 'Alt+';
    key += e.key;
    return key;
  }
  
  isInputFocused() {
    const active = document.activeElement;
    return active && (
      active.tagName === 'INPUT' ||
      active.tagName === 'TEXTAREA' ||
      active.isContentEditable
    );
  }
}

const shortcuts = new KeyboardShortcuts();

/**
 * Real-time Updates (Polling)
 */
class RealTimeUpdates {
  constructor() {
    this.intervals = new Map();
    this.callbacks = new Map();
  }
  
  start(key, callback, interval = 10000) {
    this.stop(key);
    this.callbacks.set(key, callback);
    const intervalId = setInterval(() => {
      callback();
    }, interval);
    this.intervals.set(key, intervalId);
  }
  
  stop(key) {
    const intervalId = this.intervals.get(key);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(key);
      this.callbacks.delete(key);
    }
  }
  
  stopAll() {
    this.intervals.forEach((intervalId) => clearInterval(intervalId));
    this.intervals.clear();
    this.callbacks.clear();
  }
}

const realTimeUpdates = new RealTimeUpdates();

/**
 * Chart.js Helper (for future use)
 */
function createChart(canvasId, type, data, options = {}) {
  // Placeholder for Chart.js integration
  // Will be implemented when Chart.js is added
  console.log('Chart creation:', { canvasId, type, data, options });
}

/**
 * Export to PDF Helper
 */
async function exportToPDF(elementId, filename = 'report.pdf') {
  // Using html2pdf.js or similar library
  // Placeholder for PDF export
  Toast.info('PDF export feature coming soon!');
}

/**
 * Export to Excel Helper
 */
function exportToExcel(data, filename = 'report.xlsx') {
  // Using SheetJS or similar library
  // Placeholder for Excel export
  Toast.info('Excel export feature coming soon!');
}

/**
 * Format Date Helper
 */
function formatDate(date, format = 'DD/MM/YYYY') {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year);
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Format number with commas
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Get current language
 */
function getCurrentLanguage() {
  return localStorage.getItem('language') || 'en';
}

/**
 * Set language
 */
function setLanguage(lang) {
  localStorage.setItem('language', lang);
  window.location.reload(); // Reload to apply language
}

/**
 * Translate text (simple implementation)
 */
const translations = {
  en: {
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'confirm': 'Confirm',
    'cancel': 'Cancel'
  },
  hi: {
    'loading': 'लोड हो रहा है...',
    'error': 'त्रुटि',
    'success': 'सफल',
    'confirm': 'पुष्टि करें',
    'cancel': 'रद्द करें'
  }
};

function t(key) {
  const lang = getCurrentLanguage();
  return translations[lang]?.[key] || translations.en[key] || key;
}

