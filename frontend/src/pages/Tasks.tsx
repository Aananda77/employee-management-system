import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Modal, Button, Form } from 'react-bootstrap';

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    status: 'pending',
    assigned_to: '',
    assigned_to_role: 'employee',
    team_id: ''
  });
  const [submitData, setSubmitData] = useState({
    notes: ''
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'admin' || user?.role === 'manager') {
      fetchTeams();
      fetchUsers();
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data.tasks);
    } catch (error: any) {
      toast.error('Failed to fetch tasks');
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data.teams);
    } catch (error: any) {
      toast.error('Failed to fetch teams');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });
      if (attachment) {
        form.append('attachment', attachment);
      }
      
      await axios.post('/api/tasks', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Task created successfully');
      setShowModal(false);
      resetForm();
      fetchTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setLoading(true);
    
    try {
      const form = new FormData();
      form.append('notes', submitData.notes);
      if (submissionFile) {
        form.append('submission_file', submissionFile);
      }
      
      await axios.post(`/api/tasks/${selectedTask.id}/submit`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Task submitted successfully');
      setShowSubmitModal(false);
      fetchTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      deadline: '',
      priority: 'medium',
      status: 'pending',
      assigned_to: '',
      assigned_to_role: 'employee',
      team_id: ''
    });
    setAttachment(null);
  };

  const getBaseRoute = () => {
    return user?.role === 'admin' ? '/admin' : user?.role === 'manager' ? '/manager' : '/employee';
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar />
        <div className="col-md-10 main-content">
          <Navbar />
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Tasks</h2>
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowModal(true)}
                >
                  Add Task
                </button>
              )}
            </div>
            
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Deadline</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.id}>
                          <td>{task.title}</td>
                          <td>
                            <span className={`status-badge priority-${task.priority}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge status-${task.status}`}>
                              {task.status}
                            </span>
                          </td>
                          <td>{task.deadline}</td>
                          <td>
                            {user?.role === 'employee' && task.status !== 'completed' && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowSubmitModal(true);
                                }}
                              >
                                Submit
                              </button>
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

      {(user?.role === 'admin' || user?.role === 'manager') && (
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Add Task</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Form.Group>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Deadline</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      required
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Priority</Form.Label>
                    <Form.Select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>
              <Form.Group className="mb-3">
                <Form.Label>Attachment</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => setAttachment((e.target as HTMLInputElement).files?.[0] || null)}
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}

      {user?.role === 'employee' && (
        <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Submit Task</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleTaskSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={submitData.notes}
                  onChange={(e) => setSubmitData({ ...submitData, notes: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>File</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => setSubmissionFile((e.target as HTMLInputElement).files?.[0] || null)}
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => setShowSubmitModal(false)} className="me-2">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default Tasks;
