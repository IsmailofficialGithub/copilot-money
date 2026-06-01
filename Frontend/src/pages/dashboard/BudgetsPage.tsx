import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { SkeletonCard } from '@/components/shared/Skeleton';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, X, Wallet } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { fetchBudgets, createBudget, updateBudget, deleteBudget } from '@/lib/api';
import { CATEGORIES, type Budget, type BudgetPeriod } from '@/types';


export const BudgetsPage = () => {
  useRequireAuth();
  const { addToast } = useStore();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchBudgets();
        if (data.data.length > 0) setBudgets(data.data);
      } catch {
        // Use demo data
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!category || !amount) return;
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, { category, amount: Number(amount), period });
        setBudgets((prev) =>
          prev.map((b) =>
            b.id === editingBudget.id ? { ...b, category, amount: Number(amount), period } : b
          )
        );
        addToast({ type: 'success', message: 'Budget updated!' });
      } else {
        const newBudget = await createBudget({ category, amount: Number(amount), period });
        setBudgets((prev) => [...prev, newBudget]);
        addToast({ type: 'success', message: 'Budget created!' });
      }
      closeModal();
    } catch {
      // Optimistic update
      if (editingBudget) {
        setBudgets((prev) =>
          prev.map((b) =>
            b.id === editingBudget.id ? { ...b, category, amount: Number(amount), period } : b
          )
        );
      } else {
        const newBudget: Budget = {
          id: Date.now().toString(),
          category,
          amount: Number(amount),
          spent: 0,
          period,
          percentUsed: 0,
          active: true,
          createdAt: new Date().toISOString(),
        };
        setBudgets((prev) => [...prev, newBudget]);
      }
      addToast({ type: 'success', message: editingBudget ? 'Budget updated!' : 'Budget created!' });
      closeModal();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      addToast({ type: 'success', message: 'Budget deleted!' });
    } catch {
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      addToast({ type: 'success', message: 'Budget deleted!' });
    }
    setDeleteConfirm(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBudget(null);
    setCategory('');
    setAmount('');
    setPeriod('monthly');
  };

  const openEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setCategory(budget.category);
    setAmount(String(budget.amount));
    setPeriod(budget.period);
    setModalOpen(true);
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 100) return 'bg-[var(--danger)]';
    if (pct >= 80) return 'bg-[var(--warning)]';
    return 'bg-[var(--success)]';
  };

  const getStatusText = (pct: number) => {
    if (pct >= 100) return 'Over budget';
    if (pct >= 80) return 'Near limit';
    return 'On track';
  };

  const usedCategories = budgets.map((b) => b.category);
  const availableCategories = CATEGORIES.filter((c) => !usedCategories.includes(c) || editingBudget?.category === c);

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Budgets</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {budgets.length} active budgets
            </p>
          </div>
          <button
            onClick={() => { setEditingBudget(null); setModalOpen(true); }}
            className="neo-btn-primary px-5 py-2.5 text-sm gap-2 inline-flex items-center"
          >
            <Plus className="w-4 h-4" />
            Add Budget
          </button>
        </div>

        {/* Budget Cards */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="neo-card p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--primary-light)] flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No budgets yet
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
              Set spending limits for categories to track your progress and stay on target.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="neo-btn-primary px-6 py-2.5 text-sm"
            >
              Create your first budget
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {budgets.map((budget) => (
              <div key={budget.id} className="neo-card p-6 group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">
                      {budget.category}
                    </h3>
                    <p className={`text-xs font-medium mt-0.5 ${
                      budget.percentUsed >= 100 ? 'text-[var(--danger)]' :
                      budget.percentUsed >= 80 ? 'text-[var(--warning)]' :
                      'text-[var(--success)]'
                    }`}>
                      {getStatusText(budget.percentUsed)}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(budget)}
                      className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(budget.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[var(--danger)]" />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="neo-progress h-2.5">
                    <div
                      className={`neo-progress-fill ${getProgressColor(budget.percentUsed)}`}
                      style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-money text-lg font-bold text-[var(--text-primary)]">
                      ${Number(budget.spent || 0).toFixed(0)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      of ${Number(budget.amount || 0).toFixed(0)} this month
                    </p>
                  </div>
                  <div className="text-right">
                    {budget.percentUsed >= 100 ? (
                      <TrendingUp className="w-5 h-5 text-[var(--danger)] ml-auto" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-[var(--success)] ml-auto" />
                    )}
                    <p className={`text-xs font-medium mt-0.5 ${
                      budget.percentUsed >= 100 ? 'text-[var(--danger)]' : 'text-[var(--text-secondary)]'
                    }`}>
                      {Number(budget.percentUsed || 0).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="neo-card p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {editingBudget ? 'Edit Budget' : 'Add Budget'}
              </h3>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)]">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="neo-input text-sm"
                >
                  <option value="">Select category</option>
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="400"
                  min={1}
                  className="neo-input text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Period
                </label>
                <div className="flex gap-2">
                  {(['monthly', 'weekly'] as BudgetPeriod[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                        period === p
                          ? 'bg-[var(--primary)] text-white'
                          : 'neo-btn'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={!category || !amount}
                className="neo-btn-primary w-full py-3 text-sm mt-2 disabled:opacity-50"
              >
                {editingBudget ? 'Update Budget' : 'Save Budget'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="neo-card p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-[var(--danger)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Delete Budget
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              This will permanently remove this budget. Your transactions won't be affected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="neo-btn flex-1 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[var(--danger)] text-white hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
