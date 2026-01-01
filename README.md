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
│   └── js/
│       ├── auth.js             # Authentication logic
│       ├── teacher.js         # Teacher dashboard logic
│       ├── admin.js            # Admin dashboard logic
│       └── principal.js        # Principal dashboard logic
├── docs/
│   ├── SHEETS_SETUP.md         # Google Sheets schema guide
│   ├── DEPLOYMENT.md           # Deployment instructions
│   ├── DEPLOYMENT_STEPS.md     # Complete step-by-step deployment guide
│   ├── QUICK_REFERENCE.md      # Quick reference card
│   └── WHATSAPP_SETUP.md       # WhatsApp setup guide
└── README.md                   # This file
```

## 🚀 Quick Start

1. **Setup Google Sheets** - Follow `docs/SHEETS_SETUP.md`
2. **Deploy Apps Script** - Follow `docs/DEPLOYMENT.md`
3. **Configure Script Properties** - Set Sheet IDs in Apps Script
4. **Setup WhatsApp Alerts (Optional)** - Follow `docs/WHATSAPP_SETUP.md`
5. **Access Application** - Use the Web App URL

## 🔐 Security Features

- Google OAuth authentication
- Whitelist-based access control
- Role-based permissions (Teacher/Admin/Principal)
- Audit-safe append-only logs
- 15-minute edit window for attendance corrections

## 📊 Features

- Multi-school support
- Real-time attendance tracking
- Automatic late detection (after 09:15)
- Daily/weekly/monthly reports
- Google Drive auto-export
- Looker Studio ready data views
- **WhatsApp alerts for absent students** (Hindi messages via Meta Cloud API)

## 📝 License

© ClassLedger by Tarka - Powered by Tarka

