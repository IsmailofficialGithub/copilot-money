import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { Paperclip, Send, Bot, User, Loader2, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useRequireAuth } from '@/hooks/useAuth';
import type { ChatMessage } from '@/types';
import { sendMessage, uploadReceipt, fetchConversations, fetchConversation, deleteConversation } from '@/lib/api';
import ReactMarkdown from 'react-markdown';

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
  const [initialLoading, setInitialLoading] = useState(true);
  const [streamingText, setStreamingText] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await fetchConversations();
        if (data && data.length > 0) {
          const latestId = data[0].id;
          setConversationId(latestId);
          const { messages: history } = await fetchConversation(latestId);
          if (history) {
            setMessages(history);
          }
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    loadHistory();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    try {
      const response = await sendMessage({ message: userText, conversationId });
      
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }
      
      // Stream effect
      const words = response.message.split(' ');
      let currentText = '';
      
      for (let i = 0; i < words.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 30));
        currentText += (i > 0 ? ' ' : '') + words[i];
        setStreamingText(currentText);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        createdAt: new Date().toISOString(),
        toolsUsed: response.toolsUsed || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      addToast({ type: 'error', message: error.message || 'Failed to send message' });
    } finally {
      setStreamingText('');
      setLoading(false);
    }
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

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      addToast({ type: 'success', message: 'Uploading receipt...' });
      
      await uploadReceipt(file);
      
      addToast({ type: 'success', message: 'Receipt uploaded and processed!' });
      
      // Optional: Inform the user in chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `I've successfully read your receipt for ${file.name}. What would you like to know about it?`,
          createdAt: new Date().toISOString(),
          toolsUsed: ['vision_ocr']
        }
      ]);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to upload receipt' });
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteChat = async () => {
    if (loading) return;
    if (!conversationId) {
      setMessages([]);
      return;
    }
    const confirmed = window.confirm('Delete this chat history?');
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteConversation(conversationId);
      setConversationId(null);
      setMessages([]);
      addToast({ type: 'success', message: 'Chat deleted!' });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to delete chat' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-7rem)] flex flex-col -mx-6 -mt-6">
        <div className="px-6 py-3 border-b border-[var(--bg-secondary)] bg-[var(--bg-primary)] flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">Chat</h1>
            <p className="text-xs text-[var(--text-muted)]">Ask about your transactions, budgets, and receipts</p>
          </div>
          <button
            onClick={handleDeleteChat}
            disabled={loading || messages.length === 0}
            className="neo-btn w-10 h-10 p-0 rounded-xl disabled:opacity-40"
            title="Delete chat"
          >
            <Trash2 className="w-4 h-4 text-[var(--danger)]" />
          </button>
        </div>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {initialLoading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
          )}
          {messages.length === 0 && !loading && !initialLoading && (
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
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[var(--bg-secondary)]">
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                </div>
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
              onChange={onFileChange}
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
