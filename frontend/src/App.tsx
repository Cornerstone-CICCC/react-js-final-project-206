import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Invite from './pages/Invite';
import TestComponent from './pages/TestComponent';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 인증 관련 페이지 (레이아웃 없음 또는 별도 배경) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/invite" element={<Invite />} />
        <Route path="/test" element={<TestComponent />} />

        {/* 대시보드 및 서비스 내부 페이지 (MainLayout 적용) */}
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />

        {/* 초기 경로 설정: 대시보드로 리다이렉트 (로그인 여부에 따라 추후 변경) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
