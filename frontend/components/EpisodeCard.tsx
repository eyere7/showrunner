'use client';

import ContinuityFlagBadge from './ContinuityFlagBadge';

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
}: {
  episode: Episode;
  flags: Flag[];
}) {
  const shots: Shot[] =
    typeof episode.shot_list === 'string'
      ? JSON.parse(episode.shot_list)
      : episode.shot_list;

  const hasHighFlag = flags.some((f) => f.severity === 'high');

  return (
    <div
      className="border bg-[var(--bg-surface)] p-4 md:p-6"
      style={{
        borderColor: hasHighFlag ? 'var(--flag-red)' : 'var(--border-subtle)',
        animation: hasHighFlag ? 'flag-glow 2s ease-in-out 3' : 'none',
        transition: 'border-color 300ms var(--ease-out-quart)',
      }}
    >
      <div className="flex items-baseline gap-3 mb-5">
        <span className="font-mono text-sm text-[var(--amber)] font-medium">
          EP {String(episode.episode_number).padStart(2, '0')}
        </span>
        <h3 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          Episode {episode.episode_number}
        </h3>
      </div>

      <div className="mb-5">
        <h4 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-2 font-medium">
          Script
        </h4>
        <div className="bg-[var(--bg-void)] border border-[var(--border-subtle)] p-3 md:p-4 max-h-64 overflow-y-auto">
          <pre className="font-mono text-xs md:text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
            {episode.script}
          </pre>
        </div>
      </div>

      <div className="mb-5">
        <h4 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-2 font-medium">
          Shot List
        </h4>
        <div className="space-y-0">
          {shots.map((shot, i) => (
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
              <span className="font-mono text-[var(--accent)] w-10 shrink-0 uppercase text-[10px] md:text-xs pt-0.5">
                {shot.framing}
              </span>
              <span className="text-[var(--text-secondary)]">
                {shot.action}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--bg-raised)] border-l-2 border-[var(--accent)] p-3 md:p-4 mb-5">
        <h4 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-2 font-medium">
          Director&apos;s Brief
        </h4>
        <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed" style={{ maxWidth: '65ch' }}>
          {episode.director_brief}
        </p>
      </div>

      <ContinuityFlagBadge flags={flags} />
    </div>
  );
}
