import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaUser, FaBell } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const { user, profile } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm mb-4">
      <div className="container-fluid">
        <button className="navbar-toggler" type="button">
          <FaBars />
        </button>
        
        <div className="d-flex ms-auto align-items-center">
          <div className="me-3">
            <button className="btn btn-light position-relative">
              <FaBell />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                0
              </span>
            </button>
          </div>
          <div className="d-flex align-items-center">
            <div className="me-2">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                <FaUser />
              </div>
            </div>
            <div>
              <p className="mb-0 fw-bold">{profile?.full_name || user?.username}</p>
              <small className="text-muted text-capitalize">{user?.role}</small>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
