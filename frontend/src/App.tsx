import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Pages Import
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/Calendar';
// TransactionContext에서 Provider와 Page를 가져옴
import { TransactionProvider, type Transaction } from './context/TransactionContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TestComponent from './pages/TestComponent';
import { TransactionPage } from './pages/Transaction';

function App() {
  return (
    // 1. 최상단을 Provider로 감싸야 Dashboard 내부의 useTransactions가 작동함
    <TransactionProvider>
      <BrowserRouter>
        <Toaster position="top-right" />

        <Routes>
          {/* 인증 페이지 */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/test" element={<TestComponent />} />

          {/* 메인 서비스 페이지 (MainLayout 적용) */}
          <Route
            element={
              <MainLayout>
                <Outlet />
              </MainLayout>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarPage />} />
            {/* 2. 대시보드 View All 버튼이 연결될 경로 */}
            <Route path="/transaction" element={<TransactionPage />} />
          </Route>

          {/* 초기 경로 및 404 리다이렉트 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </TransactionProvider>
  );
}

export default App;
