import { useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  XAxis, YAxis, CartesianGrid, Area, AreaChart
} from 'recharts';
import type { CategorySpending, MonthlyTrend } from '@/types';
import { getCategoryColor } from '@/types';

interface Props {
  spendingByCategory: CategorySpending[];
  monthlyTrend: MonthlyTrend[];
}

type TimeRange = 'month' | '3m' | 'year';

export const SpendingCharts: React.FC<Props> = ({ spendingByCategory, monthlyTrend }) => {
  const [range, setRange] = useState<TimeRange>('month');

  // Filter monthly trend based on range
  const filteredTrend = (() => {
    if (range === 'month') return monthlyTrend.slice(-1);
    if (range === '3m') return monthlyTrend.slice(-3);
    return monthlyTrend;
  })();

  const ranges: { key: TimeRange; label: string }[] = [
    { key: 'month', label: 'This Month' },
    { key: '3m', label: 'Last 3M' },
    { key: 'year', label: 'This Year' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="neo-card p-3 text-sm">
          <p className="font-medium text-[var(--text-primary)]">{payload[0].name}</p>
          <p className="font-money text-[var(--primary)]">${payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  const LineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="neo-card p-3 text-sm">
          <p className="font-medium text-[var(--text-primary)]">{label}</p>
          <p className="font-money text-[var(--primary)]">${payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      {/* Donut Chart */}
      <div className="neo-card p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Spending by Category
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={spendingByCategory}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="amount"
              animationBegin={0}
              animationDuration={800}
            >
              {spendingByCategory.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          {spendingByCategory.slice(0, 5).map((cat) => (
            <div key={cat.category} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getCategoryColor(cat.category) }}
              />
              <span className="text-[var(--text-secondary)]">{cat.category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Line Chart */}
      <div className="neo-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Monthly Trend
          </h3>
          <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-lg p-0.5">
            {ranges.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  range === r.key
                    ? 'bg-[var(--bg-card)] text-[var(--primary)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={filteredTrend}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-secondary)" />
            <XAxis
              dataKey="month"
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--bg-secondary)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip content={<LineTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fill="url(#trendFill)"
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
