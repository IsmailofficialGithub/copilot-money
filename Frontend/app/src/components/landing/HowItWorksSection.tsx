import { Upload, Brain, MessageCircle } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload your bank CSV or connect your account',
    description:
      'Import your transaction history in seconds. We support all major banks and credit cards.',
  },
  {
    number: '02',
    icon: Brain,
    title: 'Set budgets and let AI categorize your spending',
    description:
      'Our AI automatically categorizes every transaction and learns your spending patterns over time.',
  },
  {
    number: '03',
    icon: MessageCircle,
    title: 'Chat with your AI assistant about anything financial',
    description:
      'Ask questions, get insights, and receive personalized recommendations — all in natural language.',
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-[var(--bg-secondary)]/30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[var(--primary)] uppercase tracking-wider mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Three steps to{' '}
            <span className="text-gradient">financial clarity</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-[var(--primary)]/20 via-[var(--primary)]/40 to-[var(--primary)]/20" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative text-center">
                <div className="inline-flex flex-col items-center">
                  <div
                    className="w-20 h-20 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center mb-6 relative z-10"
                    style={{ boxShadow: 'var(--shadow-raised)' }}
                  >
                    <Icon className="w-8 h-8 text-[var(--primary)]" />
                  </div>
                  <span className="text-xs font-bold text-[var(--primary)] mb-3">
                    STEP {step.number}
                  </span>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 max-w-xs">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] max-w-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
