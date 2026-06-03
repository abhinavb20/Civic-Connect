# Civic Connect

A Full-Stack Civic Complaint Management System

Streamlining communication between citizens and local authorities through a centralized digital platform for reporting, tracking, and resolving civic issues. Built with the MERN Stack.

---

## 📌 Overview

Civic Connect is a role-based web application that enables citizens to report public issues such as road damage, waste management problems, water supply disruptions, and electricity failures. The platform provides a transparent workflow where complaints are assigned, monitored, and resolved by authorized officials.

The system organizes complaints using a hierarchical location structure:

District → Panchayath → Ward

This ensures accurate complaint routing, accountability, and efficient issue resolution.

---

## ✨ Features

### 🔐 Authentication & Authorization

• Secure user authentication
• Role-Based Access Control (RBAC)
• Separate access for Citizens, Authorities, and Administrators
• Protected routes and permission-based operations

### 📢 Complaint Management

• Submit complaints with descriptions and images
• Categorize complaints by department
• Location-based complaint routing
• Complaint history tracking
• Community complaint visibility

### 🏛️ Administrative Management

• Manage Districts
• Manage Panchayaths
• Manage Wards
• Manage Departments
• Manage Authorities
• Monitor all complaints
• Generate reports

### 👮 Authority Dashboard

• View assigned complaints
• Analyze complaint details
• Update complaint status
• Reply to complaints
• Monitor pending and resolved cases

### 👤 Citizen Portal

• Register and login
• Maintain profile
• Raise complaints
• Track complaint progress
• View community issues

### 📁 File Upload Support

• Upload complaint images
• Evidence-based issue reporting
• Secure file handling

### 📊 Reporting & Analytics

• Dashboard statistics
• Complaint status tracking
• Location-wise reports
• Resolution monitoring

---

## 👥 User Roles

### 👤 Citizen
Access Level: Standard

Capabilities:
• Register and login
• Manage profile
• Submit complaints with images
• Track complaint status
• View complaint history

### 👮 Authority
Access Level: Elevated

Capabilities:
• View assigned complaints
• Update complaint status
• Reply to complaints
• Manage issue resolution

### 🛠️ Admin
Access Level: Full Control

Capabilities:
• Manage districts, panchayaths, and wards
• Manage departments
• Manage authorities
• Monitor complaints
• Generate reports
• Maintain system hierarchy

---

## 🛠️ Tech Stack

### Frontend

• React.js
• React Router
• Axios
• Material UI
• React Icons
• GSAP
• CSS Modules

### Backend

• Node.js
• Express.js
• MongoDB
• Mongoose
• Multer
• CORS

---

## 📂 Project Structure

CivicPro/
│
├── Client/
│   ├── src/
│   │   ├── Admin/
│   │   ├── Authority/
│   │   ├── Guest/
│   │   ├── User/
│   │   ├── Routes/
│   │   └── main.jsx
│   │
│   ├── public/
│   └── package.json
│
├── Server/
│   ├── Models/
│   ├── Routes/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Uploads/
│   └── package.json
│
└── README.md

---

## 🚀 Getting Started

### Prerequisites

• Node.js (v18 or above)
• MongoDB Atlas or Local MongoDB
• npm

### Clone the Repository

git clone https://github.com/YOUR_USERNAME/CivicPro.git

cd CivicPro

### Backend Setup

cd Server

npm install

Create a .env file:

PORT=5000

MONGODB_URI=your_mongodb_connection_string

CLIENT_URL=http://localhost:5173

Start Backend:

npm start

or

nodemon server.js

### Frontend Setup

cd ../Client

npm install

npm run dev

Frontend URL:
http://localhost:5173

Backend URL:
http://localhost:5000

---

## ▶️ Usage

### Citizen Workflow

Register Account
      ↓
Login
      ↓
Complete Profile
      ↓
Submit Complaint
      ↓
Upload Evidence
      ↓
Track Complaint Status
      ↓
Receive Resolution Updates

### Authority Workflow

Login
      ↓
View Assigned Complaints
      ↓
Analyze Complaint
      ↓
Update Status
      ↓
Reply to Citizen
      ↓
Resolve Issue

### Admin Workflow

Login
      ↓
Manage Locations
      ↓
Manage Departments
      ↓
Manage Authorities
      ↓
Monitor Complaints
      ↓
Generate Reports

---

## 📜 Available Scripts

Frontend

npm run dev
Runs the Vite development server.

npm run build
Creates a production build.

Backend

npm start
Starts the Express server.

nodemon server.js
Starts the server with auto-reload.

---

## 🗄️ Database Collections

• admins
• users
• authorities
• districts
• panchayaths
• wards
• departments
• complaints
• complaint_replies
• complaint_supports

---

## 🔒 Security Features

• Role-Based Access Control (RBAC)
• Protected Routes
• Input Validation
• Secure File Upload Handling
• Database Validation
• Complaint Ownership Verification
• Authentication & Authorization

---

## 🛣️ Roadmap

Future Enhancements:

• Mobile Application Support
• Geo-Tagging & Map Integration
• Email Notifications
• SMS Notifications
• Real-Time Updates
• AI-Based Complaint Prioritization
• Advanced Analytics Dashboard
• Cloud Deployment
• Two-Factor Authentication (2FA)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

How to Contribute:

1. Fork the repository

2. Clone your fork

git clone https://github.com/YOUR_USERNAME/CivicPro.git

3. Create a feature branch

git checkout -b feature/YourFeatureName

4. Commit your changes

git commit -m "feat: add YourFeatureName"

5. Push to your branch

git push origin feature/YourFeatureName

6. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

You are free to use, modify, and distribute the project with proper attribution.

---

## 👨‍💻 Author

Abhinav B

Full Stack Developer

---

## ⭐ Acknowledgements

• React.js
• Node.js
• Express.js
• MongoDB
• Mongoose
• Material UI
• Axios
• GSAP

---

If Civic Connect helped you, consider giving the repository a ⭐.

Transforming Communities Through Digital Governance.
