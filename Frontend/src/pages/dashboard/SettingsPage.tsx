import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { User, Bell, Download, Trash2, AlertTriangle, ChevronRight, Lock, Moon } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase, resetPassword } from '@/lib/supabase';
import {
  fetchSettings,
  updateSettings,
  exportData,
  deleteAllTransactions,
  deleteAccount,
} from '@/lib/api';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, setTheme, addToast } = useStore();

  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [editingName, setEditingName] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [payDate, setPayDate] = useState(1);
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    anomalyAlerts: true,
    weeklySummary: false,
  });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState<'transactions' | 'account'>('transactions');
  const [deleteText, setDeleteText] = useState('');

  // Fetch settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await fetchSettings();
        setDisplayName(data.displayName);
        setCurrency(data.currency);
        setPayDate(data.payDate);
        setNotifications({
          budgetAlerts: data.notifications?.budgetAlerts ?? true,
          anomalyAlerts: data.notifications?.anomalyAlerts ?? true,
          weeklySummary: data.notifications?.weeklySummary ?? false,
        });
        if (data.theme && data.theme !== theme) {
          setTheme(data.theme as 'light' | 'dark');
        }
      } catch (err: any) {
        console.error('Failed to load backend settings, using local defaults', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadSettings();
    }
  }, [user]);

  const handleUpdateName = async () => {
    try {
      await supabase.auth.updateUser({ data: { display_name: displayName } });
      await updateSettings({ displayName });
      addToast({ type: 'success', message: 'Profile updated!' });
      setEditingName(false);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to update profile' });
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    try {
      await resetPassword(user.email);
      addToast({ type: 'success', message: 'Password reset email sent!' });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to send password reset email' });
    }
  };

  const handleCurrencyChange = async (val: string) => {
    setCurrency(val);
    try {
      await updateSettings({ currency: val });
      addToast({ type: 'success', message: 'Currency updated!' });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to update currency' });
    }
  };

  const handlePayDateChange = async (val: number) => {
    setPayDate(val);
    try {
      await updateSettings({ payDate: val });
      addToast({ type: 'success', message: 'Pay date updated!' });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to update pay date' });
    }
  };

  const handleNotificationToggle = async (key: 'budgetAlerts' | 'anomalyAlerts' | 'weeklySummary') => {
    const updatedNotifications = {
      ...notifications,
      [key]: !notifications[key],
    };
    setNotifications(updatedNotifications);
    try {
      await updateSettings({ notifications: updatedNotifications });
      addToast({ type: 'success', message: 'Notification settings updated!' });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to update notifications' });
    }
  };

  const handleThemeChange = async (t: 'light' | 'dark') => {
    setTheme(t);
    try {
      await updateSettings({ theme: t });
    } catch (err: any) {
      console.error('Failed to sync theme to backend', err);
    }
  };

  const handleExport = async () => {
    try {
      addToast({ type: 'success', message: 'Preparing your export...' });
      const blob = await exportData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addToast({ type: 'success', message: 'Transactions exported successfully!' });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to export data' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteText !== 'DELETE') {
      addToast({ type: 'error', message: 'Please type DELETE to confirm' });
      return;
    }
    try {
      if (deleteType === 'transactions') {
        await deleteAllTransactions();
        addToast({ type: 'success', message: 'All transactions deleted!' });
      } else {
        await deleteAccount();
        addToast({ type: 'success', message: 'Account deleted!' });
        await supabase.auth.signOut();
        window.location.href = '/#/login';
      }
      setDeleteConfirm(false);
      setDeleteText('');
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Action failed' });
    }
  };

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Manage your account preferences
          </p>
        </div>

        {/* Profile Section */}
        <div className="neo-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Profile</h2>
              <p className="text-xs text-[var(--text-muted)]">Your personal information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Display Name
              </label>
              <div className="flex gap-3">
                {editingName ? (
                  <>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="neo-input flex-1 text-sm"
                    />
                    <button
                      onClick={handleUpdateName}
                      className="neo-btn-primary px-4 py-2 text-sm"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-between py-2.5 px-4 rounded-xl bg-[var(--bg-secondary)]/50">
                    <span className="text-sm text-[var(--text-primary)]">{displayName || 'Not set'}</span>
                    <button
                      onClick={() => setEditingName(true)}
                      className="text-xs text-[var(--primary)] hover:underline font-medium"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Email
              </label>
              <div className="py-2.5 px-4 rounded-xl bg-[var(--bg-secondary)]/50 text-sm text-[var(--text-muted)]">
                {user?.email}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleChangePassword}
                className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
              >
                <Lock className="w-4 h-4" />
                Change password
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="neo-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Preferences</h2>
              <p className="text-xs text-[var(--text-muted)]">Customize your experience</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Currency */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Currency</p>
                <p className="text-xs text-[var(--text-muted)]">Display currency for all amounts</p>
              </div>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="neo-input py-2 text-sm w-28"
              >
                {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Theme */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Theme</p>
                <p className="text-xs text-[var(--text-muted)]">Choose your preferred appearance</p>
              </div>
              <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-lg p-0.5">
                {(['light', 'dark'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleThemeChange(t)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all flex items-center gap-1.5 ${
                      theme === t ? 'bg-[var(--bg-card)] text-[var(--primary)] shadow-sm' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {t === 'dark' && <Moon className="w-3 h-3" />}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Pay date */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Pay Date</p>
                <p className="text-xs text-[var(--text-muted)]">Day of month for budget cycles</p>
              </div>
              <select
                value={payDate}
                onChange={(e) => handlePayDateChange(Number(e.target.value))}
                className="neo-input py-2 text-sm w-20"
              >
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>

            {/* Notification toggles */}
            <div className="space-y-3 pt-2 border-t border-[var(--bg-secondary)]">
              {([
                { key: 'budgetAlerts', label: 'Budget Alerts', desc: 'Get notified when nearing budget limits' },
                { key: 'anomalyAlerts', label: 'Anomaly Alerts', desc: 'Alert on unusual transactions' },
                { key: 'weeklySummary', label: 'Weekly Summary', desc: 'Receive weekly spending report' },
              ] as const).map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle(item.key)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      notifications[item.key] ? 'bg-[var(--primary)]' : 'bg-[var(--bg-secondary)]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        notifications[item.key] ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="neo-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Data</h2>
              <p className="text-xs text-[var(--text-muted)]">Import and export your data</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)]/30 hover:bg-[var(--bg-secondary)]/60 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-[var(--text-secondary)]" />
                <span className="text-sm font-medium text-[var(--text-primary)]">Export all data (CSV)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => { setDeleteType('transactions'); setDeleteConfirm(true); }}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-red-50/50 hover:bg-red-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-[var(--danger)]" />
                <span className="text-sm font-medium text-[var(--danger)]">Delete all transactions</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--danger)]/50" />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div
          className="rounded-[var(--radius-card)] p-6 border border-red-200 bg-gradient-to-br from-red-50 to-orange-50"
          style={{ boxShadow: '6px 6px 14px rgba(239,68,68,0.06), -6px -6px 14px rgba(255,255,255,0.8)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[var(--danger)]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-red-900">Danger Zone</h2>
              <p className="text-xs text-red-600">Irreversible actions</p>
            </div>
          </div>

          <button
            onClick={() => { setDeleteType('account'); setDeleteConfirm(true); }}
            className="w-full py-3 rounded-xl bg-[var(--danger)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="neo-card p-8 max-w-md w-full mx-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-[var(--danger)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] text-center mb-2">
              {deleteType === 'transactions' ? 'Delete All Transactions' : 'Delete Your Account'}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
              {deleteType === 'transactions'
                ? 'This will permanently delete all your transaction data. This action cannot be undone.'
                : 'This will permanently delete your account and all data. This action cannot be undone.'}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Type <strong>DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="DELETE"
                className="neo-input text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteConfirm(false); setDeleteText(''); }}
                className="neo-btn flex-1 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[var(--danger)] text-white hover:opacity-90 transition-opacity"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
