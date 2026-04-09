import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthLayout = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
};
export default AuthLayout;