import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import toast from 'react-hot-toast';

interface UserData {
  uid: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  createdAt: any;
}

interface Profile {
  uid?: string;
  employeeId?: string;
  fullName?: string;
  phoneNumber?: string;
  gender?: string;
  address?: string;
  profilePhoto?: string;
  about?: string;
  departmentId?: string;
  teamId?: string;
  managerId?: string;
  designation?: string;
  joiningDate?: string;
  salaryGrade?: string;
  emergencyContact?: string;
  profileComplete?: boolean;
  [key: string]: any;
}

interface Notification {
  id: string;
  uid: string;
  title: string;
  message: string;
  type: 'task' | 'leave' | 'deadline' | 'announcement' | 'general';
  isRead: boolean;
  relatedId?: string;
  createdAt: any;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserData | null;
  profile: Profile | null;
  profileComplete: boolean;
  notifications: Notification[];
  unreadCount: number;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileComplete, setProfileComplete] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
          
          // Fetch profile
          const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
          if (profileDoc.exists()) {
            const profileData = profileDoc.data() as Profile;
            setProfile(profileData);
            setProfileComplete(!!profileData.profileComplete);
          } else {
            setProfileComplete(false);
          }
          
          // Fetch notifications
          await fetchNotifications(firebaseUser.uid);
        } else {
          setUserData(null);
          setProfile(null);
          setProfileComplete(true);
        }
      } else {
        setUserData(null);
        setProfile(null);
        setProfileComplete(true);
        setNotifications([]);
        setUnreadCount(0);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const fetchNotifications = async (uid: string) => {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('uid', '==', uid)
      );
      const querySnapshot = await getDocs(q);
      const notificationsList: Notification[] = [];
      let count = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Notification, 'id'>;
        notificationsList.push({ ...data, id: doc.id });
        if (!data.isRead) count++;
      });
      
      setNotifications(notificationsList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful!');
      
      // Auto check-in for non-admin
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        if (data.role !== 'admin') {
          const today = new Date().toISOString().split('T')[0];
          const attendanceRef = doc(db, 'attendance', `${userCredential.user.uid}_${today}`);
          const attendanceDoc = await getDoc(attendanceRef);
          if (!attendanceDoc.exists()) {
            await setDoc(attendanceRef, {
              uid: userCredential.user.uid,
              date: today,
              checkIn: Timestamp.now(),
              status: 'present',
              createdAt: Timestamp.now()
            });
            toast.success('Auto check-in done!');
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, role: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        username,
        email,
        role,
        createdAt: Timestamp.now()
      });
      
      toast.success('Registration successful!');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Auto check-out for non-admin
      if (user && userData && userData.role !== 'admin') {
        const today = new Date().toISOString().split('T')[0];
        const attendanceRef = doc(db, 'attendance', `${user.uid}_${today}`);
        const attendanceDoc = await getDoc(attendanceRef);
        if (attendanceDoc.exists()) {
          await updateDoc(attendanceRef, {
            checkOut: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
        }
      }
      
      await signOut(auth);
      toast.success('Logged out successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return;
    
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        await updateDoc(profileRef, { ...data, updatedAt: Timestamp.now() });
      } else {
        await setDoc(profileRef, { ...data, uid: user.uid, createdAt: Timestamp.now() });
      }
      
      setProfile(prev => ({ ...prev, ...data }));
      setProfileComplete(true);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      profile, 
      profileComplete, 
      notifications,
      unreadCount,
      login, 
      register, 
      logout, 
      updateProfile,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
