import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages & Components
import Dashboard from "./pages/Dashboard"; // FIXED: Now pointing to Dashboard
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

// Initialize React Query
const queryClient = new QueryClient();

// Define Types for your State
export interface User {
  id: string;
  name: string;
  email: string;
}

const App = () => {
  // --- MERN Authentication State ---
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token") || null;
  });

  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    try {
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  });

  // Keep localStorage in sync if state changes
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* UI Providers from Lovable */}
        <Toaster />
        <Sonner />
        
        <BrowserRouter>
          <Routes>
            {/* --- Public Auth Routes --- */}
            <Route
              path="/login"
              element={
                token ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login setToken={setToken} setUser={setUser} />
                )
              }
            />
            <Route
              path="/signup"
              element={
                token ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Signup setToken={setToken} setUser={setUser} />
                )
              }
            />

            {/* --- Protected Routes --- */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute token={token}>
                  <Dashboard user={user} setToken={setToken} setUser={setUser} />
                </ProtectedRoute>
              }
            />

            {/* --- Redirects and Catch-Alls --- */}
            <Route
              path="/"
              element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
            />
            
            {/* Lovable's built-in 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;