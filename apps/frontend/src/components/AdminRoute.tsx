import React from 'react';
import { Navigate, Outlet } from 'umi';
import { useAuthStore } from '@/stores/auth.store';

const AdminRoute: React.FC = () => {
  const { user, accessToken } = useAuthStore();

  if (!accessToken) return <Navigate to="/login" replace />;

  // Check admin role supporting multiple user role schemes
  const isAdmin = 
    user?.role?.name === 'ADMIN' || 
    user?.role === 'ADMIN' ||
    user?.roles?.some((r: any) => r.name === 'ADMIN' || r === 'ADMIN');

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default AdminRoute;
