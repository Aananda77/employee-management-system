import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';

const ProfileSetup: React.FC = () => {
  const { userData, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    gender: '',
    address: '',
    about: '',
    teamId: '',
    departmentId: '',
    managerId: '',
    designation: '',
    joiningDate: '',
    salaryGrade: '',
    emergencyContact: ''
  });
  const [teams, setTeams] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeams();
    fetchDepartments();
    if (userData?.role === 'employee') {
      fetchManagers();
    }
  }, [userData?.role]);

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

  const fetchDepartments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'departments'));
      const deptsList: any[] = [];
      querySnapshot.forEach(doc => deptsList.push({ id: doc.id, ...doc.data() }));
      setDepartments(deptsList);
    } catch (error) {
      toast.error('Failed to fetch departments');
    }
  };

  const fetchManagers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const managersList: any[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.role === 'manager') {
          managersList.push({ id: doc.id, ...data });
        }
      });
      setManagers(managersList);
    } catch (error) {
      toast.error('Failed to fetch managers');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ ...formData, profileComplete: true });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center py-5">
      <div className="card shadow-lg" style={{ width: '100%', maxWidth: '700px' }}>
        <div className="card-body p-5">
          <h3 className="text-center mb-4">Complete Your Profile</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Emergency Contact</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                />
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
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
              <div className="col-md-6">
                <label className="form-label">Joining Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                />
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Address</label>
              <textarea
                className="form-control"
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              ></textarea>
            </div>
            
            <div className="mb-3">
              <label className="form-label">About</label>
              <textarea
                className="form-control"
                rows={3}
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              ></textarea>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Designation</label>
              <input
                type="text"
                className="form-control"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Team</label>
                <select
                  className="form-select"
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                  required
                >
                  <option value="">Select Team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.teamName} ({team.teamCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {userData?.role === 'employee' && (
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Manager</label>
                  <select
                    className="form-select"
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  >
                    <option value="">Select Manager</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.fullName || manager.username}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Salary Grade</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.salaryGrade}
                    onChange={(e) => setFormData({ ...formData, salaryGrade: e.target.value })}
                    placeholder="e.g., Grade-1, Grade-2"
                  />
                </div>
              </div>
            )}
            
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
