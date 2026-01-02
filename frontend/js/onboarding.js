/**
 * ClassLedger - Onboarding Flow
 * Handles school setup, admin creation, and initial data import
 */

// Store onboarding data
let onboardingData = {
  school: null,
  admin: null,
  teachers: [],
  students: []
};

// Current step
let currentStep = 1;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initOnboarding();
});

/**
 * Initialize onboarding
 */
function initOnboarding() {
  // Check if already onboarded
  checkOnboardingStatus();
  
  // Setup form handlers
  setupFormHandlers();
  
  // Load existing data if any
  loadOnboardingData();
}

/**
 * Check if school already exists
 */
async function checkOnboardingStatus() {
  try {
    const supabase = getSupabase();
    if (!supabase) return;
    
    const { data: schools, error } = await supabase
      .from('schools')
      .select('*')
      .limit(1);
    
    if (schools && schools.length > 0) {
      // School exists, redirect to login
      window.location.href = 'login.html';
    }
  } catch (error) {
    console.error('Check onboarding status error:', error);
  }
}

/**
 * Setup form handlers
 */
function setupFormHandlers() {
  // School form
  const schoolForm = document.getElementById('schoolForm');
  if (schoolForm) {
    schoolForm.addEventListener('submit', handleSchoolSubmit);
  }
  
  // Teacher form
  const teacherForm = document.getElementById('teacherForm');
  if (teacherForm) {
    teacherForm.addEventListener('submit', handleTeacherSubmit);
  }
  
  // Student form
  const studentForm = document.getElementById('studentForm');
  if (studentForm) {
    studentForm.addEventListener('submit', handleStudentSubmit);
  }
}

/**
 * Handle school form submission
 */
