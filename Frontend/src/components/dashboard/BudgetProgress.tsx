import { useEffect, useRef, useState } from 'react';
import type { Budget } from '@/types';

interface Props {
  budgets: Budget[];
}

const ProgressBar: React.FC<{ budget: Budget }> = ({ budget }) => {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(Math.min(budget.percentUsed, 100)), 100);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [budget.percentUsed]);

  const getBarColor = () => {
    if (budget.percentUsed >= 100) return 'bg-[var(--danger)]';
    if (budget.percentUsed >= 80) return 'bg-[var(--warning)]';
    return 'bg-[var(--success)]';
  };

  const getStatusBadge = () => {
    if (budget.percentUsed >= 100) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-[var(--danger)] uppercase tracking-wider">
          OVER
        </span>
      );
    }
    if (budget.percentUsed >= 80) {
      return (
        <span className="relative flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--warning)] animate-pulse" />
          <span className="text-[10px] font-bold text-[var(--warning)] uppercase tracking-wider">
            Warning
          </span>
        </span>
      );
    }
    return null;
  };

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {budget.category}
          </span>
          {getStatusBadge()}
        </div>
        <span className="font-money text-sm text-[var(--text-secondary)]">
          ${budget.spent.toFixed(0)} / ${budget.amount.toFixed(0)}
        </span>
      </div>
      <div className="neo-progress">
        <div
          className={`neo-progress-fill ${getBarColor()}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

export const BudgetProgress: React.FC<Props> = ({ budgets }) => {
  return (
    <div className="neo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Budget Progress
        </h3>
        <span className="text-xs text-[var(--text-muted)]">
          {budgets.filter((b) => b.percentUsed < 80).length} of {budgets.length} on track
        </span>
      </div>
      <div className="space-y-5">
        {budgets.slice(0, 5).map((budget) => (
          <ProgressBar key={budget.id} budget={budget} />
        ))}
      </div>
    </div>
  );
};
