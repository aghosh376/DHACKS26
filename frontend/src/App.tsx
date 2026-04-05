import { useState, FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

export interface User {
  name: string;
  email: string;
  [key: string]: any;
}

const queryClient = new QueryClient();

const App: FC = () => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token') || null;
  });

  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              token ? <Navigate to="/dashboard" replace /> : <Login setToken={setToken} setUser={setUser} />
            }
          />
          <Route
            path="/signup"
            element={
              token ? <Navigate to="/dashboard" replace /> : <Signup setToken={setToken} setUser={setUser} />
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute token={token}>
                <Dashboard user={user} setToken={setToken} setUser={setUser} />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