async function handleSchoolSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const schoolData = {
    school_id: generateSchoolId(),
    school_name: formData.get('schoolName'),
    address: formData.get('schoolAddress') || null,
    phone: formData.get('schoolPhone') || null,
    email: formData.get('schoolEmail') || null,
    active: true
  };
  
  const adminData = {
    email: formData.get('adminEmail'),
    school_id: schoolData.school_id,
    name: formData.get('adminName'),
    role: 'admin',
    phone: formData.get('adminPhone') || null,
    class_assigned: [],
    active: true
  };
  
  try {
    showLoading('Creating school and admin account...');
    
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }
    
    // Create school
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert(schoolData)
      .select()
      .single();
    
    if (schoolError) throw schoolError;
    
    // Create admin
    const { data: admin, error: adminError } = await supabase
      .from('teachers')
      .insert(adminData)
      .select()
      .single();
    
    if (adminError) throw adminError;
    
    // Store data
    onboardingData.school = school;
    onboardingData.admin = admin;
    
    // Move to next step
    nextStep(1, 2);
    
    showToast('School and admin created successfully!', 'success');
  } catch (error) {
    console.error('Create school error:', error);
    showToast('Error creating school: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Handle teacher form submission
 */
async function handleTeacherSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const classesStr = formData.get('teacherClasses') || '';
  const classes = classesStr.split(',').map(c => c.trim()).filter(c => c);
  
  const teacherData = {
    email: formData.get('teacherEmail'),
    school_id: onboardingData.school.school_id,
    name: formData.get('teacherName'),
    role: formData.get('teacherRole'),
    class_assigned: classes,
    phone: formData.get('teacherPhone') || null,
    active: true
  };
  
  try {
    showLoading('Adding teacher...');
    
    const supabase = getSupabase();
    
    // Check if teacher already exists
    const { data: existingTeacher, error: checkError } = await supabase
      .from('teachers')
      .select('email')
      .eq('email', teacherData.email)
      .single();
    
    if (existingTeacher) {
      throw new Error(`Teacher with email ${teacherData.email} already exists. Please use a different email.`);
    }
    
    // Insert teacher
    const { data: teacher, error } = await supabase
      .from('teachers')
      .insert(teacherData)
      .select()
      .single();
    
    if (error) {
      // Handle duplicate key error specifically
      if (error.code === '23505') {
        throw new Error(`Teacher with email ${teacherData.email} already exists. Please use a different email.`);
      }
      throw error;
    }
    
    // Add to list
    onboardingData.teachers.push(teacher);
    renderTeachersList();
    
    // Reset form
    e.target.reset();
    
    showToast('Teacher added successfully!', 'success');
  } catch (error) {
    console.error('Add teacher error:', error);
    const errorMessage = error.message || 'Failed to add teacher. Please try again.';
    showToast('Error adding teacher: ' + errorMessage, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Handle student form submission
 */
async function handleStudentSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const studentData = {
    student_id: generateStudentId(),
    school_id: onboardingData.school.school_id,
    name: formData.get('studentName'),
    class: formData.get('studentClass'),
    section: formData.get('studentSection'),
    roll: parseInt(formData.get('studentRoll')),
    parent_name: formData.get('parentName') || null,
    parent_mobile: formData.get('parentMobile') || null,
    whatsapp_alert_enabled: formData.get('whatsappEnabled') === 'on',
    active: true
  };
  
  try {
    showLoading('Adding student...');
    
    const supabase = getSupabase();
    const { data: student, error } = await supabase
      .from('students')
      .insert(studentData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Add to list
    onboardingData.students.push(student);
    renderStudentsList();
    
    // Reset form
    e.target.reset();
    
    showToast('Student added successfully!', 'success');
  } catch (error) {
    console.error('Add student error:', error);
    showToast('Error adding student: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Handle teacher CSV import
 */
async function handleTeacherCsvImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    showLoading('Importing teachers from CSV...');
    
    const text = await file.text();
    const rows = parseCSV(text);
    
    if (rows.length === 0) {
      throw new Error('CSV file is empty');
    }
    
    // Validate headers
    const headers = rows[0];
    const requiredHeaders = ['name', 'email', 'role'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h.toLowerCase()));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }
    
    // Process rows
    const teachers = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0) continue;
      
      const teacherData = {
        email: row[headers.indexOf('email')] || row[headers.indexOf('Email')],
        school_id: onboardingData.school.school_id,
        name: row[headers.indexOf('name')] || row[headers.indexOf('Name')],
        role: (row[headers.indexOf('role')] || row[headers.indexOf('Role')] || 'teacher').toLowerCase(),
        class_assigned: (row[headers.indexOf('classes')] || row[headers.indexOf('Classes')] || '').split(',').map(c => c.trim()).filter(c => c),
        phone: row[headers.indexOf('phone')] || row[headers.indexOf('Phone')] || null,
        active: true
      };
      
      teachers.push(teacherData);
    }
    
    // Insert teachers
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('teachers')
      .insert(teachers)
      .select();
    
    if (error) throw error;
    
    // Add to list
    onboardingData.teachers.push(...data);
    renderTeachersList();
    
    document.getElementById('teacherImportStatus').textContent = `✅ Imported ${data.length} teachers successfully!`;
    showToast(`Imported ${data.length} teachers!`, 'success');
  } catch (error) {
    console.error('Import teachers error:', error);
    document.getElementById('teacherImportStatus').textContent = `❌ Error: ${error.message}`;
    showToast('Error importing teachers: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Handle student CSV import
 */
async function handleStudentCsvImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    showLoading('Importing students from CSV...');
    
    const text = await file.text();
    const rows = parseCSV(text);
    
    if (rows.length === 0) {
      throw new Error('CSV file is empty');
    }
    
    // Validate headers
    const headers = rows[0];
    const requiredHeaders = ['name', 'class', 'section', 'roll'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h.toLowerCase()));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }
    
    // Process rows
    const students = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0) continue;
      
      const studentData = {
        student_id: generateStudentId(),
        school_id: onboardingData.school.school_id,
        name: row[headers.indexOf('name')] || row[headers.indexOf('Name')],
        class: row[headers.indexOf('class')] || row[headers.indexOf('Class')],
        section: row[headers.indexOf('section')] || row[headers.indexOf('Section')],
        roll: parseInt(row[headers.indexOf('roll')] || row[headers.indexOf('Roll')]),
        parent_name: row[headers.indexOf('parent_name')] || row[headers.indexOf('Parent Name')] || null,
        parent_mobile: row[headers.indexOf('parent_mobile')] || row[headers.indexOf('Parent Mobile')] || null,
        whatsapp_alert_enabled: (row[headers.indexOf('whatsapp_enabled')] || 'false').toLowerCase() === 'true',
        active: true
      };
      
      students.push(studentData);
    }
    
    // Insert students (batch)
    const supabase = getSupabase();
    const batchSize = 50;
    let imported = 0;
    
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('students')
        .insert(batch)
        .select();
      
      if (error) throw error;
      imported += data.length;
    }
    
    // Add to list
    onboardingData.students.push(...students.slice(0, imported));
    renderStudentsList();
    
    document.getElementById('studentImportStatus').textContent = `✅ Imported ${imported} students successfully!`;
    showToast(`Imported ${imported} students!`, 'success');
  } catch (error) {
    console.error('Import students error:', error);
    document.getElementById('studentImportStatus').textContent = `❌ Error: ${error.message}`;
    showToast('Error importing students: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Parse CSV text
 */
function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim());
  return lines.map(line => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  });
}

/**
 * Download teacher CSV template
 */
function downloadTeacherTemplate() {
  const csv = 'name,email,role,classes,phone\nJohn Doe,john@school.com,teacher,"Class 1, Class 2",1234567890\nJane Smith,jane@school.com,principal,,9876543210';
  downloadCSV(csv, 'teachers_template.csv');
}

/**
 * Download student CSV template
 */
