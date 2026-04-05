import { useState, Dispatch, SetStateAction } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Mail, Lock, UserPlus, Loader2, User as UserIcon } from "lucide-react";
import { User } from "../App"; // Importing the interface we exported from App.tsx

interface AuthProps {
  setToken: Dispatch<SetStateAction<string | null>>;
  setUser: Dispatch<SetStateAction<User | null>>;
}

const Signup = ({ setToken, setUser }: AuthProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      // Proxy handles routing to the backend
      const response = await axios.post("/api/auth/register", {
        email,
        password,
        name,
      });

      if (response.data.success || response.data.token) {
        const { token, user } = response.data;
        
        setToken(token);
        setUser(user);
        
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        toast.success("Account created. Welcome to ProfExchange.");
        navigate("/dashboard");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
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
          New Investor Registration
        </p>
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-8 relative overflow-hidden">
        {/* Decorative glow effect */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          
          {/* Name Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:ring-1 focus:ring-ring focus:border-ring transition-all outline-none"
                placeholder="Triton Trader"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email Input */}
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

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Password
            </label>
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

          {/* Confirm Password Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                Registering...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Open Account
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="text-accent hover:text-accent/80 font-semibold transition-colors">
              Access Terminal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;