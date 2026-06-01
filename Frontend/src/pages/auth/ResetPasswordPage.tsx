import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, Check } from 'lucide-react';
import { supabase, updatePassword } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { addToast } = useStore();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check for access token in URL (Supabase sends this)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          // Token is valid, user can reset
        }
      });
    }
  }, []);

  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const passwordsDontMatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', message: 'Passwords do not match' });
      return;
    }
    if (newPassword.length < 8) {
      addToast({ type: 'error', message: 'Password must be at least 8 characters' });
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      setSuccess(true);
      addToast({ type: 'success', message: 'Password reset successfully!' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to reset password' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-light)]/20 via-transparent to-[var(--bg-primary)]" />
        <div className="relative w-full max-w-md text-center">
          <div className="neo-card p-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Password reset!
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Your password has been updated. Redirecting you to login...
            </p>
            <Link to="/login" className="neo-btn-primary w-full py-3 inline-block">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
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
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1 text-center">
            Create new password
          </h1>
          <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="neo-input pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="neo-input pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordsMatch && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Passwords match
                </p>
              )}
              {passwordsDontMatch && (
                <p className="text-xs text-[var(--danger)] mt-2">
                  Passwords don't match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !passwordsMatch}
              className="neo-btn-primary w-full py-3 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
