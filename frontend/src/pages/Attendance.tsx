import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Modal, Button, Form } from 'react-bootstrap';

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttendance();
    if (user?.role === 'admin' || user?.role === 'manager') {
      fetchUsers();
    }
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get('/api/attendance');
      setAttendance(response.data.attendance);
    } catch (error: any) {
      toast.error('Failed to fetch attendance');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data.users);
    } catch (error: any) {
      toast.error('Failed to fetch users');
    }
  };

  const handleMarkAttendance = async (status: string) => {
    setLoading(true);
    try {
      await axios.post('/api/attendance', {
        user_id: user?.id,
        date: new Date().toISOString().split('T')[0],
        status
      });
      toast.success('Attendance marked successfully');
      fetchAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('/api/attendance', formData);
      toast.success('Attendance marked successfully');
      setShowModal(false);
      fetchAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar />
        <div className="col-md-10 main-content">
          <Navbar />
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Attendance</h2>
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowModal(true)}
                >
                  Mark Attendance
                </button>
              )}
            </div>
            
            {user?.role === 'employee' && (
              <div className="card mb-4">
                <div className="card-body text-center">
                  <h5>Mark Today's Attendance</h5>
                  <div className="mt-3">
                    <button
                      className="btn btn-success me-3"
                      onClick={() => handleMarkAttendance('present')}
                      disabled={loading}
                    >
                      Present
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleMarkAttendance('absent')}
                      disabled={loading}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>User</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((record) => (
                        <tr key={record.id}>
                          <td>{record.date}</td>
                          <td>{record.full_name || record.username}</td>
                          <td>
                            <span className={`status-badge status-${record.status}`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {(user?.role === 'admin' || user?.role === 'manager') && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Mark Attendance</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>User</Form.Label>
                <Form.Select
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  required
                >
                  <option value="">Select User</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || u.username}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </Form.Select>
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Mark Attendance'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default Attendance;
