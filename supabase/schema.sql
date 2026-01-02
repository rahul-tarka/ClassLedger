-- ClassLedger Database Schema for Supabase (PostgreSQL)
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SCHOOLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS schools (
  school_id VARCHAR(50) PRIMARY KEY,
  school_name VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TEACHERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teachers (
  email VARCHAR(255) PRIMARY KEY,
  school_id VARCHAR(50) NOT NULL REFERENCES schools(school_id),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('teacher', 'admin', 'principal')),
  class_assigned TEXT[], -- Array of class names
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STUDENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  student_id VARCHAR(50) PRIMARY KEY,
  school_id VARCHAR(50) NOT NULL REFERENCES schools(school_id),
  name VARCHAR(255) NOT NULL,
  class VARCHAR(50) NOT NULL,
  section VARCHAR(10) NOT NULL,
  roll INTEGER NOT NULL,
  parent_mobile VARCHAR(20),
  active BOOLEAN DEFAULT true,
  whatsapp_alert_enabled BOOLEAN DEFAULT false,
  parent_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, class, section, roll)
);

-- ============================================
-- ATTENDANCE LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_log (
  log_id VARCHAR(100) PRIMARY KEY,
  date DATE NOT NULL,
  time TIME NOT NULL,
  student_id VARCHAR(50) NOT NULL REFERENCES students(student_id),
  school_id VARCHAR(50) NOT NULL REFERENCES schools(school_id),
  class VARCHAR(50) NOT NULL,
  status VARCHAR(1) NOT NULL CHECK (status IN ('P', 'A', 'L')),
  type VARCHAR(20) NOT NULL CHECK (type IN ('CHECK_IN', 'CHECK_OUT')),
  teacher_email VARCHAR(255) REFERENCES teachers(email),
  remark TEXT,
  day VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
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
CREATE TABLE IF NOT EXISTS whatsapp_log (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES students(student_id),
  parent_mobile VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'sent', 'failed', 'skipped'
  response JSONB,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CORRECTION REQUESTS TABLE (New)
-- ============================================
CREATE TABLE IF NOT EXISTS correction_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id VARCHAR(50) NOT NULL REFERENCES students(student_id),
  date DATE NOT NULL,
  current_status VARCHAR(1) NOT NULL,
  requested_status VARCHAR(1) NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_by VARCHAR(255), -- Student/parent email if separate portal
  reviewed_by VARCHAR(255) REFERENCES teachers(email),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Students indexes
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(school_id, class);
CREATE INDEX IF NOT EXISTS idx_students_active ON students(active) WHERE active = true;

-- Teachers indexes
CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers(email);
CREATE INDEX IF NOT EXISTS idx_teachers_active ON teachers(active) WHERE active = true;

-- Attendance log indexes
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_log(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance_log(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_school_class_date ON attendance_log(school_id, class, date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance_log(student_id, date);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_user_email ON audit_log(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);

-- WhatsApp log indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_student_date ON whatsapp_log(student_id, date);
CREATE INDEX IF NOT EXISTS idx_whatsapp_date ON whatsapp_log(date);

-- Correction requests indexes
CREATE INDEX IF NOT EXISTS idx_correction_student_id ON correction_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_correction_status ON correction_requests(status);
CREATE INDEX IF NOT EXISTS idx_correction_date ON correction_requests(date);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE correction_requests ENABLE ROW LEVEL SECURITY;

-- Schools: Users can only see their school
CREATE POLICY "Users can view their school" ON schools
  FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM teachers 
      WHERE email = auth.jwt() ->> 'email' AND active = true
    )
  );

-- Teachers: Users can see teachers in their school
CREATE POLICY "Users can view teachers in their school" ON teachers
  FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM teachers 
      WHERE email = auth.jwt() ->> 'email' AND active = true
    )
  );

-- Students: Teachers can see students in their assigned classes
CREATE POLICY "Teachers can view students in their classes" ON students
  FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM teachers 
      WHERE email = auth.jwt() ->> 'email' AND active = true
    )
    AND (
      EXISTS (
        SELECT 1 FROM teachers t
        WHERE t.email = auth.jwt() ->> 'email'
        AND students.class = ANY(t.class_assigned)
      )
      OR EXISTS (
        SELECT 1 FROM teachers 
        WHERE email = auth.jwt() ->> 'email' 
        AND role IN ('admin', 'principal')
      )
    )
  );

-- Admin can insert/update/delete students
CREATE POLICY "Admin can manage students" ON students
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teachers 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin' AND active = true
    )
  );

-- Attendance: Teachers can insert attendance for their classes
CREATE POLICY "Teachers can insert attendance" ON attendance_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.email = auth.jwt() ->> 'email' 
      AND t.active = true
      AND (
        attendance_log.class = ANY(t.class_assigned)
        OR t.role IN ('admin', 'principal')
      )
    )
  );

-- Attendance: Users can view attendance for their school/classes
CREATE POLICY "Users can view attendance" ON attendance_log
  FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM teachers 
      WHERE email = auth.jwt() ->> 'email' AND active = true
    )
  );

-- Admin can edit any attendance
CREATE POLICY "Admin can edit attendance" ON attendance_log
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teachers 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin' AND active = true
    )
  );

-- Audit log: All authenticated users can insert
CREATE POLICY "Authenticated users can log actions" ON audit_log
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Audit log: Only admins can view
CREATE POLICY "Admin can view audit log" ON audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teachers 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin' AND active = true
    )
  );

-- WhatsApp log: Admin can view
CREATE POLICY "Admin can view WhatsApp log" ON whatsapp_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teachers 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin' AND active = true
    )
  );

-- Correction requests: Admin can view and manage
CREATE POLICY "Admin can manage correction requests" ON correction_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teachers 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin' AND active = true
    )
  );

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

-- Function to get user's school_id
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS VARCHAR(50) AS $$
  SELECT school_id FROM teachers 
  WHERE email = auth.jwt() ->> 'email' 
  AND active = true 
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM teachers 
    WHERE email = auth.jwt() ->> 'email' 
    AND role = 'admin' 
    AND active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to add sample data
/*
INSERT INTO schools (school_id, school_name, active) VALUES
('SCH001', 'ABC Public School', true);

INSERT INTO teachers (email, school_id, name, role, class_assigned, active) VALUES
('admin@school.com', 'SCH001', 'Admin User', 'admin', ARRAY['Class 1', 'Class 2'], true),
('teacher@school.com', 'SCH001', 'Teacher User', 'teacher', ARRAY['Class 1'], true);
*/

