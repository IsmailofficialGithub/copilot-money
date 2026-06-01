import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const CTASection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-[var(--primary-light)]/50 to-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-6">
          Ready to take control of{' '}
          <span className="text-gradient">your finances?</span>
        </h2>
        <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-xl mx-auto">
          Join thousands of users who have transformed their financial life with
          Revonix. Start for free — no credit card required.
        </p>
        <Link
          to="/signup"
          className="neo-btn-primary px-10 py-4 text-lg gap-3 inline-flex group"
        >
          Create Free Account
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <p className="mt-6 text-sm text-[var(--text-muted)]">
          Free forever. Upgrade anytime for advanced features.
        </p>
      </div>
    </section>
  );
};
