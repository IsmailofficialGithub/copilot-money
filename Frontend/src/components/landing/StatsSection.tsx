import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Zap, Target } from 'lucide-react';

const stats = [
  {
    icon: TrendingUp,
    value: 50000,
    suffix: '+',
    label: 'Transactions processed',
  },
  {
    icon: Zap,
    value: 2,
    suffix: 's',
    prefix: '< ',
    label: 'Response time',
  },
  {
    icon: Target,
    value: 90,
    suffix: '%+',
    label: 'Receipt accuracy',
  },
];

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const steps = 30;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="font-money text-4xl sm:text-5xl font-bold text-[var(--text-primary)]">
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  );
}

export const StatsSection = () => {
  return (
    <section className="py-24 bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="neo-card p-12">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] flex items-center justify-center mx-auto">
                    <Icon className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <AnimatedCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                  <p className="text-[var(--text-secondary)] font-medium">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
