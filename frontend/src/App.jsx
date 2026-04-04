import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  return (
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
  );
}
