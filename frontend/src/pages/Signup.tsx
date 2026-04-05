import { useState, useCallback, FC } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import type { User } from '@/App';

interface SignupProps {
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
}

const Signup: FC<SignupProps> = ({ setToken, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      setLoading(true);

      try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
          email,
          password,
          name,
        });

        if (response.data.success) {
          setToken(response.data.token);
          setUser(response.data.user);
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          navigate('/dashboard');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Signup failed');
      } finally {
        setLoading(false);
      }
    },
    [email, password, confirmPassword, name, setToken, setUser, navigate]
  );

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition font-mono text-sm';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl glow-accent">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight">
              Professor Stock Market
            </h1>
            <p className="text-muted-foreground text-sm mt-2">Create your account</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
