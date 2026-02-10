import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import MainLayout from './components/layout/MainLayout';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TestComponent from './pages/TestComponent';

// bella 쪽에서 추가된 페이지들 (있는 경우만)
import CalendarPage from './pages/Calendar';
import { TransactionPage } from './pages/Transaction';

// bella 쪽 Provider (경로/이름이 이대로여야 함)
import { TransactionProvider } from './context/TransactionContext';

import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <TransactionProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/test" element={<TestComponent />} />

          {/* Protected 영역: 로그인 필요 */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Outlet />
                </MainLayout>
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/transaction" element={<TransactionPage />} />
          </Route>

          {/* Entry */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </TransactionProvider>
  );
}

export default App;
