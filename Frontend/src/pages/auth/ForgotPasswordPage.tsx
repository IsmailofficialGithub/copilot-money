import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Check } from 'lucide-react';
import { resetPassword } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

export const ForgotPasswordPage = () => {
  const { addToast } = useStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      addToast({ type: 'success', message: 'Reset link sent!' });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to send reset link' });
    } finally {
      setLoading(false);
    }
  };

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
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                Check your email
              </h2>
              <p className="text-[var(--text-secondary)] mb-6">
                If that email exists in our system, we've sent a reset link to{' '}
                <strong>{email}</strong>.
              </p>
              <Link
                to="/login"
                className="neo-btn w-full py-3 inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <Link
                  to="/login"
                  className="p-2 -ml-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                </Link>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">
                  Reset your password
                </h1>
              </div>

              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Enter your email address and we'll send you a link to reset your
                password.
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

                <button
                  type="submit"
                  disabled={loading}
                  className="neo-btn-primary w-full py-3 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
