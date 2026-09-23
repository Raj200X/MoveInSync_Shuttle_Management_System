import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — wraps a route that requires authentication.
 * @param {string} [requiredRole] - 'STUDENT' | 'ADMIN' | undefined (any authenticated)
 * @param {string} [redirectTo] - where to send if access denied (default: '/login')
 */
export function ProtectedRoute({ children, requiredRole, redirectTo = '/login' }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) {
    const fallback = user?.role === 'ADMIN' ? '/admin/dashboard' : '/student/book';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
