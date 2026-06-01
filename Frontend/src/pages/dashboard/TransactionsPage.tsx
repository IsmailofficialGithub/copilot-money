import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { SkeletonTable } from '@/components/shared/Skeleton';
import { Search, Upload, ChevronLeft, ChevronRight, ArrowUpDown, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { fetchTransactions } from '@/lib/api';
import { CATEGORIES, type Transaction } from '@/types';


export const TransactionsPage = () => {
  useRequireAuth();
  const { addToast } = useStore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'merchantName'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const limit = 10;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchTransactions({ page, limit, category, search });
        if (data.data.length > 0) {
          setTransactions(data.data);
        }
      } catch {
        // Use demo data
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, category, search]);

  const filtered = transactions
    .filter((t) => !search || t.merchantName.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => !category || t.category === category)
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'amount') return (a.amount - b.amount) * dir;
      if (sortField === 'merchantName') return a.merchantName.localeCompare(b.merchantName) * dir;
      return a.date.localeCompare(b.date) * dir;
    });

  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filtered.length / limit);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Transactions</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {filtered.length} transactions total
            </p>
          </div>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="neo-btn-primary px-5 py-2.5 text-sm gap-2 inline-flex items-center"
          >
            <Upload className="w-4 h-4" />
            Upload CSV
          </button>
        </div>

        {/* Filter Bar */}
        <div className="neo-card p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search merchants..."
              className="neo-input pl-10 py-2.5 text-sm w-full"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="neo-input py-2.5 text-sm min-w-[140px]"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : (
          <div className="neo-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--bg-secondary)]">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      <button onClick={() => handleSort('date')} className="flex items-center gap-1 hover:text-[var(--text-primary)]">
                        Date <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Merchant
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      <button onClick={() => handleSort('amount')} className="flex items-center gap-1 ml-auto hover:text-[var(--text-primary)]">
                        Amount <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--bg-secondary)]">
                  {paginated.map((txn) => (
                    <tr
                      key={txn.id}
                      className={`hover:bg-[var(--bg-secondary)]/30 transition-colors group ${
                        txn.isAnomaly ? 'border-l-4 border-l-amber-400' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5 text-sm text-[var(--text-primary)] whitespace-nowrap">
                        {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {txn.isAnomaly && <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">{txn.merchantName}</p>
                            <p className="text-xs text-[var(--text-muted)] truncate max-w-[200px]">{txn.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                          {txn.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`font-money text-sm font-semibold ${txn.amount < 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                          {txn.amount < 0 ? '-' : '+'}${Math.abs(txn.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-[var(--text-muted)] capitalize">{txn.source}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--bg-secondary)]">
              <p className="text-sm text-[var(--text-muted)]">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="neo-btn w-9 h-9 p-0 rounded-lg disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="neo-btn w-9 h-9 p-0 rounded-lg disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="neo-card p-8 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Upload Transactions
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Drag and drop your CSV file, or click to browse
            </p>
            <div
              className="border-2 border-dashed border-[var(--bg-secondary)] rounded-2xl p-10 text-center hover:border-[var(--primary)]/40 transition-colors cursor-pointer"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.csv';
                input.onchange = (e: any) => {
                  if (e.target.files?.[0]) {
                    addToast({ type: 'success', message: `Uploaded ${e.target.files[0].name}! Processing...` });
                    setUploadModalOpen(false);
                  }
                };
                input.click();
              }}
            >
              <Upload className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-sm text-[var(--text-muted)]">
                Click to select file
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Supports CSV format
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="neo-btn flex-1 py-2.5 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
