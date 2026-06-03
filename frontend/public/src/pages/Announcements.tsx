import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Modal, Button, Form } from 'react-bootstrap';

const Announcements: React.FC = () => {
  const { userData } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    visibility: 'all',
    teamId: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
    if (userData?.role === 'admin' || userData?.role === 'manager') {
      fetchTeams();
    }
  }, [userData?.role]);

  const fetchAnnouncements = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'announcements'));
      const announcementsList: any[] = [];
      querySnapshot.forEach(doc => announcementsList.push({ id: doc.id, ...doc.data() }));
      setAnnouncements(announcementsList.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
    } catch (error) {
      toast.error('Failed to fetch announcements');
    }
  };

  const fetchTeams = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'teams'));
      const teamsList: any[] = [];
      querySnapshot.forEach(doc => teamsList.push({ id: doc.id, ...doc.data() }));
      setTeams(teamsList);
    } catch (error) {
      toast.error('Failed to fetch teams');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addDoc(collection(db, 'announcements'), {
        ...formData,
        createdAt: Timestamp.now(),
        createdBy: userData?.username
      });
      toast.success('Announcement created successfully');
      setShowModal(false);
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to create announcement');
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
              <h2>Announcements</h2>
              {(userData?.role === 'admin' || userData?.role === 'manager') && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowModal(true)}
                >
                  Create Announcement
                </button>
              )}
            </div>
            
            <div className="row">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="col-md-12 mb-3">
                  <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">{announcement.title}</h5>
                      <small className="text-muted">
                        {announcement.createdAt?.toDate().toLocaleDateString()}
                      </small>
                    </div>
                    <div className="card-body">
                      <p className="card-text">{announcement.content}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="badge bg-secondary me-2">
                            {announcement.visibility}
                          </span>
                          {announcement.teamId && (
                            <span className="badge bg-info">
                              {teams.find(t => t.id === announcement.teamId)?.teamName}
                            </span>
                          )}
                        </div>
                        <small className="text-muted">
                          By: {announcement.createdBy}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {(userData?.role === 'admin' || userData?.role === 'manager') && (
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Create Announcement</Modal.Title>
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
                <Form.Label>Content</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Visibility</Form.Label>
                <Form.Select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                >
                  <option value="all">All Users</option>
                  <option value="team">Specific Team</option>
                  <option value="managers">Managers Only</option>
                  <option value="employees">Employees Only</option>
                </Form.Select>
              </Form.Group>
              {formData.visibility === 'team' && (
                <Form.Group className="mb-3">
                  <Form.Label>Team</Form.Label>
                  <Form.Select
                    value={formData.teamId}
                    onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                    required
                  >
                    <option value="">Select Team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.teamName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Announcement'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default Announcements;
