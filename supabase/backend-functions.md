# Supabase Backend Functions

## Overview
Supabase provides auto-generated REST APIs, but we can also create Edge Functions for complex logic.

## Option 1: Use Supabase Auto-Generated APIs (Recommended)

Supabase automatically creates REST APIs for all tables. You can use them directly from frontend.

### Example API Calls:

```javascript
// Get students
const { data, error } = await supabase
  .from('students')
  .select('*')
  .eq('school_id', 'SCH001')
  .eq('class', 'Class 1')
  .eq('active', true);

// Insert attendance
const { data, error } = await supabase
  .from('attendance_log')
  .insert({
    log_id: 'LOG123',
    date: '2025-01-01',
    time: '08:30:00',
    student_id: 'STU001',
    school_id: 'SCH001',
    class: 'Class 1',
    status: 'P',
    type: 'CHECK_IN',
    teacher_email: 'teacher@school.com'
  });

// Update student
const { data, error } = await supabase
  .from('students')
  .update({ name: 'New Name' })
  .eq('student_id', 'STU001');
```

## Option 2: Create Supabase Edge Functions

For complex business logic (like attendance validation, WhatsApp alerts), create Edge Functions.

### Edge Function Structure:

```
supabase/
├── functions/
│   ├── mark-attendance/
│   │   └── index.ts
│   ├── send-whatsapp-alert/
│   │   └── index.ts
│   └── generate-report/
│       └── index.ts
```

### Example Edge Function: mark-attendance

```typescript
// supabase/functions/mark-attendance/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { studentId, status, type, remark } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get current user
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401
      });
    }
    
    // Get student info
    const { data: student } = await supabaseClient
      .from('students')
      .select('*')
      .eq('student_id', studentId)
      .single();
    
    if (!student) {
      return new Response(JSON.stringify({ success: false, error: 'Student not found' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404
      });
    }
    
    // Validate time windows (business logic)
    const currentTime = new Date().toTimeString().slice(0, 5);
    if (type === 'CHECK_IN' && !isTimeInWindow(currentTime, '07:00', '10:30')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Check-in allowed only between 07:00 - 10:30' 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // Generate log ID
    const logId = `LOG${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTimeFull = new Date().toTimeString().slice(0, 8);
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // Insert attendance
    const { data, error } = await supabaseClient
      .from('attendance_log')
      .insert({
        log_id: logId,
        date: currentDate,
        time: currentTimeFull,
        student_id: studentId,
        school_id: student.school_id,
        class: student.class,
        status: status,
        type: type,
        teacher_email: user.email,
        remark: remark || '',
        day: day
      })
      .select()
      .single();
    
    if (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    // Log audit
    await supabaseClient
      .from('audit_log')
      .insert({
        user_email: user.email,
        action: 'MARK_ATTENDANCE',
        details: {
          studentId: studentId,
          status: status,
          type: type,
          logId: logId
        }
      });
    
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

function isTimeInWindow(currentTime, startTime, endTime) {
  const current = parseTime(currentTime);
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  return current >= start && current <= end;
}

function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}
```

## Option 3: Database Functions (PostgreSQL)

For complex queries, create PostgreSQL functions:

```sql
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
```

## Recommendation

**For your use case (500 students, 5 users):**

1. **Use Auto-Generated APIs** for 90% of operations (CRUD)
2. **Create Edge Functions** only for:
   - Complex attendance validation
   - WhatsApp alerts
   - Report generation
   - Bulk operations

3. **Use Database Functions** for:
   - Complex queries (attendance summaries)
   - Aggregations
   - Data transformations

This approach minimizes code and maximizes performance!

