'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getShows, createShow } from '../lib/api';

export default function Home() {
  const router = useRouter();
  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', genre: '', tone: '', premise: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getShows().then((data) => {
      setShows(data);
      setLoading(false);
    });
  }, []);

  async function handleCreate() {
    if (!form.title.trim() || !form.genre.trim() || !form.tone.trim() || !form.premise.trim()) return;
    setSaving(true);
    try {
      const show = await createShow(form);
      router.push(`/shows/${show.id}`);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
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
          Showrunner
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
            <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
              Create New Show
            </h3>
            <input
              className={inputClass}
              placeholder="Title (e.g. The Lagos Chronicles)"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
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
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreate}
                disabled={saving}
                className="text-xs px-4 py-1.5 bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Show'}
              </button>
              <button
                onClick={() => { setCreating(false); setForm({ title: '', genre: '', tone: '', premise: '' }); }}
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
