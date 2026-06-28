'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getShows, createShow, suggestShow, addCharacter, addThread } from '../lib/api';

export default function Home() {
  const router = useRouter();
  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', genre: '', tone: '', premise: '' });
  const [suggestedChars, setSuggestedChars] = useState<any[]>([]);
  const [suggestedThreads, setSuggestedThreads] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === '1') setCreating(true);
    getShows().then((data) => {
      setShows(data);
      setLoading(false);
    });
  }, []);

  async function handleSuggest() {
    setSuggesting(true);
    try {
      const suggestion = await suggestShow();
      setForm({
        title: suggestion.title || '',
        genre: suggestion.genre || '',
        tone: suggestion.tone || '',
        premise: suggestion.premise || '',
      });
      setSuggestedChars(suggestion.characters || []);
      setSuggestedThreads(suggestion.threads || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSuggesting(false);
    }
  }

  async function handleCreate() {
    if (!form.title.trim() || !form.genre.trim() || !form.tone.trim() || !form.premise.trim()) return;
    setSaving(true);
    try {
      const show = await createShow(form);
      for (const char of suggestedChars) {
        await addCharacter(show.id, { name: char.name, traits: char.traits || [], arc_status: char.arc_status || 'emerging' });
      }
      for (const thread of suggestedThreads) {
        await addThread(show.id, { description: thread.description, status: thread.status || 'open' });
      }
      router.push(`/shows/${show.id}`);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  }

  function clearForm() {
    setCreating(false);
    setForm({ title: '', genre: '', tone: '', premise: '' });
    setSuggestedChars([]);
    setSuggestedThreads([]);
  }

  const inputClass =
    'bg-[var(--bg-void)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm px-3 py-2 w-full outline-none transition-colors duration-150 focus:border-[var(--accent)] focus:shadow-[0_0_0_1px_var(--accent-glow)]';

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-void)]">
      <header className="border-b border-[var(--border-subtle)] px-6 py-4">
        <h1 className="text-sm font-semibold tracking-[0.2em] uppercase text-[var(--text-primary)]">
          DTLIBRARY'S
        </h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
            Your Shows
          </h2>
          {!creating && (
            <button
              onClick={() => setCreating(true)}
              className="text-xs px-4 py-1.5 bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors tracking-wide uppercase"
            >
              + New Show
            </button>
          )}
        </div>

        {creating && (
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
                Create New Show
              </h3>
              <button
                onClick={handleSuggest}
                disabled={suggesting}
                className="text-xs px-3 py-1 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors tracking-wide uppercase disabled:opacity-50"
              >
                {suggesting ? 'Thinking...' : 'Suggest with AI'}
              </button>
            </div>

            {suggesting && (
              <div className="flex items-center gap-2 py-3">
                <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-[var(--text-secondary)]">
                  Qwen is pitching you a series concept...
                </span>
              </div>
            )}

            <input
              className={inputClass}
              placeholder="Title (e.g. The Lagos Chronicles)"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className={inputClass}
                placeholder="Genre (e.g. drama)"
                value={form.genre}
                onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
              />
              <input
                className={inputClass}
                placeholder="Tone (e.g. gritty and real)"
                value={form.tone}
                onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value }))}
              />
            </div>
            <textarea
              className={inputClass + ' min-h-[80px] resize-y'}
              placeholder="Premise — what is this show about?"
              value={form.premise}
              onChange={(e) => setForm((f) => ({ ...f, premise: e.target.value }))}
            />

            {suggestedChars.length > 0 && (
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-2 font-medium">
                  Suggested Characters
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedChars.map((char, i) => (
                    <div key={i} className="border border-[var(--border-subtle)] bg-[var(--bg-void)] p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-[var(--text-primary)]">{char.name}</span>
                        <button
                          onClick={() => setSuggestedChars((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-[var(--text-tertiary)] hover:text-[var(--flag-red)] text-xs"
                        >
                          &#10005;
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(char.traits || []).map((trait: string, j: number) => (
                          <span key={j} className="text-[10px] px-1.5 py-0.5 bg-[var(--bg-raised)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {suggestedThreads.length > 0 && (
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-2 font-medium">
                  Suggested Plot Threads
                </h4>
                <ul className="space-y-1.5">
                  {suggestedThreads.map((thread, i) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                      <span className="text-[var(--amber)] mt-0.5">&#9670;</span>
                      <span className="flex-1">{thread.description}</span>
                      <button
                        onClick={() => setSuggestedThreads((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-[var(--text-tertiary)] hover:text-[var(--flag-red)] text-xs shrink-0"
                      >
                        &#10005;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleCreate}
                disabled={saving}
                className="text-xs px-4 py-1.5 bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Show'}
              </button>
              <button
                onClick={clearForm}
                className="text-xs px-4 py-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {shows.length === 0 && !creating ? (
          <div className="text-center py-20">
            <p className="text-[var(--text-secondary)] text-lg mb-2">
              No shows yet
            </p>
            <p className="text-[var(--text-tertiary)] text-sm">
              Create your first show to start writing
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {shows.map((show: any) => (
              <button
                key={show.id}
                onClick={() => router.push(`/shows/${show.id}`)}
                className="w-full text-left border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 transition-colors duration-150 hover:border-[var(--border-default)] hover:bg-[var(--bg-raised)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
                      {show.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 tracking-wide uppercase">
                      {show.genre} &middot; {show.tone}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" className="text-[var(--text-tertiary)]">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
