import { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
  token: string | null;
  children: ReactNode;
}

const ProtectedRoute: FC<Props> = ({ token, children }) => {
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
