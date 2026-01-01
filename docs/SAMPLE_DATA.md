# Sample Data for Testing

Use this sample data to quickly set up and test ClassLedger.

## School_Master

| school_id | school_name | active |
|-----------|-------------|--------|
| SCH001 | ABC Public School | TRUE |
| SCH002 | XYZ International School | TRUE |

## Student_Master

| student_id | school_id | name | class | section | roll | parent_mobile | active |
|------------|-----------|------|-------|---------|------|---------------|--------|
| STU001 | SCH001 | John Doe | Class 1 | A | 1 | +919876543210 | TRUE |
| STU002 | SCH001 | Jane Smith | Class 1 | A | 2 | +919876543211 | TRUE |
| STU003 | SCH001 | Bob Johnson | Class 1 | B | 1 | +919876543212 | TRUE |
| STU004 | SCH001 | Alice Williams | Class 2 | A | 1 | +919876543213 | TRUE |
| STU005 | SCH001 | Charlie Brown | Class 2 | A | 2 | +919876543214 | TRUE |

## Teacher_Master

**Important**: Replace `your-email@gmail.com` with your actual Google account email.

| email | name | role | school_id | class_assigned | active |
|-------|------|------|-----------|----------------|--------|
| your-email@gmail.com | Your Name | teacher | SCH001 | Class 1 | TRUE |
| admin@example.com | Admin User | admin | SCH001 | Class 1,Class 2 | TRUE |
| principal@example.com | Principal User | principal | SCH001 | | TRUE |

## Attendance_Log

Leave this empty - it will be populated automatically by the app.

## Audit_Log

Leave this empty - it will be populated automatically by the app.

## Notes

1. **Email Matching**: The email in `Teacher_Master` must exactly match the Google account email you use to sign in.

2. **Class Names**: Use consistent class names (e.g., "Class 1", "Class 2", "Nursery", "KG"). The system is case-sensitive.

3. **School ID**: All students and teachers must reference a valid `school_id` from `School_Master`.

4. **Active Status**: Set `active` to `TRUE` for all records you want to use. Set to `FALSE` to deactivate without deleting.

5. **Testing**: Start with a small dataset (5-10 students) to test the system before adding more data.

## Adding More Data

### To add more students:
1. Generate unique `student_id` (e.g., STU006, STU007)
2. Ensure `school_id` exists in `School_Master`
3. Use consistent `class` names
4. Ensure `roll` numbers are unique within each class-section combination

### To add more teachers:
1. Use the teacher's actual Google email
2. Set appropriate `role` (teacher/admin/principal)
3. For teachers, specify `class_assigned` (comma-separated)
4. For admins, can assign multiple classes or leave empty for all
5. For principals, leave `class_assigned` empty

### To add more schools:
1. Generate unique `school_id` (e.g., SCH003)
2. Add school to `School_Master`
3. Add students and teachers with the new `school_id`

