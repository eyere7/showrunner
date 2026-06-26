'use client';

import { useState } from 'react';
import ContinuityFlagBadge from './ContinuityFlagBadge';
import { updateEpisode } from '../lib/api';

interface Shot {
  shot: number;
  framing: string;
  action: string;
  dialogue?: string;
}

interface Flag {
  type: string;
  description: string;
  severity: string;
}

interface Episode {
  id: number;
  episode_number: number;
  script: string;
  shot_list: Shot[];
  director_brief: string;
}

export default function EpisodeCard({
  episode,
  flags,
  onUpdated,
}: {
  episode: Episode;
  flags: Flag[];
  onUpdated?: () => void;
}) {
  const shots: Shot[] =
    typeof episode.shot_list === 'string'
      ? JSON.parse(episode.shot_list)
      : episode.shot_list;

  const hasHighFlag = flags.some((f) => f.severity === 'high');

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scriptDraft, setScriptDraft] = useState(episode.script);
  const [briefDraft, setBriefDraft] = useState(episode.director_brief);
  const [shotsDraft, setShotsDraft] = useState<Shot[]>(shots);

  function startEdit() {
    setScriptDraft(episode.script);
    setBriefDraft(episode.director_brief);
    setShotsDraft(shots.map((s) => ({ ...s })));
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  async function saveEdit() {
    setSaving(true);
    try {
      const updates: Record<string, any> = {};
      if (scriptDraft !== episode.script) updates.script = scriptDraft;
      if (briefDraft !== episode.director_brief) updates.director_brief = briefDraft;
      if (JSON.stringify(shotsDraft) !== JSON.stringify(shots)) updates.shot_list = shotsDraft;
      if (Object.keys(updates).length > 0) {
        await updateEpisode(episode.id, updates);
      }
      setEditing(false);
      onUpdated?.();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'bg-[var(--bg-void)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm px-2 py-1 w-full outline-none transition-colors duration-150 focus:border-[var(--accent)] focus:shadow-[0_0_0_1px_var(--accent-glow)]';

  return (
    <div
      className="border bg-[var(--bg-surface)] p-4 md:p-6"
      style={{
        borderColor: hasHighFlag ? 'var(--flag-red)' : 'var(--border-subtle)',
        animation: hasHighFlag ? 'flag-glow 2s ease-in-out 3' : 'none',
        transition: 'border-color 300ms var(--ease-out-quart)',
      }}
    >
      <div className="flex items-baseline justify-between mb-5">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-sm text-[var(--amber)] font-medium">
            EP {String(episode.episode_number).padStart(2, '0')}
          </span>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
            Episode {episode.episode_number}
          </h3>
        </div>
        {!editing && (
          <button
            onClick={startEdit}
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] tracking-wide uppercase transition-colors duration-150"
          >
            Edit
          </button>
        )}
      </div>

      {/* Script */}
      <div className="mb-5">
        <h4 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-2 font-medium">
          Script
        </h4>
        {editing ? (
          <textarea
            className={inputClass + ' font-mono text-xs md:text-sm min-h-[200px] resize-y leading-relaxed p-3 md:p-4'}
            value={scriptDraft}
            onChange={(e) => setScriptDraft(e.target.value)}
          />
        ) : (
          <div className="bg-[var(--bg-void)] border border-[var(--border-subtle)] p-3 md:p-4 max-h-64 overflow-y-auto">
            <pre className="font-mono text-xs md:text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
              {episode.script}
            </pre>
          </div>
        )}
      </div>

      {/* Shot List */}
      <div className="mb-5">
        <h4 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-2 font-medium">
          Shot List
        </h4>
        <div className="space-y-0">
          {(editing ? shotsDraft : shots).map((shot, i) => (
            <div
              key={i}
              className="flex items-start gap-3 text-xs md:text-sm py-1.5 border-b border-[var(--border-subtle)] last:border-0"
              style={{
                transition: 'background-color 100ms var(--ease-out-quart)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-raised)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
            >
              <span className="font-mono text-[var(--amber)] w-6 shrink-0 text-right font-medium">
                {String(shot.shot).padStart(2, '0')}
              </span>
              {editing ? (
                <>
                  <input
                    className="bg-transparent border-b border-[var(--border-default)] text-[var(--accent)] font-mono w-12 shrink-0 uppercase text-[10px] md:text-xs outline-none focus:border-[var(--accent)]"
                    value={shot.framing}
                    onChange={(e) => {
                      setShotsDraft((prev) => {
                        const next = [...prev];
                        next[i] = { ...next[i], framing: e.target.value };
                        return next;
                      });
                    }}
                  />
                  <input
                    className="bg-transparent border-b border-[var(--border-default)] text-[var(--text-secondary)] flex-1 outline-none focus:border-[var(--accent)] text-xs md:text-sm"
                    value={shot.action}
                    onChange={(e) => {
                      setShotsDraft((prev) => {
                        const next = [...prev];
                        next[i] = { ...next[i], action: e.target.value };
                        return next;
                      });
                    }}
                  />
                </>
              ) : (
                <>
                  <span className="font-mono text-[var(--accent)] w-10 shrink-0 uppercase text-[10px] md:text-xs pt-0.5">
                    {shot.framing}
                  </span>
                  <span className="text-[var(--text-secondary)]">
                    {shot.action}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Director's Brief */}
      <div className="bg-[var(--bg-raised)] border-l-2 border-[var(--accent)] p-3 md:p-4 mb-5">
        <h4 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-2 font-medium">
          Director&apos;s Brief
        </h4>
        {editing ? (
          <textarea
            className="bg-transparent border border-[var(--border-default)] text-[var(--text-secondary)] text-xs md:text-sm w-full min-h-[80px] resize-y leading-relaxed p-2 outline-none focus:border-[var(--accent)]"
            style={{ maxWidth: '65ch' }}
            value={briefDraft}
            onChange={(e) => setBriefDraft(e.target.value)}
          />
        ) : (
          <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed" style={{ maxWidth: '65ch' }}>
            {episode.director_brief}
          </p>
        )}
      </div>

      {/* Save / Cancel */}
      {editing && (
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={saveEdit}
            disabled={saving}
            className="text-xs px-4 py-1.5 bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={cancelEdit}
            className="text-xs px-4 py-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      <ContinuityFlagBadge flags={flags} />
    </div>
  );
}
