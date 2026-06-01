import { useEffect } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { SpendingCharts } from '@/components/dashboard/SpendingCharts';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { AnomaliesPanel } from '@/components/dashboard/AnomaliesPanel';
import { ChatShortcut } from '@/components/dashboard/ChatShortcut';
import { SkeletonCard, SkeletonChart } from '@/components/shared/Skeleton';
import { useStore } from '@/store/useStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { fetchDashboard } from '@/lib/api';

export const DashboardPage = () => {
  const { user, isLoading: authLoading } = useRequireAuth();
  const {
    dashboardData,
    dashboardLoading,
    setDashboardData,
    setDashboardLoading,
    addToast,
  } = useStore();

  useEffect(() => {
    if (!user) return;

    const loadDashboard = async () => {
      setDashboardLoading(true);
      try {
        const data = await fetchDashboard();
        setDashboardData(data);
      } catch (err: any) {
        setDashboardData(null);
      } finally {
        setDashboardLoading(false);
      }
    };

    loadDashboard();
  }, [user, setDashboardData, setDashboardLoading, addToast]);

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <SkeletonChart />
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[var(--primary-light)] flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              No data yet
            </h2>
            <p className="text-[var(--text-secondary)] max-w-sm">
              Upload your transactions to see your financial dashboard come to life.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const demoBudgets: any[] = [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Dashboard
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Welcome back, {user?.displayName || 'there'}!
            </p>
          </div>
          <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-3 py-1.5 rounded-full">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Summary Cards */}
        {dashboardLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <SummaryCards data={dashboardData} />
        )}

        {/* Charts */}
        {dashboardLoading ? (
          <SkeletonChart />
        ) : (
          <SpendingCharts
            spendingByCategory={dashboardData.spendingByCategory}
            monthlyTrend={dashboardData.monthlyTrend}
          />
        )}

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            {dashboardLoading ? (
              <div className="neo-card p-6 space-y-4">
                <div className="skeleton-shimmer h-6 w-1/3" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="skeleton-shimmer h-4 w-full" />
                    <div className="skeleton-shimmer h-3 w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <BudgetProgress budgets={demoBudgets} />
            )}
          </div>
          <div className="space-y-5">
            {!dashboardLoading && dashboardData.anomalies.length > 0 && (
              <AnomaliesPanel anomalies={dashboardData.anomalies} />
            )}
            <ChatShortcut />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
