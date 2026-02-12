<<<<<<< HEAD
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// 레이아웃 및 인증 관련
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// 컨텍스트 (Bella 쪽 Provider)
import { TransactionProvider } from './context/TransactionContext';

// 페이지 컴포넌트
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/Calendar';
import { TransactionPage } from './pages/Transaction';

function App() {
  return (
    <TransactionProvider>
      <BrowserRouter>
        <Toaster position="top-right" />

        <Routes>
          {/* 1. Public 영역 */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 2. Protected 영역 */}
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
          </Route>

          {/* 3. 첫 페이지 접속 시 무조건 로그인으로 이동 */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 정의되지 않은 모든 경로는 로그인으로 리다이렉트 (보안 강화) */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </TransactionProvider>
=======
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/Calendar";
import { TransactionProvider } from "./context/TransactionContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { TransactionPage } from "./pages/Transaction";
import Profile from "./pages/Profile";

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <BrowserRouter>
          <Toaster position="top-right" />

          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Layout */}
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
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </TransactionProvider>
    </AuthProvider>
>>>>>>> origin/feature/backend-env
  );
}

export default App;
