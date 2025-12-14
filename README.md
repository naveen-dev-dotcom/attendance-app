# Attendance Management System 📊

A full-stack Attendance Management System built to handle real-world college attendance workflows with a strong focus on data integrity, role-based access, and auditability.

This application is actively used by college staff in real time (unofficially) to mark and manage student attendance more reliably than manual or spreadsheet-based methods.

---

## 🎯 Problem Statement

Traditional attendance methods are error-prone, easy to manipulate, and difficult to audit.  
This system solves that by providing a controlled, staff-only platform where attendance is:

- Marked once per day per student
- Protected from duplicate or invalid entries
- Fully traceable with admin-level audit logs

---

## 🚀 Key Features

- Staff-only authentication system (JWT-based)
- Class-wise and date-wise attendance marking
- Prevents duplicate attendance entries using date validation
- OD (On Duty) handling:
  - Automatically counts as **present**
  - Disables Present/Absent options to avoid conflicts
- 24-hour controlled edit window for attendance updates
- Student-wise attendance reports
- Attendance summaries with accurate statistics
- Admin attribution and audit trail for every action
- Clean workflow:
  - Class Selection → Attendance Marking → Summary → Student Reports

---

## 👥 Users & Access Control

- **Users:** College Staff only  
- **Permissions:**
  - Staff can mark, edit (within time window), and view attendance
  - All actions are logged with admin identity
- Students do not have direct access to the system

---

## 🛠️ Tech Stack (MERN)

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT-based authentication
- **Architecture:** RESTful APIs
- **Deployment:** Netlify (Frontend) + Backend deployed separately

---

## 🧠 System Design Highlights

- MongoDB schema designed to handle:
  - Students
  - Classes
  - Attendance sessions
  - Daily attendance records
  - Audit logs
- Nested attendance arrays with indexing for performance
- Date-based validation to prevent multiple entries per day
- Timestamp comparisons to enforce a strict 24-hour edit window
- Clear separation of concerns between frontend, backend, and database layers

---

## 🔐 Security & Audit Trail

- JWT-protected routes for all staff operations
- Every attendance action is logged with:
  - Admin identity
  - Before/after data snapshots
  - Timestamp
- Ensures accountability and traceability in an academic environment

---

## 📸 Demo & Screenshots

- **Live App:** https://navattendance.netlify.app/
- **Demo Video (LinkedIn):**  
  https://www.linkedin.com/posts/naveen-fullstackdeveloper_webdevelopment-react-nodejs-activity-7358845226695712769-71wh

<img width="1090" height="592" alt="attendanceapp" src="https://github.com/user-attachments/assets/3f883dc4-1ca9-4ac4-be85-f1ff13507ff7" />


---

## 🌐 Code Repository

- **GitHub:** https://github.com/naveen-dev-dotcom/attendance-app

---

## 📚 What I Learned

- Designing backend validation to prevent real-world data inconsistencies
- Implementing date-based logic and time-window restrictions in MongoDB
- Managing complex frontend state for conditional attendance logic (Present / Absent / OD)
- Structuring scalable MongoDB schemas with multiple related collections
- Building systems that prioritize auditability and data integrity over shortcuts

---

## 🧩 Challenges Faced

- Preventing duplicate attendance entries across the same day
- Designing OD logic that remains statistically correct while simplifying UX
- Managing complex relationships between students, classes, sessions, and logs
- Balancing feature richness with a clean, usable interface for staff

---

## 👤 Author & Ownership

**Naveen (Nav)**  
Full Stack Developer (MERN)  
Computer Science & Engineering Student  

- Built entirely as a **one-man project**
- Designed, developed, deployed, and maintained independently
- Currently used by college staff in real-time
