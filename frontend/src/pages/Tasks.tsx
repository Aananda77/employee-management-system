import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Modal, Button, Form, Nav, Tab } from 'react-bootstrap';
import { FaComments, FaHistory, FaEye } from 'react-icons/fa';

const Tasks: React.FC = () => {
  const { user, userData } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    status: 'pending',
    assigned_to: ''
  });
  const [submitData, setSubmitData] = useState({
    notes: ''
  });
  const [commentData, setCommentData] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, userData]);

  const fetchTasks = async () => {
    if (!user || !userData) return;
    try {
      let q;
      if (userData.role === 'admin') {
        q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
      } else if (userData.role === 'manager') {
        q = query(
          collection(db, 'tasks'),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'tasks'),
          where('assignedTo', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
      }
      const querySnapshot = await getDocs(q);
      const tasksList: any[] = [];
      querySnapshot.forEach((doc) => {
        tasksList.push({ id: doc.id, ...doc.data() });
      });
      setTasks(tasksList);
    } catch (error: any) {
      toast.error('Failed to fetch tasks');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const taskData = {
        ...formData,
        assignedBy: user?.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        statusHistory: [],
        comments: []
      };
      
      await addDoc(collection(db, 'tasks'), taskData);
      
      toast.success('Task created successfully');
      setShowModal(false);
      resetForm();
      fetchTasks();
    } catch (error: any) {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setLoading(true);
    
    try {
      const taskRef = doc(db, 'tasks', selectedTask.id);
      const oldStatus = selectedTask.status;
      
      await updateDoc(taskRef, {
        status: 'completed',
        updatedAt: Timestamp.now(),
        statusHistory: [
          ...selectedTask.statusHistory,
          {
            oldStatus,
            newStatus: 'completed',
            changedBy: user?.uid,
            changedAt: Timestamp.now()
          }
        ]
      });
      
      toast.success('Task submitted successfully');
      setShowSubmitModal(false);
      fetchTasks();
    } catch (error: any) {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !commentData.trim()) return;
    
    try {
      const taskRef = doc(db, 'tasks', selectedTask.id);
      const newComment = {
        userId: user?.uid,
        username: userData?.username || user?.email,
        comment: commentData,
        createdAt: Timestamp.now()
      };
      
      await updateDoc(taskRef, {
        comments: [...(selectedTask.comments || []), newComment],
        updatedAt: Timestamp.now()
      });
      
      setCommentData('');
      setSelectedTask({
        ...selectedTask,
        comments: [...(selectedTask.comments || []), newComment]
      });
      
      toast.success('Comment added successfully');
    } catch (error: any) {
      toast.error('Failed to add comment');
    }
  };

  const openTaskDetail = async (task: any) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      deadline: '',
      priority: 'medium',
      status: 'pending',
      assigned_to: ''
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning text-dark';
      case 'in_progress': return 'bg-primary';
      case 'completed': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-info text-dark';
      case 'medium': return 'bg-warning text-dark';
      case 'high': return 'bg-danger';
      case 'urgent': return 'bg-dark';
      default: return 'bg-secondary';
    }
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return '';
    const date = ts instanceof Timestamp ? ts.toDate() : new Date(ts);
    return date.toLocaleString();
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
              {(userData?.role === 'admin' || userData?.role === 'manager') && (
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
                            <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                              {task.status}
                            </span>
                          </td>
                          <td>{task.deadline}</td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => openTaskDetail(task)}
                              >
                                <FaEye className="me-1" /> View
                              </button>
                              {userData?.role === 'employee' && task.status !== 'completed' && (
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
                            </div>
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

      {(userData?.role === 'admin' || userData?.role === 'manager') && (
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

      {userData?.role === 'employee' && (
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

      {selectedTask && (
        <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedTask.title}
              <span className={`badge ${getPriorityBadgeClass(selectedTask.priority)} ms-2`}>
                {selectedTask.priority}
              </span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-4">
              <h5>Description</h5>
              <p>{selectedTask.description || 'No description provided'}</p>
              <div className="d-flex gap-3 mt-3">
                <div><strong>Status:</strong> <span className={`badge ${getStatusBadgeClass(selectedTask.status)}`}>{selectedTask.status}</span></div>
                <div><strong>Deadline:</strong> {selectedTask.deadline}</div>
              </div>
            </div>

            <Tab.Container id="task-tabs" defaultActiveKey="comments">
              <Nav variant="tabs">
                <Nav.Item>
                  <Nav.Link eventKey="comments">
                    <FaComments className="me-1" /> Comments
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="history">
                    <FaHistory className="me-1" /> Status History
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              <Tab.Content className="mt-3">
                <Tab.Pane eventKey="comments">
                  <div className="mb-4">
                    <Form onSubmit={handleAddComment}>
                      <Form.Group className="mb-2">
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="Add a comment..."
                          value={commentData}
                          onChange={(e) => setCommentData(e.target.value)}
                        />
                      </Form.Group>
                      <Button variant="primary" type="submit" size="sm">
                        Add Comment
                      </Button>
                    </Form>
                  </div>
                  <div className="border-top pt-3">
                    {selectedTask.comments?.length === 0 ? (
                      <p className="text-muted">No comments yet</p>
                    ) : (
                      selectedTask.comments?.map((comment: any, index: number) => (
                        <div key={index} className="mb-3 pb-3 border-bottom">
                          <div className="d-flex justify-content-between align-items-start">
                            <strong>{comment.username}</strong>
                            <small className="text-muted">{formatTimestamp(comment.createdAt)}</small>
                          </div>
                          <p className="mb-0 mt-1">{comment.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="history">
                  {selectedTask.statusHistory?.length === 0 ? (
                    <p className="text-muted">No status changes yet</p>
                  ) : (
                    <div className="timeline">
                      {selectedTask.statusHistory?.map((item: any, index: number) => (
                        <div key={index} className="mb-3 pb-3 border-bottom">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <strong>
                                {item.oldStatus ? `${item.oldStatus} → ` : ''}
                                {item.newStatus}
                              </strong>
                            </div>
                            <small className="text-muted">{formatTimestamp(item.changedAt)}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default Tasks;
