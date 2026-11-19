import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** role="admin" -> only the boutique owner. No role -> any logged-in customer. */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="center-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  if (role === 'admin' && user.role !== 'admin') return <Navigate to="/my-orders" replace />;
  if (!role && user.role === 'admin' && location.pathname === '/my-orders') return <Navigate to="/admin" replace />;
  return children;
}
