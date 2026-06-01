import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, EyeOff } from 'lucide-react';
import { signIn } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { useRedirectIfAuth } from '@/hooks/useAuth';

export const LoginPage = () => {
  useRedirectIfAuth();
  const navigate = useNavigate();
  const { addToast } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorAttempts, setErrorAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      await signIn(email, password);
      addToast({ type: 'success', message: 'Signed in successfully!' });
      navigate('/dashboard');
    } catch (err: any) {
      setErrorAttempts((prev) => prev + 1);
      const message = err.message?.toLowerCase() || '';
      if (message.includes('invalid') || message.includes('credentials')) {
        if (errorAttempts >= 2) {
          addToast({ 
            type: 'error', 
            message: 'Incorrect password. ',
          });
        } else {
          addToast({ type: 'error', message: 'Incorrect password' });
        }
      } else if (message.includes('not found') || message.includes('user')) {
        addToast({ type: 'error', message: 'No account found with this email' });
      } else {
        addToast({ type: 'error', message: err.message || 'Failed to sign in' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 py-12">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-light)]/20 via-transparent to-[var(--bg-primary)]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center"
              style={{ boxShadow: '4px 4px 8px rgba(99,102,241,0.3)' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-[var(--text-primary)]">
              Revonix
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="neo-card p-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1 text-center">
            Welcome back
          </h1>
          <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="neo-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="neo-input pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {errorAttempts >= 3 && (
              <p className="text-sm text-[var(--danger)]">
                Incorrect password.{' '}
                <Link to="/forgot-password" className="underline hover:text-[var(--primary)]">
                  Forgot it?
                </Link>
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="neo-btn-primary w-full py-3 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-[var(--text-secondary)]">
              <Link
                to="/forgot-password"
                className="text-[var(--primary)] hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-[var(--primary)] hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          Protected by industry-standard encryption
        </p>
      </div>
    </div>
  );
};
