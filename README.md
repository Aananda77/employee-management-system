# Employee Management System

A professional full-stack A3-level Employee Management System built with React.js, Node.js + Express.js, and MySQL.

## Features

### Authentication
- JWT Authentication
- Secure login/register
- Password hashing using bcrypt
- Role-based protected routes
- Session management

### Roles
1. **Admin**: Full system access
2. **Manager**: Team management
3. **Employee**: Individual access

### Admin Features
- Team Management (Create/Edit/Delete)
- Employee & Manager Control
- Task Management
- Leave Management
- Notice & Announcement System
- Attendance Monitoring
- Dashboard with Analytics

### Manager Features
- Profile Setup
- Team Details
- Task Assignment
- Attendance Management
- Leave Request
- Team Announcements

### Employee Features
- Profile Setup
- Personal Dashboard
- Task Management
- Attendance
- Leave Request

## Tech Stack

### Frontend
- React.js (TypeScript)
- React Router DOM
- Axios
- Context API
- React Bootstrap
- React Icons
- React Hot Toast
- Recharts

### Backend
- Node.js
- Express.js
- MySQL
- JWT
- bcryptjs
- multer
- cors

## Installation & Setup

### Prerequisites
- Node.js
- MySQL
- npm or yarn

### Database Setup
1. Create a MySQL database
2. Import the database schema from `backend/database.sql`

### Backend Setup
1. Navigate to backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file with your database credentials and JWT secret
4. Start the server: `node server.js` or `npm start`

### Frontend Setup
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## Project Structure

```
employee-management-system/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── teamController.js
│   │   ├── userController.js
│   │   ├── taskController.js
│   │   ├── attendanceController.js
│   │   ├── leaveController.js
│   │   ├── announcementController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── teamRoutes.js
│   │   ├── userRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── leaveRoutes.js
│   │   ├── announcementRoutes.js
│   │   └── dashboardRoutes.js
│   ├── uploads/
│   ├── database.sql
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.tsx
    │   │   └── Navbar.tsx
    │   ├── context/
    │   │   └── AuthContext.tsx
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.tsx
    │   │   │   ├── TeamManagement.tsx
    │   │   │   └── UserManagement.tsx
    │   │   ├── manager/
    │   │   │   └── ManagerDashboard.tsx
    │   │   ├── employee/
    │   │   │   └── EmployeeDashboard.tsx
    │   │   ├── Login.tsx
    │   │   ├── Register.tsx
    │   │   ├── ProfileSetup.tsx
    │   │   ├── Tasks.tsx
    │   │   ├── Attendance.tsx
    │   │   ├── Leaves.tsx
    │   │   └── Announcements.tsx
    │   ├── App.tsx
    │   ├── index.tsx
    │   └── index.css
    └── package.json
```

## Default Credentials

To get started, you'll need to register an admin account first through the registration page.

## Usage

1. Register as an admin
2. Create at least one team
3. Add managers and employees
4. Assign users to teams
5. Start managing tasks, attendance, and leaves!
