import { Bell, Moon, Sun, Search } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export const Header = () => {
  const { theme, setTheme, sidebarOpen } = useStore();
  const { user } = useAuth();
  const [, setSearchOpen] = useState(false);

  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || user?.email?.[0].toUpperCase() || 'U';

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-[var(--bg-card)]/80 backdrop-blur-md z-30 flex items-center justify-between px-6 transition-all duration-300 ${
        sidebarOpen ? 'left-64' : 'left-20'
      }`}
      style={{ borderBottom: '1px solid var(--bg-secondary)' }}
    >
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search transactions, budgets..."
            className="neo-input pl-10 py-2.5 text-sm w-full max-w-sm"
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="neo-btn w-10 h-10 p-0 rounded-xl"
          title="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
          ) : (
            <Sun className="w-4 h-4 text-[var(--text-secondary)]" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="neo-btn w-10 h-10 p-0 rounded-xl relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-[var(--text-secondary)]" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--danger)] rounded-full text-[10px] text-white flex items-center justify-center font-semibold">
            2
          </span>
        </button>

        {/* User */}
        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-[var(--bg-secondary)]">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
              {user?.displayName || 'User'}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {user?.email}
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
            style={{ boxShadow: '3px 3px 8px rgba(99,102,241,0.3)' }}
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};
