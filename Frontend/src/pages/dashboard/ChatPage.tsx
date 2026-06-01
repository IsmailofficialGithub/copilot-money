import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { Paperclip, Send, Bot, User, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useRequireAuth } from '@/hooks/useAuth';
import type { ChatMessage } from '@/types';

const suggestions = [
  'Summarise my spending this month',
  'What are my active subscriptions?',
  'Am I over budget anywhere?',
  'What was my biggest purchase?',
  'Show me unusual charges',
];


export const ChatPage = () => {
  const { user } = useRequireAuth();
  const { addToast } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    // Simulate streaming response
    const responses: Record<string, string> = {
      'spending': 'Based on your data, you\'ve spent **$4,250.00** this month across 8 categories. Your top expenses are:\n\n1. **Groceries**: $890.50\n2. **Shopping**: $780.00\n3. **Dining**: $650.25\n\nThis is 11.8% higher than last month.',
      'subscriptions': 'You have **6 active subscriptions** totaling **$89.99/month**:\n\n1. Netflix: $15.49\n2. Spotify: $10.99\n3. Gym: $29.99\n4. iCloud: $9.99\n5. Adobe: $14.99\n6. Amazon Prime: $8.99 (annual, $107.88)',
      'budget': 'You have **1 budget over limit**:\n\n**Dining**: $650 / $500 (130%)\n\n**1 near limit**:\n- Entertainment: $190 / $200 (95%)\n\n**3 on track**:\n- Groceries: $320 / $400 (80%)\n- Transport: $180 / $300 (60%)\n- Shopping: $280 / $400 (70%)',
      'purchase': 'Your biggest purchase this month was **$780.00 at Apple Store** on May 3rd for a new iPad Air.\n\nSecond largest was **$650.25** in total dining expenses, with your single biggest meal being **$89.50 at Nobu** on May 20th.',
      'unusual': 'I found **1 unusual charge** this month:\n\n- **CRYPTO_VAULT_XYZ**: $89.00 on May 28th\n\nThis doesn\'t match your typical spending pattern. Would you like me to flag it for review?',
    };

    const lowerInput = input.toLowerCase();
    let responseText = 'I can help you analyze your finances. Try asking about your spending, budgets, subscriptions, or transactions!';
    
    for (const [key, value] of Object.entries(responses)) {
      if (lowerInput.includes(key)) {
        responseText = value;
        break;
      }
    }

    // Stream effect
    const words = responseText.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 30));
      currentText += (i > 0 ? ' ' : '') + words[i];
      setStreamingText(currentText);
    }

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseText,
      createdAt: new Date().toISOString(),
      toolsUsed: ['sql_query'],
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setStreamingText('');
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-7rem)] flex flex-col -mx-6 -mt-6">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-[var(--primary)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                Hi {user?.displayName || 'there'}, what would you like to know?
              </h2>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Ask me anything about your finances
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); }}
                    className="px-4 py-2 rounded-full bg-[var(--bg-secondary)] text-sm text-[var(--text-secondary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-[var(--primary)]" />
                </div>
              )}
              <div
                className={`max-w-[70%] px-5 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[var(--primary)] text-white rounded-[18px_18px_4px_18px]'
                    : 'bg-[var(--bg-card)] text-[var(--text-primary)] rounded-[18px_18px_18px_4px]'
                }`}
                style={msg.role === 'assistant' ? { boxShadow: 'var(--shadow-soft)' } : {}}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[var(--bg-secondary)]/50 flex items-center gap-1.5">
                    <span className="text-[10px] text-[var(--text-muted)]">
                      Used: {msg.toolsUsed.join(', ')}
                    </span>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-[var(--primary)] flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Streaming message */}
          {streamingText && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <div
                className="max-w-[70%] px-5 py-3 text-sm leading-relaxed bg-[var(--bg-card)] text-[var(--text-primary)] rounded-[18px_18px_18px_4px]"
                style={{ boxShadow: 'var(--shadow-soft)' }}
              >
                <div className="whitespace-pre-wrap">
                  {streamingText}
                  <span className="inline-block w-0.5 h-4 bg-[var(--primary)] ml-0.5 animate-pulse align-middle" />
                </div>
              </div>
            </div>
          )}

          {loading && !streamingText && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <div
                className="px-5 py-3 bg-[var(--bg-card)] rounded-[18px_18px_18px_4px] flex items-center gap-2"
                style={{ boxShadow: 'var(--shadow-soft)' }}
              >
                <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin" />
                <span className="text-sm text-[var(--text-muted)]">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="px-6 py-4 border-t border-[var(--bg-secondary)] bg-[var(--bg-primary)]">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <button
              onClick={handleFileUpload}
              className="neo-btn w-10 h-10 p-0 rounded-xl flex-shrink-0 mb-0.5"
              title="Upload receipt"
            >
              <Paperclip className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  addToast({ type: 'success', message: 'Receipt uploaded! Processing...' });
                }
              }}
            />
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message or drop a receipt..."
                rows={1}
                className="neo-input py-3 pr-12 resize-none overflow-hidden min-h-[44px] max-h-[120px]"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5 transition-all ${
                input.trim() && !loading
                  ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
