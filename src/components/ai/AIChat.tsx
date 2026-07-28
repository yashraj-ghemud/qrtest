'use client';

/**
 * AIChat — chat-style interface to the AI assistant (AI #10).
 * Uses session ID persisted in localStorage so conversations resume.
 * Suggested QR configs from the AI are applied with one click.
 */
import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Trash2, Wand2, X } from 'lucide-react';

export interface AISuggestion {
  suggestedCategory?: string;
  suggestedFields?: Record<string, string | boolean>;
  suggestedCustomization?: {
    foreground?: string;
    background?: string;
    template?: string;
    gradientFrom?: string;
    gradientTo?: string;
  };
  intent?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestion?: AISuggestion | null;
}

interface AIChatProps {
  onApplySuggestion: (s: AISuggestion) => void;
  onClose?: () => void;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  const key = 'qrcraft_session_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = (crypto as Crypto & { randomUUID?: () => string }).randomUUID?.() || Math.random().toString(36).slice(2);
    localStorage.setItem(key, id);
  }
  return id;
}

const SUGGESTIONS = [
  'Make a QR for my home WiFi',
  'Create a vCard for me — I am Aarav Sharma, software engineer at Acme',
  'QR for my Instagram @nasa',
  'QR that opens WhatsApp chat with +91 98765 43210',
];

export function AIChat({ onApplySuggestion, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  // Load prior conversation
  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/ai/chat?sessionId=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.conversation?.messages?.length) {
          const msgs: ChatMessage[] = data.conversation.messages
            .filter((m: { role: string }) => m.role === 'user' || m.role === 'assistant')
            .map((m: { id?: string; role: string; content: string; metaJson?: string | null }) => ({
              id: m.id || Math.random().toString(36),
              role: m.role as 'user' | 'assistant',
              content: m.content,
              suggestion: m.metaJson ? JSON.parse(m.metaJson) : null,
            }));
          setHistory(msgs);
        }
      })
      .catch(() => {});
  }, [sessionId]);

  const allMessages = [...history, ...messages];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setLoading(true);

    const userMsg: ChatMessage = {
      id: Math.random().toString(36),
      role: 'user',
      content: msg,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: msg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      const aiMsg: ChatMessage = {
        id: Math.random().toString(36),
        role: 'assistant',
        content: data.message || data.fallback || 'Sorry, something went wrong.',
        suggestion: data.suggestion,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      const aiMsg: ChatMessage = {
        id: Math.random().toString(36),
        role: 'assistant',
        content:
          (e as Error).message + '. Make sure GROQ_API_KEY is set in .env',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = async () => {
    if (!sessionId) return;
    await fetch(`/api/ai/chat?sessionId=${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
    });
    setHistory([]);
    setMessages([]);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">AI Assistant</div>
            <div className="text-[10px] text-slate-400">Remembers your QRs</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearConversation}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
            aria-label="Clear conversation"
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {allMessages.length === 0 && (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-800/50 p-3 text-sm text-slate-300">
              Hi! I&apos;m your QR assistant. Tell me what QR you want to make and I&apos;ll set it up for you.
            </div>
            <div className="space-y-1.5">
              <div className="text-xs uppercase tracking-wide text-slate-500">Try:</div>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 text-left text-xs text-slate-200 hover:border-cyan-400 hover:bg-slate-800"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {allMessages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-slate-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
              {m.suggestion && (
                <button
                  onClick={() => onApplySuggestion(m.suggestion!)}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                >
                  <Wand2 className="h-3 w-3" />
                  Apply this QR
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-300">
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '120ms' }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '240ms' }} />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-700 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Ask the AI to build a QR…"
            aria-label="Message the AI assistant"
            className="flex-1 resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-1.5 text-[10px] text-slate-500">
          Powered by gpt-oss-20b on Groq. Your conversation is saved on this server.
        </div>
      </div>
    </div>
  );
}
