import { LayoutDashboard, MessageSquare, Camera } from 'lucide-react';

const features = [
  {
    icon: LayoutDashboard,
    title: 'Smart Dashboard',
    description:
      'See your complete financial picture at a glance. Spending trends, budget tracking, and anomaly detection.',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
  },
  {
    icon: MessageSquare,
    title: 'AI Chat Assistant',
    description:
      'Ask anything about your money in plain English. Get instant, accurate answers grounded in your real data.',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
  },
  {
    icon: Camera,
    title: 'Receipt Scanner',
    description:
      'Snap a photo of any receipt. Our AI extracts merchant, amount, and items automatically.',
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[var(--primary)] uppercase tracking-wider mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Everything you need to{' '}
            <span className="text-gradient">master your money</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Powerful tools that work together to give you complete control
            over your finances — powered by AI.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="neo-card p-8 group cursor-default"
              >
                <div
                  className={`w-14 h-14 ${feature.lightColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-7 h-7 ${feature.color.replace('bg-', 'text-')}`} />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
