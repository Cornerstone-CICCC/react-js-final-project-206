// frontend/src/components/auth/ProtectedRoute.tsx
import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const { auth } = useAuth();
  const location = useLocation();
  const didToastRef = useRef(false);

  // ✅ Hook은 무조건 최상단에서 동일 순서로 호출되어야 함
  useEffect(() => {
    if (auth.isBooting) return;
    if (auth.isAuthenticated) return;

    if (!didToastRef.current) {
      didToastRef.current = true;
      toast.error("Please log in first.");
    }
  }, [auth.isBooting, auth.isAuthenticated]);

  // 부팅 중(세션 확인 중)에는 아무 것도 안 그림 (깜빡임 방지)
  if (auth.isBooting) return null;

  // 로그인 안 됨 → 로그인 페이지로
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
