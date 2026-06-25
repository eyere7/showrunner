import pool from '../db/pool';

export async function buildContextPacket(showId: number) {
  const showResult = await pool.query('SELECT * FROM shows WHERE id = $1', [showId]);
  const show = showResult.rows[0];
  if (!show) throw new Error(`Show ${showId} not found`);

  const charsResult = await pool.query('SELECT name, traits, arc_status, voice_notes FROM characters WHERE show_id = $1', [showId]);
  const characters = charsResult.rows;

  const threadsResult = await pool.query("SELECT description, status FROM plot_threads WHERE show_id = $1 AND status = 'open'", [showId]);
  const threads = threadsResult.rows;

  const lastEpResult = await pool.query('SELECT * FROM episodes WHERE show_id = $1 ORDER BY episode_number DESC LIMIT 1', [showId]);
  const lastEp = lastEpResult.rows[0];

  let lastEpSummary: string;
  let nextEpNum: number;

  if (lastEp) {
    lastEpSummary = (lastEp.script || '').substring(0, 300);
    nextEpNum = lastEp.episode_number + 1;
  } else {
    lastEpSummary = 'This is episode 1 — no previous episodes.';
    nextEpNum = 1;
  }

  const packet = {
    show: { title: show.title, genre: show.genre, tone: show.tone, premise: show.premise },
    characters,
    threads,
    lastEpSummary,
    nextEpNum,
  };

  console.log('[contextPacket] Built packet for show', showId, '— episode', nextEpNum);
  return packet;
}
