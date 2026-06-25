'use client';

import { useState, useRef } from 'react';
import { generateEpisode } from '../lib/api';

interface Props {
  showId: number;
  onGenerating: () => void;
  onGenerated: (data: { episode: any; flags: any[] }) => void;
}

export default function GenerateEpisodeButton({
  showId,
  onGenerating,
  onGenerated,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    onGenerating();
    try {
      const data = await generateEpisode(showId);
      onGenerated(data);
    } catch {
      setError('Generation failed — try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        ref={btnRef}
        onClick={handleClick}
        disabled={loading}
        className="px-6 py-3 bg-[var(--accent)] text-white text-sm font-medium tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          transition: 'transform 100ms var(--ease-out-quart), box-shadow 250ms var(--ease-out-quart), background-color 150ms',
          animation: !loading ? 'gentle-pulse 3s ease-in-out infinite' : 'none',
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
            e.currentTarget.style.transform = 'scale(1.02)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onMouseDown={(e) => {
          if (!loading) e.currentTarget.style.transform = 'scale(0.97)';
        }}
        onMouseUp={(e) => {
          if (!loading) e.currentTarget.style.transform = 'scale(1.02)';
        }}
      >
        {loading ? (
          <span className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Writing episode
          </span>
        ) : (
          'Generate Next Episode'
        )}
      </button>

      {loading && (
        <div className="mt-3 w-64">
          <div className="h-0.5 bg-[var(--border-subtle)] overflow-hidden">
            <div
              className="h-full bg-[var(--accent)]"
              style={{ animation: 'writing-bar 30s ease-out forwards' }}
            />
          </div>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5 tracking-wide font-mono">
            context packet → qwen → continuity check
          </p>
        </div>
      )}

      {error && (
        <p
          className="mt-2 text-sm text-[var(--flag-red)]"
          style={{ animation: 'fade-in 200ms var(--ease-out-quart)' }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
