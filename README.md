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
│   ├── WHATSAPP_SETUP.md       # WhatsApp alerts setup
│   ├── DEMO_DATA_GUIDE.md      # Demo data generation guide
│   ├── DUAL_REPO_STRATEGY.md   # Dual repository strategy
│   ├── FRONTEND_REPO_SETUP.md  # Frontend repo setup guide
│   ├── GITHUB_PAGES_DEPLOYMENT.md # GitHub Pages guide
│   ├── PRIVATE_REPO_HOSTING.md # Private repo hosting options
│   └── IMPROVEMENTS_AND_FUTURE.md # Future roadmap
├── sync-frontend.sh            # Frontend sync script
├── netlify.toml                # Netlify configuration
├── deploy-surge.sh             # Surge.sh deployment script
└── README.md                   # This file
```

## 🚀 Quick Start

1. **Setup Google Sheets** - Follow `docs/SHEETS_SETUP.md` or use automated setup in `ClassLedger_Setup/`
2. **Deploy Apps Script** - Follow `docs/DEPLOYMENT_STEPS.md`
3. **Configure Script Properties** - Set Sheet IDs in Apps Script
4. **Setup WhatsApp Alerts (Optional)** - Follow `docs/WHATSAPP_SETUP.md`
5. **Deploy Frontend** - Choose from:
   - GitHub Pages (public repo) - See `docs/FRONTEND_REPO_SETUP.md`
   - Netlify/Cloudflare (private repo) - See `docs/PRIVATE_REPO_HOSTING.md`
6. **Access Application** - Use the deployed frontend URL

## 🔐 Security Features

- Google OAuth authentication
- Whitelist-based access control
- Role-based permissions (Teacher/Admin/Principal)
- Audit-safe append-only logs
- 15-minute edit window for attendance corrections

## 📊 Features

### Core Features
- Multi-school support
- Real-time attendance tracking
- Automatic late detection (after 09:15)
- Role-based dashboards (Teacher/Admin/Principal)
- Audit-safe append-only logs

### Version 2.0 Features
- **Real-time Updates** - Auto-refresh functionality
- **Advanced Reporting** - Charts, PDF export, custom date ranges
- **Analytics & Insights** - Trend analysis, anomaly detection, performance metrics
- **Holiday Calendar** - Manage holidays and exclude from reports
- **Bulk Operations** - Import students, bulk attendance marking
- **WhatsApp Alerts** - Absent student notifications (Hindi messages via Meta Cloud API)

### Quick Wins
- Toast notifications
- Keyboard shortcuts
- Loading indicators
- Export utilities (CSV, JSON, PDF)
- Cache management

## 📝 License

© ClassLedger by Tarka - Powered by Tarka

