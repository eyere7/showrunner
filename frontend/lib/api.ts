const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function getShows() {
  const res = await fetch(`${API}/shows`);
  if (!res.ok) throw new Error('Failed to fetch shows');
  return res.json();
}

export async function suggestShow() {
  const res = await fetch(`${API}/shows/suggest`);
  if (!res.ok) throw new Error('Failed to get suggestion');
  return res.json();
}

export async function createShow(data: { title: string; genre: string; tone: string; premise: string }) {
  const res = await fetch(`${API}/shows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create show');
  return res.json();
}

export async function resetEpisodes(showId: number) {
  const res = await fetch(`${API}/shows/${showId}/episodes`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to reset episodes');
  return res.json();
}

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

export async function updateShow(showId: number, data: Record<string, any>) {
  const res = await fetch(`${API}/shows/${showId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update show');
  return res.json();
}

export async function updateCharacter(showId: number, charId: number, data: Record<string, any>) {
  const res = await fetch(`${API}/shows/${showId}/characters/${charId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update character');
  return res.json();
}

export async function deleteCharacter(showId: number, charId: number) {
  const res = await fetch(`${API}/shows/${showId}/characters/${charId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete character');
  return res.json();
}

export async function addCharacter(showId: number, data: Record<string, any>) {
  const res = await fetch(`${API}/shows/${showId}/characters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add character');
  return res.json();
}

export async function updateThread(showId: number, threadId: number, data: Record<string, any>) {
  const res = await fetch(`${API}/shows/${showId}/threads/${threadId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update thread');
  return res.json();
}

export async function deleteThread(showId: number, threadId: number) {
  const res = await fetch(`${API}/shows/${showId}/threads/${threadId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete thread');
  return res.json();
}

export async function addThread(showId: number, data: Record<string, any>) {
  const res = await fetch(`${API}/shows/${showId}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add thread');
  return res.json();
}

export async function updateEpisode(episodeId: number, data: Record<string, any>) {
  const res = await fetch(`${API}/episodes/${episodeId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update episode');
  return res.json();
}

export async function getFlags(episodeId: number) {
  const res = await fetch(`${API}/episodes/${episodeId}/flags`);
  if (!res.ok) throw new Error('Failed to fetch flags');
  return res.json();
}
