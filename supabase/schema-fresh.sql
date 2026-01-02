-- ClassLedger Database Schema for Supabase (PostgreSQL)
-- FRESH INSTALL - Drops all existing tables and creates new ones
-- Run this in Supabase SQL Editor for a clean setup

-- ============================================
-- DROP ALL EXISTING TABLES (Clean Slate)
-- ============================================
-- Drop in reverse order of dependencies
DROP TABLE IF EXISTS correction_requests CASCADE;
DROP TABLE IF EXISTS whatsapp_log CASCADE;
DROP TABLE IF EXISTS school_allowed_emails CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS attendance_log CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS schools CASCADE;
DROP TABLE IF EXISTS product_admins CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_user_school_id() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS get_student_attendance_summary(VARCHAR, VARCHAR) CASCADE;

-- Drop extensions if needed (optional)
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- ============================================
-- CREATE EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PRODUCT ADMINS TABLE (Super Admin)
-- ============================================
CREATE TABLE product_admins (
  email VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SCHOOLS TABLE
-- ============================================
CREATE TABLE schools (
  school_id VARCHAR(50) PRIMARY KEY,
  school_name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  product_admin_email VARCHAR(255) REFERENCES product_admins(email) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TEACHERS TABLE
-- ============================================
CREATE TABLE teachers (
  email VARCHAR(255) PRIMARY KEY,
  school_id VARCHAR(50) NOT NULL REFERENCES schools(school_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('teacher', 'admin', 'principal')),
  class_assigned TEXT[], -- Array of class names
  phone VARCHAR(20),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STUDENTS TABLE
-- ============================================
CREATE TABLE students (
  student_id VARCHAR(50) PRIMARY KEY,
  school_id VARCHAR(50) NOT NULL REFERENCES schools(school_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  class VARCHAR(50) NOT NULL,
  section VARCHAR(10) NOT NULL,
  roll INTEGER NOT NULL,
  parent_mobile VARCHAR(20),
  parent_name VARCHAR(255),
  active BOOLEAN DEFAULT true,
  whatsapp_alert_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, class, section, roll)
);

-- ============================================
-- ATTENDANCE LOG TABLE
-- ============================================
CREATE TABLE attendance_log (
  log_id VARCHAR(100) PRIMARY KEY,
  date DATE NOT NULL,
  time TIME NOT NULL,
  student_id VARCHAR(50) NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  school_id VARCHAR(50) NOT NULL REFERENCES schools(school_id) ON DELETE CASCADE,
  class VARCHAR(50) NOT NULL,
  status VARCHAR(1) CHECK (status IS NULL OR status IN ('P', 'A', 'L')),
  type VARCHAR(20) NOT NULL CHECK (type IN ('CHECK_IN', 'CHECK_OUT')),
  teacher_email VARCHAR(255) REFERENCES teachers(email) ON DELETE SET NULL,
  remark TEXT,
  day VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AUDIT LOG TABLE
-- ============================================
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_email VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT
);

-- ============================================
-- WHATSAPP LOG TABLE
-- ============================================
CREATE TABLE whatsapp_log (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES students(student_id) ON DELETE CASCADE,
  parent_mobile VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'sent', 'failed', 'skipped'
  response JSONB,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SCHOOL ALLOWED EMAILS TABLE
-- ============================================
CREATE TABLE school_allowed_emails (
  id SERIAL PRIMARY KEY,
  school_id VARCHAR(50) NOT NULL REFERENCES schools(school_id) ON DELETE CASCADE,
  email_pattern VARCHAR(255) NOT NULL, -- Can be specific email or domain (e.g., @school.com)
  type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'domain')), -- 'email' for specific, 'domain' for domain
  active BOOLEAN DEFAULT true,
  created_by VARCHAR(255) REFERENCES teachers(email) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, email_pattern)
);

-- ============================================
-- CORRECTION REQUESTS TABLE
-- ============================================
CREATE TABLE correction_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id VARCHAR(50) NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  current_status VARCHAR(1) NOT NULL,
  requested_status VARCHAR(1) NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_by VARCHAR(255),
  reviewed_by VARCHAR(255) REFERENCES teachers(email) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Product admins indexes
CREATE INDEX idx_product_admins_active ON product_admins(active) WHERE active = true;
CREATE INDEX idx_product_admins_email ON product_admins(email);

-- Schools indexes
CREATE INDEX idx_schools_active ON schools(active) WHERE active = true;
CREATE INDEX idx_schools_product_admin ON schools(product_admin_email);

-- Teachers indexes
CREATE INDEX idx_teachers_school_id ON teachers(school_id);
CREATE INDEX idx_teachers_email ON teachers(email);
CREATE INDEX idx_teachers_active ON teachers(active) WHERE active = true;
CREATE INDEX idx_teachers_role ON teachers(role);

-- Students indexes
CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_students_class ON students(school_id, class);
CREATE INDEX idx_students_active ON students(active) WHERE active = true;
CREATE INDEX idx_students_school_class_section ON students(school_id, class, section);

-- Attendance log indexes
CREATE INDEX idx_attendance_date ON attendance_log(date);
CREATE INDEX idx_attendance_student_id ON attendance_log(student_id);
CREATE INDEX idx_attendance_school_class_date ON attendance_log(school_id, class, date);
CREATE INDEX idx_attendance_student_date ON attendance_log(student_id, date);
CREATE INDEX idx_attendance_type ON attendance_log(type);

-- Audit log indexes
CREATE INDEX idx_audit_user_email ON audit_log(user_email);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_action ON audit_log(action);

-- WhatsApp log indexes
CREATE INDEX idx_whatsapp_student_date ON whatsapp_log(student_id, date);
CREATE INDEX idx_whatsapp_date ON whatsapp_log(date);
CREATE INDEX idx_whatsapp_status ON whatsapp_log(status);

-- Correction requests indexes
CREATE INDEX idx_correction_student_id ON correction_requests(student_id);
CREATE INDEX idx_correction_status ON correction_requests(status);
CREATE INDEX idx_correction_date ON correction_requests(date);

-- School allowed emails indexes
CREATE INDEX idx_allowed_emails_school_id ON school_allowed_emails(school_id);
CREATE INDEX idx_allowed_emails_pattern ON school_allowed_emails(email_pattern);
CREATE INDEX idx_allowed_emails_active ON school_allowed_emails(active) WHERE active = true;

-- ============================================
-- RLS HELPER FUNCTIONS (Must be defined before RLS policies)
-- ============================================
-- These functions use SECURITY DEFINER to bypass RLS and avoid infinite recursion

-- Function to check product admin status (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION is_product_admin(check_email VARCHAR)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM product_admins 
    WHERE email = check_email AND active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to get user's school_id (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS VARCHAR(50) AS $$
  SELECT school_id FROM teachers 
  WHERE email = auth.jwt() ->> 'email' 
  AND active = true 
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is admin (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM teachers 
    WHERE email = auth.jwt() ->> 'email' 
    AND role = 'admin' 
    AND active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is principal (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION is_principal()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM teachers 
    WHERE email = auth.jwt() ->> 'email' 
    AND role = 'principal' 
    AND active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is admin or principal (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION is_admin_or_principal()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM teachers 
    WHERE email = auth.jwt() ->> 'email' 
    AND role IN ('admin', 'principal')
    AND active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to get user's assigned classes (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION get_user_classes()
RETURNS TEXT[] AS $$
  SELECT class_assigned FROM teachers 
  WHERE email = auth.jwt() ->> 'email' 
  AND active = true 
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE product_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_allowed_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE correction_requests ENABLE ROW LEVEL SECURITY;

-- Product Admins: Users can check their own status (for authentication)
CREATE POLICY "Users can check own product admin status" ON product_admins
  FOR SELECT
  USING (
    email = auth.jwt() ->> 'email'
  );

-- Product Admins: Product admins can view all (using function to avoid recursion)
CREATE POLICY "Product admins can view all" ON product_admins
  FOR SELECT
  USING (
    is_product_admin(auth.jwt() ->> 'email')
  );

-- Schools: Product admins can view all, others only their school
-- Use get_user_school_id() function to avoid recursion
CREATE POLICY "Users can view their school" ON schools
  FOR SELECT
  USING (
    is_product_admin(auth.jwt() ->> 'email')
    OR school_id = get_user_school_id()
    OR NOT schools_exist() -- Allow viewing during onboarding (using function to avoid recursion)
  );

-- Schools: Product admins can manage all schools
CREATE POLICY "Product admins can manage schools" ON schools
  FOR ALL
  USING (
    is_product_admin(auth.jwt() ->> 'email')
  );

-- Allow school creation during onboarding (when no schools exist)
CREATE POLICY "Allow onboarding school creation" ON schools
  FOR INSERT
  WITH CHECK (
    NOT schools_exist() -- Only allow if no schools exist (using function to avoid recursion)
    OR is_product_admin(auth.jwt() ->> 'email') -- Or if product admin
  );

-- Teachers: Users can see teachers in their school
-- Allow users to see their own record + teachers in their school (using function to avoid recursion)
CREATE POLICY "Users can view teachers in their school" ON teachers
  FOR SELECT
  USING (
    email = auth.jwt() ->> 'email'  -- Users can see their own record
    OR school_id = get_user_school_id()  -- Users can see teachers in their school
    OR NOT teachers_exist() -- Allow first teacher creation (using function to avoid recursion)
    OR NOT schools_exist() -- Allow viewing during onboarding (using function to avoid recursion)
  );

-- Teachers: Admin can manage teachers
-- Use is_admin() function to avoid recursion
CREATE POLICY "Admin can manage teachers" ON teachers
  FOR ALL
  USING (
    is_admin()  -- Use existing SECURITY DEFINER function
    OR NOT teachers_exist() -- Allow first admin creation (using function to avoid recursion)
    OR NOT schools_exist() -- Allow during onboarding (using function to avoid recursion)
  );

-- Allow teacher creation during onboarding
CREATE POLICY "Allow onboarding teacher creation" ON teachers
  FOR INSERT
  WITH CHECK (
    NOT schools_exist() -- Only allow if no schools exist (onboarding, using function to avoid recursion)
    OR is_admin() -- Or if admin
    OR NOT teachers_exist() -- Or if first teacher (using function to avoid recursion)
  );

-- Function to check if user is principal (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION is_principal()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM teachers 
    WHERE email = auth.jwt() ->> 'email' 
    AND role = 'principal' 
    AND active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is admin or principal (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION is_admin_or_principal()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM teachers 
    WHERE email = auth.jwt() ->> 'email' 
    AND role IN ('admin', 'principal')
    AND active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to get user's assigned classes (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION get_user_classes()
RETURNS TEXT[] AS $$
  SELECT class_assigned FROM teachers 
  WHERE email = auth.jwt() ->> 'email' 
  AND active = true 
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Students: Teachers can see students in their classes
-- Use helper functions to avoid recursion
CREATE POLICY "Teachers can view students in their classes" ON students
  FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND (
      students.class = ANY(get_user_classes())
      OR is_admin_or_principal()
    )
  );

-- Admin can insert/update/delete students
CREATE POLICY "Admin can manage students" ON students
  FOR ALL
  USING (is_admin());

-- Attendance: Teachers can insert attendance for their classes
-- Use helper functions to avoid recursion
CREATE POLICY "Teachers can insert attendance" ON attendance_log
  FOR INSERT
  WITH CHECK (
    attendance_log.school_id = get_user_school_id()
    AND (
      attendance_log.class = ANY(get_user_classes())
      OR is_admin_or_principal()
    )
  );

-- Attendance: Users can view attendance for their school/classes
-- Use get_user_school_id() function to avoid recursion
CREATE POLICY "Users can view attendance" ON attendance_log
  FOR SELECT
  USING (
    school_id = get_user_school_id()
  );

-- Admin can edit any attendance
CREATE POLICY "Admin can edit attendance" ON attendance_log
  FOR UPDATE
  USING (is_admin());

-- Audit log: All authenticated users can insert
CREATE POLICY "Authenticated users can log actions" ON audit_log
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Audit log: Only admins can view
CREATE POLICY "Admin can view audit log" ON audit_log
  FOR SELECT
  USING (is_admin());

-- WhatsApp log: Admin can view
CREATE POLICY "Admin can view WhatsApp log" ON whatsapp_log
  FOR SELECT
  USING (is_admin());

-- Correction requests: Admin can view and manage
CREATE POLICY "Admin can manage correction requests" ON correction_requests
  FOR ALL
  USING (is_admin());

-- School Allowed Emails: School admin can manage
CREATE POLICY "School admin can manage allowed emails" ON school_allowed_emails
  FOR ALL
  USING (
    is_admin()
    AND school_allowed_emails.school_id = get_user_school_id()
  );

-- School Allowed Emails: Anyone can view (for login check)
CREATE POLICY "Anyone can view allowed emails" ON school_allowed_emails
  FOR SELECT
  USING (active = true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================
-- Note: is_product_admin() is defined in RLS section above

-- Note: get_user_school_id() and is_admin() are defined in RLS section above

-- Function to get student attendance summary
CREATE OR REPLACE FUNCTION get_student_attendance_summary(
  p_student_id VARCHAR(50),
  p_school_id VARCHAR(50)
)
RETURNS TABLE (
  total_days BIGINT,
  present BIGINT,
  absent BIGINT,
  late BIGINT,
  attendance_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_days,
    COUNT(*) FILTER (WHERE status = 'P')::BIGINT as present,
    COUNT(*) FILTER (WHERE status = 'A')::BIGINT as absent,
    COUNT(*) FILTER (WHERE status = 'L')::BIGINT as late,
    ROUND(
      (COUNT(*) FILTER (WHERE status = 'P')::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
      2
    ) as attendance_percentage
  FROM attendance_log
  WHERE student_id = p_student_id
    AND school_id = p_school_id
    AND type = 'CHECK_IN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Schema created successfully! All tables, indexes, and policies are ready.';
  RAISE NOTICE '📝 Next: Set up onboarding in your application.';
END $$;

