import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, FaBuilding, FaUsers, FaTasks, FaCalendarCheck, FaFileAlt, FaBell, 
  FaUsersCog, FaUserPlus, FaSignOutAlt 
} from 'react-icons/fa';

const Sidebar: React.FC = () => {
  const { userData, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const adminLinks = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <FaHome /> },
    { path: '/admin/departments', name: 'Departments', icon: <FaBuilding /> },
    { path: '/admin/teams', name: 'Teams', icon: <FaUsersCog /> },
    { path: '/admin/users', name: 'Users', icon: <FaUserPlus /> },
    { path: '/admin/tasks', name: 'Tasks', icon: <FaTasks /> },
    { path: '/admin/attendance', name: 'Attendance', icon: <FaCalendarCheck /> },
    { path: '/admin/leaves', name: 'Leaves', icon: <FaFileAlt /> },
    { path: '/admin/announcements', name: 'Announcements', icon: <FaBell /> }
  ];

  const managerLinks = [
    { path: '/manager/dashboard', name: 'Dashboard', icon: <FaHome /> },
    { path: '/manager/tasks', name: 'Tasks', icon: <FaTasks /> },
    { path: '/manager/attendance', name: 'Attendance', icon: <FaCalendarCheck /> },
    { path: '/manager/leaves', name: 'Leaves', icon: <FaFileAlt /> },
    { path: '/manager/announcements', name: 'Announcements', icon: <FaBell /> }
  ];

  const employeeLinks = [
    { path: '/employee/dashboard', name: 'Dashboard', icon: <FaHome /> },
    { path: '/employee/tasks', name: 'Tasks', icon: <FaTasks /> },
    { path: '/employee/attendance', name: 'Attendance', icon: <FaCalendarCheck /> },
    { path: '/employee/leaves', name: 'Leaves', icon: <FaFileAlt /> },
    { path: '/employee/announcements', name: 'Announcements', icon: <FaBell /> }
  ];

  const links = userData?.role === 'admin' ? adminLinks : 
                userData?.role === 'manager' ? managerLinks : employeeLinks;

  return (
    <div className="sidebar col-md-2 d-none d-md-block p-0">
      <div className="p-3 text-center border-bottom border-secondary">
        <h5 className="mb-0">EMS</h5>
        <small className="text-muted">Employee Management System</small>
      </div>
      
      <div className="p-3 border-bottom border-secondary">
        <p className="mb-0 text-capitalize">{userData?.role}</p>
        <small className="text-muted">{userData?.username}</small>
      </div>

      <nav className="p-2">
        {links.map((link) => (
          <Link 
            key={link.path} 
            to={link.path} 
            className={isActive(link.path) ? 'active' : ''}
          >
            <span className="me-2">{link.icon}</span>
            {link.name}
          </Link>
        ))}
        <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} className="mt-4">
          <span className="me-2"><FaSignOutAlt /></span>
          Logout
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
