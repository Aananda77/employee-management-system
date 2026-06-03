import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';

// Helper to format time
function formatTime(dateTime: any) {
  if (!dateTime) return '-';
  const date = dateTime instanceof Timestamp ? dateTime.toDate() : new Date(dateTime);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Helper to format working hours
function formatWorkingHours(checkIn: any, checkOut: any) {
  if (!checkIn || !checkOut) return '-';
  const inTime = checkIn instanceof Timestamp ? checkIn.toDate() : new Date(checkIn);
  const outTime = checkOut instanceof Timestamp ? checkOut.toDate() : new Date(checkOut);
  const diffMs = outTime.getTime() - inTime.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const wholeHours = Math.floor(diffHours);
  const minutes = Math.round((diffHours - wholeHours) * 60);
  return `${wholeHours}h ${minutes}m`;
}

const Attendance: React.FC = () => {
  const { user, userData, profile } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>({ presentDays: 0, absentDays: 0, lateDays: 0, attendancePercentage: 0 });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    date: new Date().toISOString().split('T')[0],
    check_in: '',
    check_out: '',
    status: 'present'
  });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTodayAttendance();
      fetchAttendance();
      fetchAnalytics();
      if (userData?.role === 'admin' || userData?.role === 'manager') {
        fetchUsers();
      }
    }
  }, [user, userData]);

  const fetchTodayAttendance = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const docRef = doc(db, 'attendance', `${user.uid}_${today}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTodayAttendance(docSnap.data());
      }
    } catch (error: any) {
      console.error('Failed to fetch today attendance');
    }
  };

  const fetchAttendance = async () => {
    if (!user || !userData) return;
    try {
      let q;
      if (userData.role === 'admin') {
        q = query(collection(db, 'attendance'));
      } else if (userData.role === 'manager') {
        q = query(collection(db, 'attendance'));
      } else {
        q = query(collection(db, 'attendance'), where('uid', '==', user.uid));
      }
      const querySnapshot = await getDocs(q);
      const records: any[] = [];
      querySnapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() });
      });
      setAttendance(records);
    } catch (error: any) {
      toast.error('Failed to fetch attendance');
    }
  };

  const fetchAnalytics = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'attendance'), where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      let presentDays = 0, absentDays = 0, lateDays = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'present') presentDays++;
        if (data.status === 'absent') absentDays++;
        if (data.status === 'late') lateDays++;
      });
      const totalDays = querySnapshot.size;
      const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
      setAnalytics({ presentDays, absentDays, lateDays, attendancePercentage });
    } catch (error: any) {
      console.error('Failed to fetch analytics');
    }
  };

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList: any[] = [];
      querySnapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersList);
    } catch (error: any) {
      toast.error('Failed to fetch users');
    }
  };

  const handleCheckIn = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const docRef = doc(db, 'attendance', `${user.uid}_${today}`);
      const checkInTime = Timestamp.now();
      const checkInHour = checkInTime.toDate().getHours();
      const status = checkInHour > 9 ? 'late' : 'present';
      
      await setDoc(docRef, {
        uid: user.uid,
        date: today,
        checkIn: checkInTime,
        status,
        createdAt: Timestamp.now()
      });
      
      toast.success('Check-in successful');
      fetchTodayAttendance();
      fetchAttendance();
      fetchAnalytics();
    } catch (error: any) {
      toast.error('Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const docRef = doc(db, 'attendance', `${user.uid}_${today}`);
      
      await updateDoc(docRef, {
        checkOut: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      toast.success('Check-out successful');
      fetchTodayAttendance();
      fetchAttendance();
      fetchAnalytics();
    } catch (error: any) {
      toast.error('Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'present': return 'bg-success';
      case 'absent': return 'bg-danger';
      case 'late': return 'bg-warning text-dark';
      case 'half-day': return 'bg-info text-dark';
      default: return 'bg-secondary';
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
              <h2>Attendance</h2>
            </div>
            
            {/* Today's Attendance & Check In/Out */}
            {(userData?.role === 'employee' || userData?.role === 'manager') && (
              <>
                <div className="row mb-4">
                  {/* Today's Attendance Card */}
                  <div className="col-md-6 mb-3">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5>Today's Attendance</h5>
                        <div className="mt-3">
                          <div className="mb-2">
                            <strong>Check In: </strong>
                            <span>{formatTime(todayAttendance?.checkIn)}</span>
                          </div>
                          <div className="mb-2">
                            <strong>Check Out: </strong>
                            <span>{formatTime(todayAttendance?.checkOut)}</span>
                          </div>
                          <div className="mb-2">
                            <strong>Working Hours: </strong>
                            <span>{formatWorkingHours(todayAttendance?.checkIn, todayAttendance?.checkOut)}</span>
                          </div>
                          <div>
                            <strong>Status: </strong>
                            <span className={`badge ms-1 ${getStatusBadgeClass(todayAttendance?.status)}`}>
                              {todayAttendance?.status || 'pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Check In/Out Buttons */}
                  <div className="col-md-6 mb-3">
                    <div className="card h-100">
                      <div className="card-body text-center">
                        <h5>Actions</h5>
                        <div className="mt-3">
                            <button
                                className="btn btn-success me-3"
                                onClick={handleCheckIn}
                                disabled={actionLoading || (todayAttendance?.checkIn)}
                            >
                                <FaSignInAlt className="me-1" />
                                Check In
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleCheckOut}
                                disabled={actionLoading || !todayAttendance?.checkIn || todayAttendance?.checkOut}
                            >
                                <FaSignOutAlt className="me-1" />
                                Check Out
                            </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Attendance Analytics */}
                <div className="row mb-4">
                  <div className="col-md-3 mb-3">
                    <div className="card text-center">
                      <div className="card-body">
                        <h5 className="text-muted">Present Days</h5>
                        <h3>{analytics?.presentDays || 0}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card text-center">
                      <div className="card-body">
                        <h5 className="text-muted">Absent Days</h5>
                        <h3>{analytics?.absentDays || 0}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card text-center">
                      <div className="card-body">
                        <h5 className="text-muted">Late Days</h5>
                        <h3>{analytics?.lateDays || 0}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card text-center">
                      <div className="card-body">
                        <h5 className="text-muted">Attendance %</h5>
                        <h3>{analytics?.attendancePercentage || 0}%</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* Attendance Table */}
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>User</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Working Hours</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((record) => (
                        <tr key={record.id}>
                          <td>{record.date}</td>
                          <td>{profile?.fullName || userData?.username || 'User'}</td>
                          <td>{formatTime(record.checkIn)}</td>
                          <td>{formatTime(record.checkOut)}</td>
                          <td>{formatWorkingHours(record.checkIn, record.checkOut)}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(record.status)}`}>
                              {record.status}
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
  );
};

export default Attendance;
