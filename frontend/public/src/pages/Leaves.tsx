import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Modal, Button, Form } from 'react-bootstrap';

const Leaves: React.FC = () => {
  const { user, userData } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    leaveType: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaves();
    fetchUsers();
  }, []);

  const fetchLeaves = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'leaves'));
      const leavesList: any[] = [];
      querySnapshot.forEach(doc => leavesList.push({ id: doc.id, ...doc.data() }));
      setLeaves(leavesList.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
    } catch (error) {
      toast.error('Failed to fetch leave requests');
    }
  };

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList: any[] = [];
      querySnapshot.forEach(doc => usersList.push({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addDoc(collection(db, 'leaves'), {
        ...formData,
        userId: user?.uid,
        username: userData?.username,
        status: 'pending',
        createdAt: Timestamp.now()
      });
      toast.success('Leave request submitted successfully');
      setShowModal(false);
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, status: string) => {
    try {
      const leaveDoc = doc(db, 'leaves', id);
      await updateDoc(leaveDoc, { status, reviewedAt: Timestamp.now() });
      toast.success(`Leave ${status} successfully`);
      fetchLeaves();
    } catch (error) {
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
              {userData?.role !== 'admin' && (
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
                          <td>{leave.username}</td>
                          <td>
                            {(() => {
                              switch (leave.leaveType) {
                                case 'sick': return 'Sick Leave';
                                case 'casual': return 'Casual Leave';
                                case 'annual': return 'Annual Leave';
                                case 'wfh': return 'Work From Home';
                                default: return leave.leaveType || 'Other';
                              }
                            })()}
                          </td>
                          <td>{leave.startDate}</td>
                          <td>{leave.endDate}</td>
                          <td>
                            <span className={`status-badge status-${leave.status}`}>
                              {leave.status}
                            </span>
                          </td>
                          <td>
                            {(userData?.role === 'admin' || userData?.role === 'manager') && leave.status === 'pending' && (
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

      {userData?.role !== 'admin' && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Request Leave</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Leave Type</Form.Label>
                <Form.Select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  required
                >
                  <option value="">Select Leave Type</option>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="annual">Annual Leave</option>
                  <option value="wfh">Work From Home</option>
                  <option value="other">Other</option>
                </Form.Select>
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
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
