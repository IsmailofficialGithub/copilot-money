import { TrendingUp, TrendingDown, ShoppingBag, CreditCard, PiggyBank } from 'lucide-react';
import type { DashboardData } from '@/types';

interface Props {
  data: DashboardData;
}

export const SummaryCards: React.FC<Props> = ({ data }) => {
  const isIncrease = data.percentChange >= 0;

  const cards = [
    {
      title: 'Total Spent This Month',
      value: `$${data.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: `${isIncrease ? '+' : ''}${data.percentChange}%`,
      changeType: isIncrease ? 'negative' : 'positive' as const,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Top Category',
      value: data.topCategory.name,
      subtitle: `$${data.topCategory.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Subscriptions',
      value: `$${data.subscriptions.monthlyTotal.toFixed(2)}/mo`,
      subtitle: `${data.subscriptions.count} active`,
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Budget Status',
      value: `${data.budgetStatus.onTrack} on track`,
      subtitle: data.budgetStatus.over > 0 ? `${data.budgetStatus.over} over` : undefined,
      subtitleColor: data.budgetStatus.over > 0 ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]',
      icon: PiggyBank,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="neo-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              {card.change && (
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  card.changeType === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {card.changeType === 'positive' ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <TrendingUp className="w-3 h-3" />
                  )}
                  {card.change}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium mb-1">
              {card.title}
            </p>
            <p className="font-money text-xl font-bold text-[var(--text-primary)]">
              {card.value}
            </p>
            {card.subtitle && (
              <p className={`text-sm mt-1 ${card.subtitleColor || 'text-[var(--text-muted)]'}`}>
                {card.subtitle}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
