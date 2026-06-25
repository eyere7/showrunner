'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getShowBible, getEpisodes, getFlags } from '../../../lib/api';
import ShowBible from '../../../components/ShowBible';
import EpisodeCard from '../../../components/EpisodeCard';
import EpisodeCardSkeleton from '../../../components/EpisodeCardSkeleton';
import GenerateEpisodeButton from '../../../components/GenerateEpisodeButton';

export default function ShowDashboard() {
  const params = useParams();
  const showId = Number(params.id);

  const [bible, setBible] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [episodeFlags, setEpisodeFlags] = useState<Record<number, any[]>>({});
  const [generating, setGenerating] = useState(false);
  const [newEpisodeId, setNewEpisodeId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    const [bibleData, episodesData] = await Promise.all([
      getShowBible(showId),
      getEpisodes(showId),
    ]);
    setBible(bibleData);
    setEpisodes(episodesData);

    const flagsMap: Record<number, any[]> = {};
    await Promise.all(
      episodesData.map(async (ep: any) => {
        const flags = await getFlags(ep.id);
        flagsMap[ep.id] = flags;
      })
    );
    setEpisodeFlags(flagsMap);
  }, [showId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleGenerating() {
    setGenerating(true);
  }

  function handleGenerated(data: { episode: any; flags: any[] }) {
    setEpisodes((prev) => [...prev, data.episode]);
    setEpisodeFlags((prev) => ({ ...prev, [data.episode.id]: data.flags }));
    setNewEpisodeId(data.episode.id);
    setGenerating(false);
    setTimeout(() => setNewEpisodeId(null), 600);
  }

  if (!bible) {
    return (
      <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-secondary)] text-sm tracking-wide">
            Loading show data
          </p>
        </div>
      </div>
    );
  }

  const sortedEpisodes = [...episodes].sort(
    (a, b) => b.episode_number - a.episode_number
  );

  return (
    <div className="min-h-screen bg-[var(--bg-void)]">
      <header className="border-b border-[var(--border-subtle)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold tracking-[0.2em] uppercase text-[var(--text-primary)]">
            Showrunner
          </h1>
          <span className="text-[var(--text-tertiary)]">/</span>
          <span className="text-sm text-[var(--text-secondary)]">
            {bible.show.title}
          </span>
        </div>
        <span className="text-xs text-[var(--text-tertiary)] font-mono">
          {episodes.length} episode{episodes.length !== 1 ? 's' : ''}
        </span>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <ShowBible bible={bible} />

        <GenerateEpisodeButton
          showId={showId}
          onGenerating={handleGenerating}
          onGenerated={handleGenerated}
        />

        {generating && <EpisodeCardSkeleton />}

        {sortedEpisodes.length === 0 && !generating ? (
          <div className="text-center py-20">
            <p className="text-[var(--text-secondary)] text-lg mb-2">
              No episodes yet
            </p>
            <p className="text-[var(--text-tertiary)] text-sm">
              Generate above to write the first one
            </p>
          </div>
        ) : (
          <div>
            {sortedEpisodes.map((ep, i) => (
              <div key={ep.id}>
                {i > 0 && <div className="film-strip" />}
                <div className={ep.id === newEpisodeId ? 'episode-enter' : ''}>
                  <EpisodeCard
                    episode={ep}
                    flags={episodeFlags[ep.id] || []}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
