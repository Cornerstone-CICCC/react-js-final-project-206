import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const { auth } = useAuth();
  const location = useLocation();
  const didToastRef = useRef(false);

  useEffect(() => {
    if (auth.isBooting) return;
    if (auth.isAuthenticated) return;

    if (!didToastRef.current) {
      didToastRef.current = true;
      toast.error('Please log in first.');
    }
  }, [auth.isBooting, auth.isAuthenticated]);

  if (auth.isBooting) return null;

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
