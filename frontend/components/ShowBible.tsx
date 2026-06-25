'use client';

import { useState, useRef, useEffect } from 'react';

interface Character {
  name: string;
  traits: string[];
  arc_status: string;
  voice_notes?: string;
}

interface Thread {
  description: string;
  status: string;
}

interface Show {
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

export default function ShowBible({ bible }: { bible: BibleData }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [open, bible]);

  return (
    <div className="border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left transition-colors duration-150"
        style={{ transitionTimingFunction: 'var(--ease-out-quart)' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-raised)'}
        onMouseLeave={(e) => e.currentTarget.style.background = ''}
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
        <span
          className="text-xs text-[var(--text-tertiary)] tracking-wide uppercase whitespace-nowrap ml-4 flex items-center gap-1.5"
        >
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
      </button>

      <div
        className="overflow-hidden"
        style={{
          maxHeight: open ? height + 'px' : '0px',
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
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-1.5 font-medium">
              Premise
            </h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed" style={{ maxWidth: '65ch' }}>
              {bible.show.premise}
            </p>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-3 font-medium">
              Characters
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bible.characters.map((char, i) => (
                <div
                  key={char.name}
                  className="border border-[var(--border-subtle)] bg-[var(--bg-void)] p-3 transition-colors duration-150"
                  style={{
                    animationDelay: open ? `${150 + i * 50}ms` : '0ms',
                    transitionTimingFunction: 'var(--ease-out-quart)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-[var(--text-primary)]">
                      {char.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/25 font-medium tracking-wide uppercase">
                      {char.arc_status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {char.traits.map((trait) => (
                      <span
                        key={trait}
                        className="text-[10px] px-1.5 py-0.5 bg-[var(--bg-raised)] text-[var(--text-secondary)] border border-[var(--border-default)]"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-2 font-medium">
              Open Threads
            </h4>
            <ul className="space-y-1.5">
              {bible.threads.map((thread, i) => (
                <li
                  key={i}
                  className="text-sm text-[var(--text-secondary)] flex items-start gap-2"
                >
                  <span className="text-[var(--amber)] mt-0.5">&#9670;</span>
                  {thread.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
