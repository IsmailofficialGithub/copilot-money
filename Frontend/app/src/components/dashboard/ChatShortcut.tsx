import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowRight } from 'lucide-react';

const suggestions = [
  'Summarise my spending this month',
  'What are my active subscriptions?',
  'Am I over budget anywhere?',
];

export const ChatShortcut = () => {
  const navigate = useNavigate();

  return (
    <div className="neo-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            Ask anything about your finances
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Our AI assistant is ready to help
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => navigate('/chat')}
            className="px-3 py-2 rounded-full bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <button
        onClick={() => navigate('/chat')}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors"
      >
        Open Chat
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
