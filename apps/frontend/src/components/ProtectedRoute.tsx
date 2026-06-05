import { Navigate, Outlet } from 'umi';
import { useAuthStore } from '@/stores/auth.store';

type Props = {
  role?: 'ADMIN' | 'USER';
};

export default function ProtectedRoute({ role }: Props) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role.name !== role) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
}