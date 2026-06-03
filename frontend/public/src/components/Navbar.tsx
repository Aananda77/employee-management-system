import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaUser, FaBell, FaKey } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const { user, userData, profile, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task': return '📋';
      case 'leave': return '🏖️';
      case 'deadline': return '⏰';
      case 'announcement': return '📢';
      default: return '📄';
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm mb-4">
      <div className="container-fluid">
        <button className="navbar-toggler" type="button">
          <FaBars />
        </button>
        
        <div className="d-flex ms-auto align-items-center">
          <div className="me-3" ref={notificationRef}>
            <button 
              className="btn btn-light position-relative"
              onClick={toggleNotifications}
            >
              <FaBell />
              {/* TODO: Add unread count later */}
            </button>
          </div>
          <div className="d-flex align-items-center" ref={userDropdownRef}>
            <button 
              className="btn btn-light d-flex align-items-center"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <div className="me-2">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                  <FaUser />
                </div>
              </div>
              <div>
                <p className="mb-0 fw-bold">{profile?.fullName || userData?.username || user?.email}</p>
                <small className="text-muted text-capitalize">{userData?.role}</small>
              </div>
            </button>

            {showUserDropdown && (
              <div className="dropdown-menu dropdown-menu-end show shadow-lg" style={{ position: 'absolute', right: 0, zIndex: 1050 }}>
                <button 
                  className="dropdown-item d-flex align-items-center"
                  onClick={() => {
                    setShowUserDropdown(false);
                  }}
                >
                  <FaKey className="me-2" />
                  Change Password
                </button>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item d-flex align-items-center text-danger"
                  onClick={() => {
                    logout();
                    setShowUserDropdown(false);
                  }}
                >
                  <FaUser className="me-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
