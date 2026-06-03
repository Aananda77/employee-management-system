import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ManagerDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard/manager');
      setDashboardData(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status"></div>
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
            <h2 className="mb-4">Manager Dashboard</h2>
            
            <div className="row mb-4">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Welcome, {dashboardData?.manager?.full_name || 'Manager'}</h5>
                  </div>
                  <div className="card-body">
                    <p className="mb-0">Team: {dashboardData?.team?.team_name || 'Not assigned'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Team Monthly Attendance</h5>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dashboardData?.charts?.monthlyAttendance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="present_days" name="Present" fill="#28a745" />
                        <Bar dataKey="absent_days" name="Absent" fill="#dc3545" />
                        <Bar dataKey="late_days" name="Late" fill="#fd7e14" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Team Task Completion Rate</h5>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dashboardData?.charts?.taskCompletionRate}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" name="Completed" fill="#00C49F" />
                        <Bar dataKey="total" name="Total" fill="#0088FE" />
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
                    <h5 className="mb-0">Team Employees</h5>
                  </div>
                  <div className="card-body">
                    {dashboardData?.teamEmployees?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.teamEmployees.map((emp: any) => (
                              <tr key={emp.id}>
                                <td>{emp.full_name || emp.username}</td>
                                <td>{emp.email}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted">No employees in team</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Recent Tasks</h5>
                  </div>
                  <div className="card-body">
                    {dashboardData?.assignedTasks?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.assignedTasks.slice(0, 5).map((task: any) => (
                              <tr key={task.id}>
                                <td>{task.title}</td>
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
                    ) : (
                      <p className="text-muted">No tasks assigned</p>
                    )}
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

export default ManagerDashboard;
