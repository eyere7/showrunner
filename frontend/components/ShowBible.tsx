'use client';

import { useState, useRef, useEffect } from 'react';
import {
  updateShow,
  updateCharacter,
  deleteCharacter,
  addCharacter,
  updateThread,
  deleteThread,
  addThread,
} from '../lib/api';

interface Character {
  id: number;
  name: string;
  traits: string[];
  arc_status: string;
  voice_notes?: string;
}

interface Thread {
  id: number;
  description: string;
  status: string;
}

interface Show {
  id: number;
  title: string;
  genre: string;
  tone: string;
  premise: string;
}

interface BibleData {
  show: Show;
  characters: Character[];
  threads: Thread[];
}

export default function ShowBible({
  bible,
  onUpdated,
}: {
  bible: BibleData;
  onUpdated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const [showDraft, setShowDraft] = useState({ ...bible.show });
  const [charsDraft, setCharsDraft] = useState(bible.characters.map((c) => ({ ...c, traits: [...c.traits] })));
  const [threadsDraft, setThreadsDraft] = useState(bible.threads.map((t) => ({ ...t })));
  const [newTraitInputs, setNewTraitInputs] = useState<Record<number, string>>({});
  const [newCharName, setNewCharName] = useState('');
  const [newThreadDesc, setNewThreadDesc] = useState('');

  useEffect(() => {
    if (!editing) {
      setShowDraft({ ...bible.show });
      setCharsDraft(bible.characters.map((c) => ({ ...c, traits: [...c.traits] })));
      setThreadsDraft(bible.threads.map((t) => ({ ...t })));
    }
  }, [bible, editing]);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [open, bible, editing, charsDraft, threadsDraft]);

  function startEdit(e: React.MouseEvent) {
    e.stopPropagation();
    if (!open) setOpen(true);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setNewCharName('');
    setNewThreadDesc('');
    setNewTraitInputs({});
  }

  async function saveAll() {
    setSaving(true);
    try {
      const orig = bible.show;
      const showUpdates: Record<string, any> = {};
      if (showDraft.title !== orig.title) showUpdates.title = showDraft.title;
      if (showDraft.genre !== orig.genre) showUpdates.genre = showDraft.genre;
      if (showDraft.tone !== orig.tone) showUpdates.tone = showDraft.tone;
      if (showDraft.premise !== orig.premise) showUpdates.premise = showDraft.premise;
      if (Object.keys(showUpdates).length > 0) {
        await updateShow(bible.show.id, showUpdates);
      }

      for (const char of charsDraft) {
        const origChar = bible.characters.find((c) => c.id === char.id);
        if (!origChar) continue;
        const charUpdates: Record<string, any> = {};
        if (char.name !== origChar.name) charUpdates.name = char.name;
        if (char.arc_status !== origChar.arc_status) charUpdates.arc_status = char.arc_status;
        if (JSON.stringify(char.traits) !== JSON.stringify(origChar.traits)) charUpdates.traits = char.traits;
        if (Object.keys(charUpdates).length > 0) {
          await updateCharacter(bible.show.id, char.id, charUpdates);
        }
      }

      for (const thread of threadsDraft) {
        const origThread = bible.threads.find((t) => t.id === thread.id);
        if (!origThread) continue;
        const threadUpdates: Record<string, any> = {};
        if (thread.description !== origThread.description) threadUpdates.description = thread.description;
        if (thread.status !== origThread.status) threadUpdates.status = thread.status;
        if (Object.keys(threadUpdates).length > 0) {
          await updateThread(bible.show.id, thread.id, threadUpdates);
        }
      }

      setEditing(false);
      onUpdated?.();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteChar(charId: number) {
    await deleteCharacter(bible.show.id, charId);
    setCharsDraft((prev) => prev.filter((c) => c.id !== charId));
    onUpdated?.();
  }

  async function handleAddChar() {
    if (!newCharName.trim()) return;
    await addCharacter(bible.show.id, { name: newCharName.trim(), traits: [], arc_status: 'emerging' });
    setNewCharName('');
    onUpdated?.();
  }

  async function handleDeleteThread(threadId: number) {
    await deleteThread(bible.show.id, threadId);
    setThreadsDraft((prev) => prev.filter((t) => t.id !== threadId));
    onUpdated?.();
  }

  async function handleAddThread() {
    if (!newThreadDesc.trim()) return;
    await addThread(bible.show.id, { description: newThreadDesc.trim(), status: 'open' });
    setNewThreadDesc('');
    onUpdated?.();
  }

  function removeTrait(charIdx: number, traitIdx: number) {
    setCharsDraft((prev) => {
      const next = [...prev];
      next[charIdx] = { ...next[charIdx], traits: next[charIdx].traits.filter((_, i) => i !== traitIdx) };
      return next;
    });
  }

  function addTraitToChar(charIdx: number) {
    const val = (newTraitInputs[charIdx] || '').trim();
    if (!val) return;
    setCharsDraft((prev) => {
      const next = [...prev];
      next[charIdx] = { ...next[charIdx], traits: [...next[charIdx].traits, val] };
      return next;
    });
    setNewTraitInputs((prev) => ({ ...prev, [charIdx]: '' }));
  }

  const inputClass =
    'bg-[var(--bg-void)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm px-2 py-1 w-full outline-none transition-colors duration-150 focus:border-[var(--accent)] focus:shadow-[0_0_0_1px_var(--accent-glow)]';

  return (
    <div className="border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div
        className="flex items-center justify-between p-4 md:p-5 transition-colors duration-150 cursor-pointer"
        style={{ transitionTimingFunction: 'var(--ease-out-quart)' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-raised)'}
        onMouseLeave={(e) => e.currentTarget.style.background = ''}
        onClick={() => { if (!editing) setOpen(!open); }}
      >
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
              {bible.show.title}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 tracking-wide uppercase">
              {bible.show.genre} &middot; {bible.show.tone}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!editing && open && (
            <button
              onClick={(e) => { e.stopPropagation(); startEdit(e); }}
              className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] tracking-wide uppercase transition-colors duration-150"
            >
              Edit
            </button>
          )}
          <span className="text-xs text-[var(--text-tertiary)] tracking-wide uppercase whitespace-nowrap flex items-center gap-1.5">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              className="transition-transform duration-200"
              style={{
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                transitionTimingFunction: 'var(--ease-out-quart)',
              }}
            >
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {open ? 'Hide Bible' : 'Show Bible'}
          </span>
        </div>
      </div>

      <div
        className="overflow-hidden"
        style={{
          maxHeight: open ? height + 200 + 'px' : '0px',
          transition: 'max-height 350ms var(--ease-out-expo)',
        }}
      >
        <div
          ref={contentRef}
          className="border-t border-[var(--border-subtle)] p-4 md:p-5 space-y-5"
          style={{
            opacity: open ? 1 : 0,
            transition: 'opacity 250ms var(--ease-out-quart)',
            transitionDelay: open ? '100ms' : '0ms',
          }}
        >
          {/* Premise */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-1.5 font-medium">
              Premise
            </h4>
            {editing ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    className={inputClass}
                    value={showDraft.title}
                    onChange={(e) => setShowDraft((s) => ({ ...s, title: e.target.value }))}
                    placeholder="Title"
                  />
                  <input
                    className={inputClass}
                    value={showDraft.genre}
                    onChange={(e) => setShowDraft((s) => ({ ...s, genre: e.target.value }))}
                    placeholder="Genre"
                  />
                  <input
                    className={inputClass}
                    value={showDraft.tone}
                    onChange={(e) => setShowDraft((s) => ({ ...s, tone: e.target.value }))}
                    placeholder="Tone"
                  />
                </div>
                <textarea
                  className={inputClass + ' min-h-[60px] resize-y'}
                  value={showDraft.premise}
                  onChange={(e) => setShowDraft((s) => ({ ...s, premise: e.target.value }))}
                  placeholder="Premise"
                />
              </div>
            ) : (
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed" style={{ maxWidth: '65ch' }}>
                {bible.show.premise}
              </p>
            )}
          </div>

          {/* Characters */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-3 font-medium">
              Characters
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(editing ? charsDraft : bible.characters).map((char, charIdx) => (
                <div
                  key={char.id}
                  className="border border-[var(--border-subtle)] bg-[var(--bg-void)] p-3 transition-colors duration-150"
                  style={{ transitionTimingFunction: 'var(--ease-out-quart)' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div className="flex items-center justify-between mb-2">
                    {editing ? (
                      <input
                        className={inputClass + ' !w-auto flex-1 mr-2'}
                        value={char.name}
                        onChange={(e) => {
                          setCharsDraft((prev) => {
                            const next = [...prev];
                            next[charIdx] = { ...next[charIdx], name: e.target.value };
                            return next;
                          });
                        }}
                      />
                    ) : (
                      <span className="font-medium text-sm text-[var(--text-primary)]">
                        {char.name}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      {editing ? (
                        <>
                          <select
                            className="bg-[var(--bg-void)] border border-[var(--border-default)] text-[var(--accent)] text-[10px] px-1.5 py-0.5 uppercase tracking-wide outline-none"
                            value={char.arc_status}
                            onChange={(e) => {
                              setCharsDraft((prev) => {
                                const next = [...prev];
                                next[charIdx] = { ...next[charIdx], arc_status: e.target.value };
                                return next;
                              });
                            }}
                          >
                            <option value="emerging">Emerging</option>
                            <option value="developing">Developing</option>
                            <option value="rising">Rising</option>
                            <option value="established">Established</option>
                            <option value="guarded">Guarded</option>
                            <option value="conflicted">Conflicted</option>
                          </select>
                          <button
                            onClick={() => handleDeleteChar(char.id)}
                            className="text-[var(--flag-red)] text-xs hover:opacity-80"
                            title="Delete character"
                          >
                            &#10005;
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/25 font-medium tracking-wide uppercase">
                          {char.arc_status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {char.traits.map((trait, traitIdx) => (
                      <span
                        key={traitIdx}
                        className="text-[10px] px-1.5 py-0.5 bg-[var(--bg-raised)] text-[var(--text-secondary)] border border-[var(--border-default)] flex items-center gap-1"
                      >
                        {trait}
                        {editing && (
                          <button
                            onClick={() => removeTrait(charIdx, traitIdx)}
                            className="text-[var(--text-tertiary)] hover:text-[var(--flag-red)] ml-0.5"
                          >
                            &#10005;
                          </button>
                        )}
                      </span>
                    ))}
                    {editing && (
                      <div className="flex items-center gap-1">
                        <input
                          className="bg-[var(--bg-void)] border border-[var(--border-default)] text-[var(--text-primary)] text-[10px] px-1.5 py-0.5 w-24 outline-none focus:border-[var(--accent)]"
                          placeholder="add trait"
                          value={newTraitInputs[charIdx] || ''}
                          onChange={(e) => setNewTraitInputs((prev) => ({ ...prev, [charIdx]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === 'Enter') addTraitToChar(charIdx); }}
                        />
                        <button
                          onClick={() => addTraitToChar(charIdx)}
                          className="text-[10px] text-[var(--accent)] hover:opacity-80"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {editing && (
              <div className="flex items-center gap-2 mt-3">
                <input
                  className={inputClass + ' !w-auto flex-1'}
                  placeholder="New character name"
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddChar(); }}
                />
                <button
                  onClick={handleAddChar}
                  className="text-xs px-3 py-1 bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
                >
                  + Character
                </button>
              </div>
            )}
          </div>

          {/* Threads */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-2 font-medium">
              Open Threads
            </h4>
            <ul className="space-y-1.5">
              {(editing ? threadsDraft : bible.threads).map((thread, i) => (
                <li
                  key={thread.id}
                  className="text-sm text-[var(--text-secondary)] flex items-start gap-2"
                >
                  <span className="text-[var(--amber)] mt-0.5">&#9670;</span>
                  {editing ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        className={inputClass + ' flex-1'}
                        value={thread.description}
                        onChange={(e) => {
                          setThreadsDraft((prev) => {
                            const next = [...prev];
                            next[i] = { ...next[i], description: e.target.value };
                            return next;
                          });
                        }}
                      />
                      <button
                        onClick={() => handleDeleteThread(thread.id)}
                        className="text-[var(--flag-red)] text-xs hover:opacity-80 shrink-0"
                        title="Delete thread"
                      >
                        &#10005;
                      </button>
                    </div>
                  ) : (
                    thread.description
                  )}
                </li>
              ))}
            </ul>
            {editing && (
              <div className="flex items-center gap-2 mt-3">
                <input
                  className={inputClass + ' !w-auto flex-1'}
                  placeholder="New plot thread"
                  value={newThreadDesc}
                  onChange={(e) => setNewThreadDesc(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddThread(); }}
                />
                <button
                  onClick={handleAddThread}
                  className="text-xs px-3 py-1 bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
                >
                  + Thread
                </button>
              </div>
            )}
          </div>

          {/* Save / Cancel */}
          {editing && (
            <div className="flex items-center gap-3 pt-2 border-t border-[var(--border-subtle)]">
              <button
                onClick={saveAll}
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
        </div>
      </div>
    </div>
  );
}
