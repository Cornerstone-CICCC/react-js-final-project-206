import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// 레이아웃 및 인증 관련
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// 컨텍스트 (Bella 쪽 Provider)
import { TransactionProvider } from './context/TransactionContext';

// 페이지 컴포넌트 (중복 제거 및 경로 통합)
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/Calendar'; // 파일명이 Calendar 인지 확인 필요
import { TransactionPage } from './pages/Transaction';
import TestComponent from './pages/TestComponent';

function App() {
  return (
    <TransactionProvider>
      <BrowserRouter>
        {/* 토스트 알림 컴포넌트 추가 */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '16px',
              background: '#0f172a',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold',
            },
          }}
        />

        <Routes>
          {/* Public Routes (인증 필요 없음) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Private Routes (인증 필요 + 레이아웃 적용) */}
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
            <Route path="/profile" element={<Profile />} />
            <Route path="/test" element={<TestComponent />} />
          </Route>

          {/* 기본 경로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 처리 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </TransactionProvider>
  );
}

export default App;
