const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function getShowBible(showId: number) {
  const res = await fetch(`${API}/shows/${showId}/bible`);
  if (!res.ok) throw new Error('Failed to fetch show bible');
  return res.json();
}

export async function getEpisodes(showId: number) {
  const res = await fetch(`${API}/shows/${showId}/episodes`);
  if (!res.ok) throw new Error('Failed to fetch episodes');
  return res.json();
}

export async function generateEpisode(showId: number) {
  const res = await fetch(`${API}/shows/${showId}/episodes/generate`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to generate episode');
  return res.json();
}

export async function getFlags(episodeId: number) {
  const res = await fetch(`${API}/episodes/${episodeId}/flags`);
  if (!res.ok) throw new Error('Failed to fetch flags');
  return res.json();
}
