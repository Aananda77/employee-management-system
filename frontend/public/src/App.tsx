import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import TeamManagement from './pages/admin/TeamManagement';
import UserManagement from './pages/admin/UserManagement';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import ProfileSetup from './pages/ProfileSetup';
import Tasks from './pages/Tasks';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Announcements from './pages/Announcements';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, userData, loading, profileComplete } = useAuth();

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border" role="status"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && userData && !roles.includes(userData.role)) {
    return <Navigate to="/" replace />;
  }

  if (userData && userData.role !== 'admin' && !profileComplete) {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border" role="status"></div></div>;
  }

  if (user && userData) {
    if (userData.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userData.role === 'manager') {
      return <Navigate to="/manager/dashboard" replace />;
    } else {
      return <Navigate to="/employee/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user, userData } = useAuth();

  return (
    <div className="App">
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        
        <Route path="/profile-setup" element={
          <ProtectedRoute roles={['manager', 'employee']}>
            <ProfileSetup />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/departments" element={
          <ProtectedRoute roles={['admin']}>
            <DepartmentManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/teams" element={
          <ProtectedRoute roles={['admin']}>
            <TeamManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/tasks" element={
          <ProtectedRoute roles={['admin']}>
            <Tasks />
          </ProtectedRoute>
        } />
        <Route path="/admin/attendance" element={
          <ProtectedRoute roles={['admin']}>
            <Attendance />
          </ProtectedRoute>
        } />
        <Route path="/admin/leaves" element={
          <ProtectedRoute roles={['admin']}>
            <Leaves />
          </ProtectedRoute>
        } />
        <Route path="/admin/announcements" element={
          <ProtectedRoute roles={['admin']}>
            <Announcements />
          </ProtectedRoute>
        } />
        
        <Route path="/manager/dashboard" element={
          <ProtectedRoute roles={['manager']}>
            <ManagerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/manager/tasks" element={
          <ProtectedRoute roles={['manager']}>
            <Tasks />
          </ProtectedRoute>
        } />
        <Route path="/manager/attendance" element={
          <ProtectedRoute roles={['manager']}>
            <Attendance />
          </ProtectedRoute>
        } />
        <Route path="/manager/leaves" element={
          <ProtectedRoute roles={['manager']}>
            <Leaves />
          </ProtectedRoute>
        } />
        <Route path="/manager/announcements" element={
          <ProtectedRoute roles={['manager']}>
            <Announcements />
          </ProtectedRoute>
        } />
        
        <Route path="/employee/dashboard" element={
          <ProtectedRoute roles={['employee']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        } />
        <Route path="/employee/tasks" element={
          <ProtectedRoute roles={['employee']}>
            <Tasks />
          </ProtectedRoute>
        } />
        <Route path="/employee/attendance" element={
          <ProtectedRoute roles={['employee']}>
            <Attendance />
          </ProtectedRoute>
        } />
        <Route path="/employee/leaves" element={
          <ProtectedRoute roles={['employee']}>
            <Leaves />
          </ProtectedRoute>
        } />
        <Route path="/employee/announcements" element={
          <ProtectedRoute roles={['employee']}>
            <Announcements />
          </ProtectedRoute>
        } />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
