import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

const EmployeeDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard/employee');
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
            <h2 className="mb-4">Employee Dashboard</h2>
            
            <div className="row mb-4">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Welcome, {dashboardData?.employee?.full_name || 'Employee'}</h5>
                  </div>
                  <div className="card-body">
                    <p className="mb-1">Team: {dashboardData?.team?.team_name || 'Not assigned'}</p>
                    {dashboardData?.manager && (
                      <p className="mb-0">Manager: {dashboardData.manager.full_name || dashboardData.manager.username}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Your Tasks</h5>
                  </div>
                  <div className="card-body">
                    {dashboardData?.assignedTasks?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Status</th>
                              <th>Deadline</th>
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
                                <td>{task.deadline}</td>
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
              
              <div className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Recent Attendance</h5>
                  </div>
                  <div className="card-body">
                    {dashboardData?.attendanceHistory?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.attendanceHistory.slice(0, 5).map((record: any) => (
                              <tr key={record.id}>
                                <td>{record.date}</td>
                                <td>
                                  <span className={`status-badge status-${record.status}`}>
                                    {record.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted">No attendance records</p>
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

export default EmployeeDashboard;
