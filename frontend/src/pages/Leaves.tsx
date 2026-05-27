import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Modal, Button, Form } from 'react-bootstrap';

const Leaves: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    leave_type: '',
    start_date: '',
    end_date: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await axios.get('/api/leaves');
      setLeaves(response.data.leaveRequests);
    } catch (error: any) {
      toast.error('Failed to fetch leave requests');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('/api/leaves', formData);
      toast.success('Leave request submitted successfully');
      setShowModal(false);
      fetchLeaves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: number, status: string) => {
    try {
      await axios.put(`/api/leaves/${id}`, { status });
      toast.success(`Leave ${status} successfully`);
      fetchLeaves();
    } catch (error: any) {
      toast.error('Failed to update leave request');
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
              <h2>Leave Requests</h2>
              {user?.role !== 'admin' && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowModal(true)}
                >
                  Request Leave
                </button>
              )}
            </div>
            
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.map((leave) => (
                        <tr key={leave.id}>
                          <td>{leave.full_name || leave.username}</td>
                          <td>{leave.leave_type}</td>
                          <td>{leave.start_date}</td>
                          <td>{leave.end_date}</td>
                          <td>
                            <span className={`status-badge status-${leave.status}`}>
                              {leave.status}
                            </span>
                          </td>
                          <td>
                            {(user?.role === 'admin' || user?.role === 'manager') && leave.status === 'pending' && (
                              <>
                                <button
                                  className="btn btn-sm btn-success me-2"
                                  onClick={() => handleReview(leave.id, 'approved')}
                                >
                                  Approve
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleReview(leave.id, 'rejected')}
                                >
                                  Reject
                                </button>
                              </>
                            )}
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

      {user?.role !== 'admin' && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Request Leave</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Leave Type</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.leave_type}
                  onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                  placeholder="e.g., Sick Leave, Vacation"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Reason</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
              </Form.Group>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default Leaves;
