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
  );
}

export default App;
