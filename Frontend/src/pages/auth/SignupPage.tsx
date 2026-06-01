import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, Check, X } from 'lucide-react';
import { signUp } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { useRedirectIfAuth } from '@/hooks/useAuth';

type StrengthLevel = 0 | 1 | 2 | 3;

const getStrength = (password: string): StrengthLevel => {
  if (password.length === 0) return 0;
  if (password.length < 4) return 0;
  if (password.length < 8) return 1;
  if (password.length < 12) return 2;
  return 3;
};

const strengthLabels: Record<StrengthLevel, { text: string; color: string; width: string }> = {
  0: { text: 'Too short', color: 'bg-gray-300', width: 'w-1/4' },
  1: { text: 'Weak', color: 'bg-orange-400', width: 'w-2/4' },
  2: { text: 'Good', color: 'bg-green-500', width: 'w-3/4' },
  3: { text: 'Strong', color: 'bg-green-600', width: 'w-full' },
};

export const SignupPage = () => {
  useRedirectIfAuth();
  const { addToast } = useStore();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const strength = getStrength(password);
  const strengthInfo = strengthLabels[strength];

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) return;
    if (password.length < 8) {
      addToast({ type: 'error', message: 'Password must be at least 8 characters' });
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, displayName);
      setSuccess(true);
      addToast({ type: 'success', message: 'Account created! Please check your email.' });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to create account' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    addToast({ type: 'success', message: 'Confirmation email resent!' });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-light)]/20 via-transparent to-[var(--bg-primary)]" />
        <div className="relative w-full max-w-md">
          <div className="neo-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Check your inbox
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              We've sent a confirmation link to <strong>{email}</strong>. Click the
              link to activate your account.
            </p>
            <button
              onClick={handleResend}
              disabled={resendTimer > 0}
              className="neo-btn w-full py-3 disabled:opacity-50"
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Email'}
            </button>
            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              Already confirmed?{' '}
              <Link to="/login" className="text-[var(--primary)] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-light)]/20 via-transparent to-[var(--bg-primary)]" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center"
              style={{ boxShadow: '4px 4px 8px rgba(99,102,241,0.3)' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-[var(--text-primary)]">Revonix</span>
          </Link>
        </div>

        <div className="neo-card p-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1 text-center">
            Create your account
          </h1>
          <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
            Start your journey to financial clarity
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
                className="neo-input"
                required
                minLength={2}
              />
            </div>

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
                  placeholder="Min 8 characters"
                  className="neo-input pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Strength meter */}
              {password.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="neo-progress h-2">
                    <div
                      className={`neo-progress-fill ${strengthInfo.color} ${strengthInfo.width}`}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)]">
                      {strengthInfo.text}
                    </span>
                    {strength >= 2 && <Check className="w-3 h-3 text-green-500" />}
                  </div>

                  {/* Rules checklist */}
                  <div className="space-y-1.5 pt-1">
                    <div className={`flex items-center gap-2 text-xs ${hasMinLength ? 'text-green-600' : 'text-[var(--text-muted)]'}`}>
                      {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      At least 8 characters
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${hasNumber ? 'text-green-600' : 'text-[var(--text-muted)]'}`}>
                      {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      One number
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${hasUpper ? 'text-green-600' : 'text-[var(--text-muted)]'}`}>
                      {hasUpper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      One uppercase letter
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neo-btn-primary w-full py-3 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--primary)] hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
