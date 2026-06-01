import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-primary)] via-[var(--primary-light)]/30 to-[var(--bg-primary)]" />
      
      {/* Decorative blobs */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[var(--primary)]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--primary)]/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left content */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary-light)] border border-[var(--primary)]/20">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
            <span className="text-sm font-medium text-[var(--primary)]">
              AI-Powered Finance
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] leading-[1.1] tracking-tight">
            Your AI-Powered{' '}
            <span className="text-gradient">Personal Finance</span>{' '}
            Assistant
          </h1>

          <p className="text-lg text-[var(--text-secondary)] max-w-lg leading-relaxed">
            Import your bank data. Ask questions in plain English. Get instant
            answers about your spending, budgets, and subscriptions.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/signup"
              className="neo-btn-primary px-8 py-3.5 text-base gap-2 group"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="neo-btn px-8 py-3.5 text-base gap-2"
            >
              Log In
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-4">
            <div className="flex -space-x-3">
              {['bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-pink-400'].map((color, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full ${color} border-2 border-[var(--bg-primary)] flex items-center justify-center text-white text-xs font-bold`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Trusted by <span className="font-semibold text-[var(--text-secondary)]">10,000+</span> users
            </p>
          </div>
        </div>

        {/* Right: Hero image */}
        <div className="relative hidden lg:block">
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl"
            style={{
              boxShadow: '20px 20px 60px rgba(0,0,0,0.15), -20px -20px 60px rgba(255,255,255,0.8)',
              transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
            }}
          >
            <img
              src="/images/hero-dashboard.jpg"
              alt="Revonix Dashboard"
              className="w-full h-auto rounded-2xl"
            />
            {/* Floating badge */}
            <div
              className="absolute bottom-6 left-6 bg-[var(--bg-card)]/95 backdrop-blur-md rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ boxShadow: 'var(--shadow-raised)' }}
            >
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-lg">+12%</span>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">This month</p>
                <p className="font-money text-sm font-semibold text-[var(--text-primary)]">$4,250.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
