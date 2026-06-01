import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Receipt, 
  PieChart, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: MessageSquare, label: 'Chat', path: '/chat' },
  { icon: Receipt, label: 'Transactions', path: '/transactions' },
  { icon: PieChart, label: 'Budgets', path: '/budgets' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = () => {
  const { sidebarOpen, toggleSidebar } = useStore();
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[var(--bg-card)] z-40 flex flex-col transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
      style={{
        boxShadow: sidebarOpen 
          ? '8px 0 24px rgba(0,0,0,0.08)' 
          : '4px 0 16px rgba(0,0,0,0.05)',
      }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 h-16 px-4 border-b border-[var(--bg-secondary)] ${
        !sidebarOpen && 'justify-center'
      }`}>
        <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center flex-shrink-0"
          style={{ boxShadow: '4px 4px 8px rgba(99,102,241,0.3)' }}
        >
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {sidebarOpen && (
          <span className="font-bold text-lg text-[var(--text-primary)] tracking-tight">
            Revonix
          </span>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
      >
        {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
              } ${!sidebarOpen && 'justify-center'}`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive && 'text-[var(--primary)]'}`} />
              {sidebarOpen && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
              {isActive && sidebarOpen && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom: Logout */}
      <div className="p-3 border-t border-[var(--bg-secondary)]">
        <button
          onClick={signOut}
          className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-50 transition-all duration-200 w-full ${
            !sidebarOpen && 'justify-center'
          }`}
          title={!sidebarOpen ? 'Sign Out' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span className="font-medium text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
