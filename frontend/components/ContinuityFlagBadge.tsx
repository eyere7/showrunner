'use client';

import { useState } from 'react';

interface Flag {
  type?: string;
  flag_type?: string;
  description: string;
  severity: string;
}

export default function ContinuityFlagBadge({ flags }: { flags: Flag[] }) {
  const [expanded, setExpanded] = useState(false);

  if (!flags || flags.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--flag-green)]" />
        No continuity issues
      </div>
    );
  }

  const hasHigh = flags.some((f) => f.severity === 'high');
  const hasMedium = flags.some((f) => f.severity === 'medium');

  const dotColor = hasHigh
    ? 'bg-[var(--flag-red)]'
    : hasMedium
      ? 'bg-[var(--flag-yellow)]'
      : 'bg-[var(--flag-green)]';

  const textColor = hasHigh
    ? 'text-[var(--flag-red)]'
    : hasMedium
      ? 'text-[var(--flag-yellow)]'
      : 'text-[var(--flag-green)]';

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs group"
        style={{ transition: 'opacity 150ms var(--ease-out-quart)' }}
      >
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${dotColor}`}
          style={{
            boxShadow: hasHigh ? '0 0 6px 1px rgba(220, 38, 38, 0.4)' : 'none',
          }}
        />
        <span className={`${textColor} font-medium`}>
          {flags.length} {hasHigh ? 'issue' : 'note'}{flags.length !== 1 ? 's' : ''} found
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          className="text-[var(--text-tertiary)]"
          style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms var(--ease-out-quart)',
          }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <div
          className="mt-2 space-y-1.5 pl-3.5 border-l border-[var(--border-subtle)] flag-details-enter"
        >
          {flags.map((flag, i) => {
            const severity = flag.severity;
            const color =
              severity === 'high'
                ? 'text-[var(--flag-red)]'
                : severity === 'medium'
                  ? 'text-[var(--flag-yellow)]'
                  : 'text-[var(--flag-green)]';
            return (
              <div
                key={i}
                className={`text-xs p-2 ${color}`}
                style={{
                  backgroundColor: severity === 'high' ? 'rgba(220, 38, 38, 0.06)' : 'transparent',
                  animation: `fade-in 200ms var(--ease-out-quart) ${i * 50}ms both`,
                }}
              >
                <span className="font-mono text-[10px] uppercase opacity-60">
                  {flag.flag_type || flag.type}
                </span>
                <span className="mx-1.5 text-[var(--text-tertiary)]">&middot;</span>
                {flag.description}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
