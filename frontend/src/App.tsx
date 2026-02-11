import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Pages Import
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/Calendar';
import { TransactionProvider } from './context/TransactionContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TestComponent from './pages/TestComponent';
import { TransactionPage } from './pages/Transaction';
// import { ProfilePage } from './pages/Profile';

function App() {
  return (
    <TransactionProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            element={
              <MainLayout>
                <Outlet />
              </MainLayout>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/transaction" element={<TransactionPage />} />
            {/* 2. 경로 연결 */}
            {/* <Route path="/profile" element={<ProfilePage />} /> */}
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </TransactionProvider>
  );
}

export default App;
