import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProfileSetup: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    gender: '',
    address: '',
    about: '',
    team_id: ''
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
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
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });
      if (profilePhoto) {
        form.append('profile_photo', profilePhoto);
      }
      
      await updateProfile(form);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg" style={{ width: '100%', maxWidth: '600px' }}>
        <div className="card-body p-5">
          <h3 className="text-center mb-4">Complete Your Profile</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-control"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Address</label>
              <textarea
                className="form-control"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              ></textarea>
            </div>
            
            <div className="mb-3">
              <label className="form-label">About</label>
              <textarea
                className="form-control"
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              ></textarea>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Team</label>
              <select
                className="form-select"
                value={formData.team_id}
                onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                required
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.team_name} ({team.team_code})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="form-label">Profile Photo</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
              />
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
