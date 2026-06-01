import { AlertTriangle, MessageSquare, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Anomaly } from '@/types';

interface Props {
  anomalies: Anomaly[];
}

export const AnomaliesPanel: React.FC<Props> = ({ anomalies }) => {
  const navigate = useNavigate();

  if (anomalies.length === 0) return null;

  return (
    <div
      className="rounded-[var(--radius-card)] p-6 border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50"
      style={{ boxShadow: '6px 6px 14px rgba(245,158,11,0.1), -6px -6px 14px rgba(255,255,255,0.8)' }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-amber-900">
            Unusual charges detected
          </h3>
          <p className="text-sm text-amber-700 mt-0.5">
            We found {anomalies.length} transaction{anomalies.length > 1 ? 's' : ''} that look unusual
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {anomalies.slice(0, 3).map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/60"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-sm font-medium text-amber-900">{a.merchant}</span>
            </div>
            <span className="font-money text-sm font-semibold text-amber-800">
              ${a.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => navigate('/chat')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Ask Assistant
        </button>
        <button
          className="px-4 py-2.5 rounded-xl bg-white/80 text-amber-800 text-sm font-medium hover:bg-white transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          className="px-4 py-2.5 rounded-xl bg-white/80 text-amber-800 text-sm font-medium hover:bg-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
