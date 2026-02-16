import { useEffect } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router';
import { useUserStore } from './store/user.store';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

import PageLayout from './layouts/PageLayout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import TransactionList from './pages/TransactionList';
import TransactionDetail from './pages/TransactionDetail';
import Profile from './pages/Profile';

import { useNotificationStore } from './store/notification.store';
import { useUIStore } from './store/ui.store';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  transports: ['websocket'],
});

const App = () => {
  const { checkAuth, isCheckingAuth, isAuthenticated, user } = useUserStore();
  const { fetchNotifications } = useNotificationStore();
  const { triggerRefresh } = useUIStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Socket management and event listeners
  useEffect(() => {
    const userId = user?.id || user?._id;

    if (!isAuthenticated || !userId) return;

    socket.connect();
    socket.emit('join_war_room', userId);

    socket.on('database_change', () => {
      triggerRefresh();
      fetchNotifications();
    });

    socket.on('expense_update_received', (data: any) => {
      toast(data.message, { icon: '👋', duration: 3000 });
      fetchNotifications();
      triggerRefresh();
    });

    return () => {
      socket.off('database_change');
      socket.off('expense_update_received');
      socket.disconnect();
    };
  }, [isAuthenticated, user, fetchNotifications, triggerRefresh]);

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-600 animate-pulse">
          Loading F-Insight...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={isAuthenticated ? <PageLayout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/transactions" element={<TransactionList />} />
          <Route path="/transactions/:id" element={<TransactionDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
