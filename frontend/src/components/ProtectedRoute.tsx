import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  token: string | null;
}

export default function ProtectedRoute({ children, token }: ProtectedRouteProps) {
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Wrapping children in a fragment ensures TypeScript is happy 
  // returning a valid JSX Element
  return <>{children}</>;
}