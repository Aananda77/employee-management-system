import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { FaUsers, FaUserTie, FaUsersCog, FaFileAlt, FaTasks, FaCalendarCheck } from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    checkTeams();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard/admin');
      setDashboardData(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const checkTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data.teams);
    } catch (error: any) {
      toast.error('Failed to fetch teams');
    }
  };

  const taskColors = ['#0088FE', '#00C49F', '#FFBB28'];
  const attendanceColors = ['#28a745', '#dc3545', '#fd7e14'];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="card shadow-lg p-5 text-center">
          <h3>Welcome!</h3>
          <p className="text-muted mb-4">Please create at least one team before accessing the dashboard.</p>
          <a href="/admin/teams" className="btn btn-primary">Create Team</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar />
        <div className="col-md-10 main-content">
          <Navbar />
          <div className="container-fluid">
            <h2 className="mb-4">Admin Dashboard</h2>
            
            <div className="row mb-4">
              <div className="col-md-2 mb-3">
                <div className="card card-dashboard">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="text-muted">Employees</h5>
                        <h3>{dashboardData?.stats?.totalEmployees || 0}</h3>
                      </div>
                      <div className="bg-primary text-white p-3 rounded">
                        <FaUsers size={30} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-2 mb-3">
                <div className="card card-dashboard">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="text-muted">Managers</h5>
                        <h3>{dashboardData?.stats?.totalManagers || 0}</h3>
                      </div>
                      <div className="bg-success text-white p-3 rounded">
                        <FaUserTie size={30} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-2 mb-3">
                <div className="card card-dashboard">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="text-muted">Teams</h5>
                        <h3>{dashboardData?.stats?.totalTeams || 0}</h3>
                      </div>
                      <div className="bg-info text-white p-3 rounded">
                        <FaUsersCog size={30} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-2 mb-3">
                <div className="card card-dashboard">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="text-muted">Pending Leaves</h5>
                        <h3>{dashboardData?.stats?.pendingLeaves || 0}</h3>
                      </div>
                      <div className="bg-warning text-dark p-3 rounded">
                        <FaFileAlt size={30} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-2 mb-3">
                <div className="card card-dashboard">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="text-muted">Completed Tasks</h5>
                        <h3>{dashboardData?.stats?.completedTasks || 0}</h3>
                      </div>
                      <div className="bg-success text-white p-3 rounded">
                        <FaTasks size={30} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row mb-4">
              <div className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Task Statistics</h5>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={dashboardData?.taskStats}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {dashboardData?.taskStats?.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={taskColors[index % taskColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Attendance Overview (Last 7 Days)</h5>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dashboardData?.attendanceStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8">
                          {dashboardData?.attendanceStats?.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={attendanceColors[index % attendanceColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Recent Leave Requests</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Employee</th>
                            <th>Type</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData?.recentLeaves?.slice(0, 5).map((leave: any) => (
                            <tr key={leave.id}>
                              <td>{leave.full_name || leave.username}</td>
                              <td>{leave.leave_type}</td>
                              <td>
                                <span className={`status-badge status-${leave.status}`}>
                                  {leave.status}
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
              
              <div className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Recent Tasks</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Assigned To</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData?.recentTasks?.slice(0, 5).map((task: any) => (
                            <tr key={task.id}>
                              <td>{task.title}</td>
                              <td>{task.assigned_to_username || '-'}</td>
                              <td>
                                <span className={`status-badge status-${task.status}`}>
                                  {task.status}
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
