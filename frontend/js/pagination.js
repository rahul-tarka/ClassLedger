/**
 * ClassLedger by Tarka - Pagination Utility
 * Reusable pagination component for all tables/boards
 */

/**
 * Create pagination controls
 */
function createPagination(currentPage, totalPages, onPageChange, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  let html = '<div class="pagination" style="display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-top: 1rem; padding: 1rem;">';
  
  // Previous button
  html += `
    <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
            onclick="${onPageChange}(${currentPage - 1})"
            ${currentPage === 1 ? 'disabled' : ''}
            style="padding: 0.5rem 1rem; border: 1px solid var(--border-color); background: ${currentPage === 1 ? '#f0f0f0' : 'white'}; cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'}; border-radius: 0.25rem;">
      ← Prev
    </button>
  `;
  
  // Page numbers
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  
  if (startPage > 1) {
    html += `<button class="pagination-btn" onclick="${onPageChange}(1)" style="padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); background: white; cursor: pointer; border-radius: 0.25rem;">1</button>`;
    if (startPage > 2) {
      html += `<span style="padding: 0.5rem;">...</span>`;
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    html += `
      <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
              onclick="${onPageChange}(${i})"
              style="padding: 0.5rem 0.75rem; border: 1px solid ${i === currentPage ? 'var(--primary-color)' : 'var(--border-color)'}; background: ${i === currentPage ? 'var(--primary-color)' : 'white'}; color: ${i === currentPage ? 'white' : 'var(--text-primary)'}; cursor: pointer; border-radius: 0.25rem; font-weight: ${i === currentPage ? '600' : '400'};">
        ${i}
      </button>
    `;
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      html += `<span style="padding: 0.5rem;">...</span>`;
    }
    html += `<button class="pagination-btn" onclick="${onPageChange}(${totalPages})" style="padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); background: white; cursor: pointer; border-radius: 0.25rem;">${totalPages}</button>`;
  }
  
  // Next button
  html += `
    <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
            onclick="${onPageChange}(${currentPage + 1})"
            ${currentPage === totalPages ? 'disabled' : ''}
            style="padding: 0.5rem 1rem; border: 1px solid var(--border-color); background: ${currentPage === totalPages ? '#f0f0f0' : 'white'}; cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'}; border-radius: 0.25rem;">
      Next →
    </button>
  `;
  
  html += '</div>';
  
  container.innerHTML = html;
}

/**
 * Paginate array of data
 */
function paginateData(data, page, itemsPerPage) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  return {
    data: paginatedData,
    currentPage: page,
    totalPages: totalPages,
    totalItems: data.length,
    itemsPerPage: itemsPerPage,
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, data.length)
  };
}

/**
 * Create items per page selector
 */
function createItemsPerPageSelector(currentValue, onChange, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const options = [10, 25, 50, 100];
  
  container.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
      <label style="font-size: 0.875rem; color: var(--text-secondary);">Items per page:</label>
      <select onchange="${onChange}(parseInt(this.value))" 
              style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.25rem; background: white;">
        ${options.map(opt => `
          <option value="${opt}" ${opt === currentValue ? 'selected' : ''}>${opt}</option>
        `).join('')}
      </select>
    </div>
  `;
}

/**
 * Create pagination info text
 */
function createPaginationInfo(paginationResult, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const { startIndex, endIndex, totalItems, currentPage, totalPages } = paginationResult;
  
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding: 0.75rem; background: var(--bg-color); border-radius: 0.25rem; font-size: 0.875rem; color: var(--text-secondary);">
      <span>Showing <strong>${startIndex}</strong> to <strong>${endIndex}</strong> of <strong>${totalItems}</strong> items</span>
      <span>Page <strong>${currentPage}</strong> of <strong>${totalPages}</strong></span>
    </div>
  `;
}

