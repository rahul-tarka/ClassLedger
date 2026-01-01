# ClassLedger by Tarka

**Secure School Attendance System**

An audit-safe, loss-proof attendance system for schools built with Google Apps Script, Google Sheets, and modern web technologies.

## 🏗️ Architecture

- **Backend**: Google Apps Script (Serverless)
- **Database**: Google Sheets (5 master tables)
- **Frontend**: HTML + CSS + Vanilla JavaScript
- **Analytics**: Looker Studio integration ready
- **Authentication**: Google OAuth

## 📁 Project Structure

```
ClassLedger/
├── backend/
│   └── Code.gs                 # Main Apps Script backend
├── frontend/
│   ├── index.html              # Homepage
│   ├── login.html              # Login page
│   ├── teacher-dashboard.html  # Teacher interface
│   ├── admin-dashboard.html    # Admin interface
│   ├── principal-dashboard.html # Principal interface
│   ├── css/
│   │   └── styles.css          # Main stylesheet
│   ├── js/
│   │   ├── auth.js             # Authentication logic
│   │   ├── teacher.js          # Teacher dashboard logic
│   │   ├── admin.js            # Admin dashboard logic
│   │   ├── principal.js        # Principal dashboard logic
│   │   ├── utils.js            # Utility functions
│   │   ├── realtime.js         # Real-time updates
│   │   ├── analytics.js        # Analytics & insights
│   │   ├── advanced-reporting.js # Charts & exports
│   │   ├── bulk-operations.js  # Bulk operations
│   │   └── holiday-calendar.js # Holiday management
│   └── README.md               # Frontend documentation
├── ClassLedger_Setup/
│   ├── Setup.gs                # Automated Google Sheets setup
│   └── GenerateDemoData.gs     # Demo data generator
├── docs/
│   ├── DEPLOYMENT_STEPS.md     # Complete deployment guide
│   ├── SHEETS_SETUP.md         # Google Sheets schema guide
│   └── WHATSAPP_SETUP.md       # WhatsApp alerts setup (optional)
├── sync-frontend.sh            # Frontend sync script
├── netlify.toml                # Netlify configuration
├── deploy-surge.sh             # Surge.sh deployment script
└── README.md                   # This file
```

## 🚀 Quick Start

### Step 1: Setup Google Sheets

**Option A: Automated Setup (Recommended)**
1. Open Google Apps Script: https://script.google.com
2. Create new project
3. Copy code from `ClassLedger_Setup/Setup.gs`
4. Run `setupClassLedger()` function
5. Copy the Spreadsheet ID and URL from logs

**Option B: Manual Setup**
Follow `docs/SHEETS_SETUP.md` for detailed manual setup instructions.

### Step 2: Deploy Backend (Apps Script)

1. Open Google Apps Script: https://script.google.com
2. Create new project or use existing
3. Copy code from `backend/Code.gs`
4. Set Script Properties:
   - `SHEET_ID_SCHOOL_MASTER`
   - `SHEET_ID_STUDENT_MASTER`
   - `SHEET_ID_TEACHER_MASTER`
   - `SHEET_ID_ATTENDANCE_LOG`
   - `SHEET_ID_AUDIT_LOG`
   - `SHEET_ID_WHATSAPP_LOG` (optional)
5. Deploy as Web App:
   - Execute as: Me
   - Who has access: Anyone
   - Click Deploy
6. Copy the Web App URL

### Step 3: Configure Frontend

1. Open `frontend/js/auth.js`
2. Update `API_URL` with your Apps Script Web App URL:
   ```javascript
   const API_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL';
   ```

### Step 4: Deploy Frontend

**Option A: GitHub Pages (Recommended for Public Repo)**
1. Create public repository in second GitHub account
2. Copy `frontend/` folder contents to new repo
3. Enable GitHub Pages in repository settings
4. Site will be live at: `https://username.github.io/repo-name/`

**Option B: Netlify (For Private Repo)**
1. Go to https://app.netlify.com
2. Import project from GitHub
3. Build settings:
   - Base directory: `frontend`
   - Publish directory: `frontend`
4. Deploy

**Option C: Surge.sh (Fastest)**
```bash
cd frontend
surge . your-site-name.surge.sh
```

### Step 5: Setup WhatsApp Alerts (Optional)

Follow `docs/WHATSAPP_SETUP.md` for WhatsApp Cloud API setup.

## 📊 Features

### Core Features
- ✅ Multi-school support
- ✅ Real-time attendance tracking
- ✅ Automatic late detection (after 09:15)
- ✅ Role-based dashboards (Teacher/Admin/Principal)
- ✅ Audit-safe append-only logs
- ✅ 15-minute edit window for corrections

### Version 2.0 Features
- ✅ **Real-time Updates** - Auto-refresh functionality
- ✅ **Advanced Reporting** - Charts, PDF export, custom date ranges
- ✅ **Analytics & Insights** - Trend analysis, anomaly detection, performance metrics
- ✅ **Holiday Calendar** - Manage holidays and exclude from reports
- ✅ **Bulk Operations** - Import students, bulk attendance marking
- ✅ **WhatsApp Alerts** - Absent student notifications (Hindi messages)