function downloadStudentTemplate() {
  const csv = 'name,class,section,roll,parent_name,parent_mobile,whatsapp_enabled\nRahul Kumar,Class 1,A,1,Parent Name,9876543210,true\nPriya Singh,Class 1,A,2,Parent Name,9876543211,false';
  downloadCSV(csv, 'students_template.csv');
}

/**
 * Download CSV file
 */
function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Render teachers list
 */
function renderTeachersList() {
  const container = document.getElementById('teachersListContent');
  if (!container) return;
  
  if (onboardingData.teachers.length === 0) {
    container.innerHTML = '<p style="color: #666;">No teachers added yet.</p>';
    return;
  }
  
  const html = onboardingData.teachers.map(teacher => `
    <div style="padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 0.5rem;">
      <strong>${teacher.name}</strong> (${teacher.email}) - ${teacher.role}
      ${teacher.class_assigned && teacher.class_assigned.length > 0 ? `<br><small>Classes: ${teacher.class_assigned.join(', ')}</small>` : ''}
    </div>
  `).join('');
  
  container.innerHTML = html;
}

/**
 * Render students list
 */
function renderStudentsList() {
  const container = document.getElementById('studentsListContent');
  if (!container) return;
  
  if (onboardingData.students.length === 0) {
    container.innerHTML = '<p style="color: #666;">No students added yet.</p>';
    return;
  }
  
  const html = `<p style="color: #666; margin-bottom: 0.5rem;">Total: ${onboardingData.students.length} students</p>
    <div style="max-height: 300px; overflow-y: auto;">
      ${onboardingData.students.slice(0, 20).map(student => `
        <div style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 0.25rem; font-size: 0.9rem;">
          <strong>${student.name}</strong> - ${student.class} ${student.section} (Roll: ${student.roll})
        </div>
      `).join('')}
      ${onboardingData.students.length > 20 ? `<p style="color: #666; font-size: 0.9rem;">... and ${onboardingData.students.length - 20} more</p>` : ''}
    </div>`;
  
  container.innerHTML = html;
}

/**
 * Navigate to next step
 */
function nextStep(from, to) {
  // Update step indicators
  document.getElementById(`step${from}-dot`).classList.remove('active');
  document.getElementById(`step${from}-dot`).classList.add('completed');
  document.getElementById(`step${to}-dot`).classList.add('active');
  
  // Hide current step, show next
  document.getElementById(`step${from}`).classList.remove('active');
  document.getElementById(`step${to}`).classList.add('active');
  
  currentStep = to;
  
  // Load data for next step
  if (to === 2) {
    renderTeachersList();
  } else if (to === 3) {
    renderStudentsList();
  }
}

/**
 * Navigate to previous step
 */
function previousStep(from) {
  const to = from - 1;
  if (to < 1) return;
  
  // Update step indicators
  document.getElementById(`step${from}-dot`).classList.remove('active');
  document.getElementById(`step${to}-dot`).classList.remove('completed');
  document.getElementById(`step${to}-dot`).classList.add('active');
  
  // Hide current step, show previous
  document.getElementById(`step${from}`).classList.remove('active');
  document.getElementById(`step${to}`).classList.add('active');
  
  currentStep = to;
}

/**
 * Complete onboarding
 */
function completeOnboarding() {
  // Store onboarding complete flag
  localStorage.setItem('onboarding_complete', 'true');
  
  // Redirect to login
  window.location.href = 'login.html';
}

/**
 * Skip onboarding
 */
function skipOnboarding() {
  if (confirm('Are you sure you want to skip setup? You can set up your school later from the admin dashboard.')) {
    window.location.href = 'login.html';
  }
}

/**
 * Load existing onboarding data
 */
function loadOnboardingData() {
  // Load from localStorage if available
  const saved = localStorage.getItem('onboarding_data');
  if (saved) {
    try {
      onboardingData = JSON.parse(saved);
      renderTeachersList();
      renderStudentsList();
    } catch (e) {
      console.error('Load onboarding data error:', e);
    }
  }
}

/**
 * Generate school ID
 */
function generateSchoolId() {
  return 'SCH' + Date.now().toString().slice(-6);
}

/**
 * Generate student ID
 */
function generateStudentId() {
  return 'STU' + Date.now().toString() + Math.floor(Math.random() * 1000);
}

/**
 * Show loading
 */
function showLoading(message) {
  // Simple loading implementation
  const loader = document.createElement('div');
  loader.id = 'onboarding-loader';
  loader.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;';
  loader.innerHTML = `<div style="background: white; padding: 2rem; border-radius: 8px;">${message || 'Loading...'}</div>`;
  document.body.appendChild(loader);
}

/**
 * Hide loading
 */
function hideLoading() {
  const loader = document.getElementById('onboarding-loader');
  if (loader) loader.remove();
}

/**
 * Show toast
 */
function showToast(message, type = 'info') {
  // Simple toast implementation
  const toast = document.createElement('div');
  toast.style.cssText = `position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem; background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'}; color: white; border-radius: 4px; z-index: 10000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

