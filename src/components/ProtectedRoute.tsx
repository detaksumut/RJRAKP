import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: ('author' | 'reviewer' | 'editor' | 'admin')[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Tunggu AuthContext selesai
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Memuat sesi pengguna...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}