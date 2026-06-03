import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { Modal, Button, Form } from 'react-bootstrap';

const TeamManagement: React.FC = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [formData, setFormData] = useState({
    team_name: '',
    team_code: '',
    team_description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data.teams);
    } catch (error: any) {
      toast.error('Failed to fetch teams');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingTeam) {
        await axios.put(`/api/teams/${editingTeam.id}`, formData);
        toast.success('Team updated successfully');
      } else {
        await axios.post('/api/teams', formData);
        toast.success('Team created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchTeams();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (team: any) => {
    setEditingTeam(team);
    setFormData({
      team_name: team.team_name,
      team_code: team.team_code,
      team_description: team.team_description
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await axios.delete(`/api/teams/${id}`);
        toast.success('Team deleted successfully');
        fetchTeams();
      } catch (error: any) {
        toast.error('Failed to delete team');
      }
    }
  };

  const resetForm = () => {
    setEditingTeam(null);
    setFormData({
      team_name: '',
      team_code: '',
      team_description: ''
    });
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar />
        <div className="col-md-10 main-content">
          <Navbar />
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Team Management</h2>
              <button
                className="btn btn-primary"
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
              >
                Add Team
              </button>
            </div>
            
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Team Name</th>
                        <th>Team Code</th>
                        <th>Description</th>
                        <th>Managers</th>
                        <th>Employees</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map((team) => (
                        <tr key={team.id}>
                          <td>{team.id}</td>
                          <td>{team.team_name}</td>
                          <td><span className="badge bg-secondary">{team.team_code}</span></td>
                          <td>{team.team_description || '-'}</td>
                          <td>{team.managers?.length || 0}</td>
                          <td>{team.employees?.length || 0}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary me-2"
                              onClick={() => handleEdit(team)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(team.id)}
                            >
                              Delete
                            </button>
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

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingTeam ? 'Edit Team' : 'Add Team'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Team Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.team_name}
                onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Team Code</Form.Label>
              <Form.Control
                type="text"
                value={formData.team_code}
                onChange={(e) => setFormData({ ...formData, team_code: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.team_description}
                onChange={(e) => setFormData({ ...formData, team_description: e.target.value })}
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : (editingTeam ? 'Update' : 'Create')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TeamManagement;
