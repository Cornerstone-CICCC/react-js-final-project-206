import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PartnerGate({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();

  // 토큰은 있는데 user가 아직 세팅 전인 경우(새로고침 직후 등)
  if (!auth.user) return null;

  if (!auth.user.partnerId) {
    return <Navigate to="/invite" replace />;
  }

  return <>{children}</>;
}
