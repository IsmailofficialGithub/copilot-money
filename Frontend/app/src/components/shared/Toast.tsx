import { useStore } from '@/store/useStore';
import { X, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-enter flex items-start gap-3 p-4 rounded-[var(--radius-input)] bg-[var(--bg-card)] shadow-[var(--shadow-raised)] border-l-4 ${
            toast.type === 'success' ? 'border-l-[var(--success)]' :
            toast.type === 'warning' ? 'border-l-[var(--warning)]' :
            'border-l-[var(--danger)]'
          }`}
        >
          <div className="mt-0.5 flex-shrink-0">
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-[var(--success)]" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[var(--danger)]" />}
          </div>
          <p className="flex-1 text-sm text-[var(--text-primary)] font-medium leading-relaxed">
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>
      ))}
    </div>
  );
};
