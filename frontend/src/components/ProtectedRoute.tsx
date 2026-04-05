import { FC } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  token: string | null;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, token }) => {
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