### User Experience
- ✅ Toast notifications
- ✅ Keyboard shortcuts (Ctrl+R refresh, Ctrl+S save)
- ✅ Loading indicators
- ✅ Export utilities (CSV, JSON, PDF)
- ✅ Responsive design (mobile-first)

## 🔐 Security Features

- Google OAuth authentication
- Whitelist-based access control
- Role-based permissions (Teacher/Admin/Principal)
- Audit-safe append-only logs
- 15-minute edit window for attendance corrections
- Complete audit trail of all actions

## 👥 User Roles

### Teacher
- Mark attendance for assigned classes
- View student list
- Edit attendance within 15 minutes
- View today's attendance summary

### Admin
- All teacher permissions
- View reports for any class/date
- Generate date range reports
- View analytics and insights
- Manage holidays
- Bulk import students
- Enable/disable WhatsApp alerts

### Principal
- Read-only access to all dashboards
- View school overview
- View attendance reports
- View analytics
- Cannot edit or modify data

## 📝 Google Sheets Schema

### School_Master
| Column | Type | Description |
|--------|------|-------------|
| school_id | Text | Unique school identifier |
| school_name | Text | School name |
| active | Boolean | Is school active |

### Student_Master
| Column | Type | Description |
|--------|------|-------------|
| student_id | Text | Unique student identifier |
| school_id | Text | School ID (FK) |
| name | Text | Student name |
| class | Text | Class name |
| section | Text | Section |
| roll | Number | Roll number |
| parent_mobile | Text | Parent mobile number |
| active | Boolean | Is student active |
| whatsapp_alert_enabled | Boolean | Enable WhatsApp alerts |
| parent_name | Text | Parent name |

### Teacher_Master
| Column | Type | Description |
|--------|------|-------------|
| email | Text | Teacher email (PK) |
| school_id | Text | School ID (FK) |
| name | Text | Teacher name |
| role | Text | teacher/admin/principal |
| class_assigned | Text | Comma-separated classes |
| active | Boolean | Is teacher active |

### Attendance_Log
| Column | Type | Description |
|--------|------|-------------|
| log_id | Text | Unique log identifier |
| student_id | Text | Student ID (FK) |
| school_id | Text | School ID (FK) |
| date | Date | Attendance date |
| status | Text | P/A/L (Present/Absent/Late) |
| type | Text | CHECK_IN/CHECK_OUT |
| time | Time | Attendance time |
| teacher_email | Text | Teacher email (FK) |
| remark | Text | Optional remark |

### Audit_Log
| Column | Type | Description |
|--------|------|-------------|
| timestamp | DateTime | Action timestamp |
| user_email | Text | User who performed action |
| action | Text | Action type |
| details | Text | JSON details |

### WhatsApp_Log
| Column | Type | Description |
|--------|------|-------------|
| timestamp | DateTime | Message timestamp |
| student_id | Text | Student ID (FK) |
| parent_mobile | Text | Parent mobile number |
| status | Text | SUCCESS/FAILED |
| response | Text | API response |

## 🔄 Dual Repository Strategy

For private main repository:

1. **Main Repo (Private)**: Complete codebase
2. **Frontend Repo (Public)**: Only frontend code for free GitHub Pages

**Sync Frontend:**
```bash
./sync-frontend.sh
```

## 🛠️ Development

### Local Testing
1. Open `frontend/index.html` in browser
2. Update API URL in `frontend/js/auth.js`
3. Test locally before deployment

### Adding New Features
1. Make changes in main repository
2. Test thoroughly
3. Sync frontend if needed
4. Deploy

## 📚 Documentation

- **Complete Deployment Guide**: `docs/DEPLOYMENT_STEPS.md`
- **Google Sheets Setup**: `docs/SHEETS_SETUP.md`
- **WhatsApp Setup**: `docs/WHATSAPP_SETUP.md` (optional)

## 🐛 Troubleshooting

### Issue: "Unauthorized" error
- Check if user email is in `Teacher_Master` sheet
- Verify role is correct (teacher/admin/principal)
- Check API URL is correct

### Issue: Data not loading
- Check browser console for errors
- Verify Script Properties are set correctly
- Check Sheet IDs in Script Properties

### Issue: CORS errors
- Ensure `userEmail` parameter is sent in API calls
- Check Apps Script Web App is deployed correctly
- Verify Web App access is set to "Anyone"

### Issue: Attendance not saving
- Check edit window (15 minutes)
- Verify student is active in `Student_Master`
- Check teacher has access to the class

## 📄 License

© ClassLedger by Tarka - Powered by Tarka

## 🤝 Support

For issues and questions:
1. Check `docs/DEPLOYMENT_STEPS.md` for detailed setup
2. Review troubleshooting section above
3. Check browser console for errors

---

**Version**: 2.0  
**Last Updated**: January 2025
