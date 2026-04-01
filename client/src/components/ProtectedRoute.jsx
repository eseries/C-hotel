import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { canAccess } from '../utils/roleUtils';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { token, user } = useAuth();

  if (!token) return <Navigate to="/" replace />;
  if (!canAccess(user?.role, roles)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
