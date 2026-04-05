import { useState, Dispatch, SetStateAction } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Mail, Lock, LogIn, Loader2 } from "lucide-react";

// Mirroring the User interface from App.tsx
export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthProps {
  setToken: Dispatch<SetStateAction<string | null>>;
  setUser: Dispatch<SetStateAction<User | null>>;
}

const Login = ({ setToken, setUser }: AuthProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Utilizing the Vite proxy configured earlier to bypass CORS
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      // Adjust these properties based on your actual Express payload
      if (response.data.success || response.data.token) {
        const { token, user } = response.data;
        
        setToken(token);
        setUser(user);
        
        // LocalStorage is also handled by App.tsx useEffects, but writing here ensures 
        // immediate availability before the next render cycle.
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        toast.success("Authentication successful.");
        navigate("/dashboard");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Connection refused or invalid credentials.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <h1 className="font-bold text-3xl tracking-tight text-foreground">
          <span className="text-accent">Prof</span>Exchange
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Terminal Access
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-8 relative overflow-hidden">
        {/* Decorative glow effect matching your index.css */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:ring-1 focus:ring-ring focus:border-ring transition-all outline-none"
                placeholder="investor@ucsd.edu"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:ring-1 focus:ring-ring focus:border-ring transition-all outline-none"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Initialize Session
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Unregistered trader?{" "}
            <Link to="/signup" className="text-accent hover:text-accent/80 font-semibold transition-colors">
              Open an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;