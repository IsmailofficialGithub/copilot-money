import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="py-12 border-t border-[var(--bg-secondary)] bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center"
              style={{ boxShadow: '3px 3px 6px rgba(99,102,241,0.3)' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-[var(--text-primary)]">
              Revonix
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-6 text-sm text-[var(--text-secondary)]">
            <Link to="#" className="hover:text-[var(--text-primary)] transition-colors">
              About
            </Link>
            <Link to="#" className="hover:text-[var(--text-primary)] transition-colors">
              Privacy
            </Link>
            <Link to="#" className="hover:text-[var(--text-primary)] transition-colors">
              Terms
            </Link>
            <Link to="#" className="hover:text-[var(--text-primary)] transition-colors">
              Contact
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-[var(--text-muted)]">
            &copy; 2026 Revonix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
