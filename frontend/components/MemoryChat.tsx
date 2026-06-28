'use client';

import { useEffect, useRef, useState } from 'react';
import { sendChatMessage, getChatHistory } from '../lib/api';

interface Message {
  role: string;
  content: string;
}

export default function MemoryChat({ showId }: { showId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getChatHistory(showId).then((data: any[]) => {
      const msgs = data.map((m) => ({ role: m.role, content: m.content }));
      setMessages(msgs);
      setHistory(msgs);
    });
  }, [showId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setSending(true);

    try {
      const res = await sendChatMessage(showId, text, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
      setHistory(res.updatedHistory);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] shrink-0">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
          <span className="text-base">🧠</span> Memory Agent
        </h3>
        <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 tracking-wide uppercase">
          Ask about characters, episodes, or plot threads
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {messages.length === 0 && !sending && (
          <div className="text-center py-10">
            <p className="text-sm text-[var(--text-tertiary)]">
              Ask the Memory Agent anything about your show
            </p>
            <div className="mt-3 space-y-1.5">
              {[
                'What are the character traits?',
                'How many episodes so far?',
                'What threads are open?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="block mx-auto text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  &ldquo;{q}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[var(--accent)] text-white rounded-t-lg rounded-bl-lg'
                  : 'bg-[var(--bg-raised)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-t-lg rounded-br-lg'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-[var(--bg-raised)] border border-[var(--border-subtle)] px-3 py-2 rounded-t-lg rounded-br-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm">🧠</span>
                <span className="text-xs text-[var(--text-secondary)] animate-pulse">
                  Recalling memory...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-[var(--border-subtle)] shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your show..."
            disabled={sending}
            className="flex-1 bg-[var(--bg-void)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm px-3 py-2 outline-none transition-colors duration-150 focus:border-[var(--accent)] focus:shadow-[0_0_0_1px_var(--accent-glow)] disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="px-4 py-2 bg-[var(--accent)] text-white text-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
