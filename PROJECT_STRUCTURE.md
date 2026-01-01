# ClassLedger Project Structure

## Overview

ClassLedger is a complete school attendance management system built with Google Apps Script, Google Sheets, and vanilla web technologies.

## Directory Structure

```
ClassLedger/
├── backend/
│   └── Code.gs                    # Main Apps Script backend (API endpoints)
│
├── frontend/
│   ├── index.html                 # Homepage (landing page)
│   ├── login.html                 # Login/authentication page
│   ├── teacher-dashboard.html     # Teacher interface
│   ├── admin-dashboard.html       # Admin interface
│   ├── principal-dashboard.html   # Principal interface (read-only)
│   ├── css/
│   │   └── styles.css            # Main stylesheet (mobile-first)
│   └── js/
│       ├── auth.js               # Authentication & API utilities
│       ├── teacher.js            # Teacher dashboard logic
│       ├── admin.js              # Admin dashboard logic
│       └── principal.js          # Principal dashboard logic
│
├── docs/
│   ├── SHEETS_SETUP.md           # Google Sheets schema & setup
│   ├── DEPLOYMENT.md             # Deployment instructions
│   ├── QUICK_START.md            # 5-minute setup guide
│   └── SAMPLE_DATA.md            # Sample data for testing
│
├── README.md                      # Main project documentation
├── PROJECT_STRUCTURE.md           # This file
└── .gitignore                     # Git ignore rules
```

## File Descriptions

### Backend

**`backend/Code.gs`**
- Complete Apps Script backend
- Handles all API endpoints (GET/POST)
- Authentication & authorization
- Attendance management
- Reporting & data retrieval
- Audit logging
- Future-ready stub functions (parent alerts, etc.)

### Frontend - HTML

**`frontend/index.html`**
- Landing page with branding
- Feature overview
- System requirements
- Links to login

**`frontend/login.html`**
- Google OAuth login interface
- Access requirements information
- Redirects to appropriate dashboard

**`frontend/teacher-dashboard.html`**
- Class selection
- Student list with attendance buttons
- Real-time summary statistics
- Attendance marking interface

**`frontend/admin-dashboard.html`**
- Daily attendance reports
- Absent students list
- Teacher accountability tracking
- Date range reports
- Export capabilities

**`frontend/principal-dashboard.html`**
- School overview statistics
- Read-only access to all reports
- Class-wise attendance views
- Teacher accountability (view-only)

### Frontend - JavaScript

**`frontend/js/auth.js`**
- Google OAuth handling
- User validation
- Session management
- API request utilities
- Role-based redirects

**`frontend/js/teacher.js`**
- Student list loading
- Attendance marking logic
- Edit window validation (15 minutes)
- Summary statistics
- Real-time updates

**`frontend/js/admin.js`**
- Report generation
- Absent students retrieval
- Teacher accountability tracking
- Date range reports
- Export functionality

**`frontend/js/principal.js`**
- Overview statistics
- Read-only report views
- Disabled edit capabilities
- Dashboard initialization

### Frontend - CSS

**`frontend/css/styles.css`**
- Complete mobile-first responsive design
- Modern UI with CSS variables
- Card-based layouts
- Form styling
- Button styles
- Modal components
- Table styling
- Responsive breakpoints

### Documentation

**`docs/SHEETS_SETUP.md`**
- Detailed Google Sheets schema
- Column definitions
- Setup instructions
- Data type specifications

**`docs/DEPLOYMENT.md`**
- Step-by-step deployment guide
- Apps Script configuration
- Web App deployment
- Troubleshooting

**`docs/QUICK_START.md`**
- 5-minute setup guide
- Quick reference
- Common issues

**`docs/SAMPLE_DATA.md`**
- Sample data for testing
- Data format examples
- Testing scenarios

## Data Flow

1. **User Access**: Homepage → Login → Dashboard (role-based)
2. **Authentication**: Google OAuth → Validate against Teacher_Master
3. **Attendance Marking**: Teacher → Mark → Validate → Save to Attendance_Log
4. **Audit Trail**: All actions → Log to Audit_Log
5. **Reports**: Admin/Principal → Query Attendance_Log → Display

## Key Features Implementation

### Authentication
- Google OAuth via Apps Script
- Whitelist validation (Teacher_Master)
- Role-based access control
- Session management

### Attendance Logic
- Time window validation (07:00-10:30 for check-in)
- Automatic late detection (after 09:15)
- Duplicate prevention
- 15-minute edit window
- Append-only logs

### Reporting
- Real-time statistics
- Date range reports
- Class-wise filtering
- Teacher accountability
- Export to Google Drive

### Security
- OAuth authentication
- Whitelist-based access
- Role-based permissions
- Audit-safe logs
- Data validation

## Future-Ready Features

The codebase includes stub functions for:
- Parent alerts (WhatsApp/SMS)
- Academic year management
- Class addition automation
- Multi-school scalability

These are ready for implementation when needed.

## Technology Stack

- **Backend**: Google Apps Script (JavaScript)
- **Database**: Google Sheets (5 tables)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: Google OAuth
- **Analytics**: Looker Studio ready

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment Model

1. Google Sheets (database) - Cloud-based
2. Apps Script (backend) - Deployed as Web App
3. Frontend files - Can be hosted on any web server or served via Apps Script

## Maintenance

- All data stored in Google Sheets (easy to backup/export)
- Audit logs provide complete action history
- No external dependencies
- No paid services required
- Easy to scale (add more sheets/schools)

## Support & Updates

- Code is well-commented
- Modular structure for easy updates
- Future-ready architecture
- Comprehensive documentation

