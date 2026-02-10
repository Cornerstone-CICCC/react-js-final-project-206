import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Invite from "./pages/Invite";
import TestComponent from "./pages/TestComponent";

import ProtectedRoute from "./routes/ProtectedRoute";
import PartnerGate from "./routes/PartnerGate";
import { useAuth } from "./contexts/AuthContext";

function HomeRedirect() {
  const { auth } = useAuth();

  // 1) 로그인 안 했으면 /login
  if (!auth.token) return <Navigate to="/login" replace />;

  // 2) 로그인 했는데 user가 아직 없으면(새로고침 직후 등)
  //    여기서는 일단 dashboard로 보내고, 실제로는 /me로 user 복구하는 로직을 권장
  if (!auth.user) return <Navigate to="/dashboard" replace />;

  // 3) partnerId 있으면 dashboard, 없으면 invite
  return auth.user.partnerId ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/invite" replace />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/test" element={<TestComponent />} />

        {/* Protected (로그인 필요) */}
        <Route
          path="/invite"
          element={
            <ProtectedRoute>
              <Invite />
            </ProtectedRoute>
          }
        />

        {/* Protected + partnerId 필요 */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PartnerGate>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </PartnerGate>
            </ProtectedRoute>
          }
        />

        {/* Entry */}
        <Route path="/" element={<HomeRedirect />} />

        {/* 404 */}
        <Route path="*" element={<div style={{ padding: 24 }}>Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
