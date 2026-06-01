import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--bg-card)]/90 backdrop-blur-lg shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center"
            style={{ boxShadow: '4px 4px 8px rgba(99,102,241,0.3)' }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-[var(--text-primary)] tracking-tight">
            Revonix
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl text-[var(--text-secondary)] font-medium text-sm hover:text-[var(--text-primary)] transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="neo-btn-primary px-5 py-2.5 text-sm"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden neo-btn w-10 h-10 p-0 rounded-xl"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--bg-card)] border-t border-[var(--bg-secondary)] px-6 py-4 space-y-2">
          <Link
            to="/login"
            className="block py-3 text-[var(--text-secondary)] font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="neo-btn-primary w-full text-center text-sm py-3"
            onClick={() => setMobileOpen(false)}
          >
            Sign Up Free
          </Link>
        </div>
      )}
    </nav>
  );
};
