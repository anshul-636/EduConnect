import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
const RoleRoute = ({ children, roles }) => {
  const { user } = useAuthStore();
  if (!user || !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};
export default RoleRoute;