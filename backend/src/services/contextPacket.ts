import pool from '../db/pool';

export async function buildContextPacket(showId: number) {
  const showResult = await pool.query('SELECT * FROM shows WHERE id = $1', [showId]);
  const show = showResult.rows[0];
  if (!show) throw new Error(`Show ${showId} not found`);

  const charsResult = await pool.query('SELECT name, traits, arc_status, voice_notes FROM characters WHERE show_id = $1', [showId]);
  const characters = charsResult.rows;

  const threadsResult = await pool.query("SELECT description, status FROM plot_threads WHERE show_id = $1 AND status = 'open'", [showId]);
  const threads = threadsResult.rows;

  const allEpsResult = await pool.query('SELECT episode_number, script FROM episodes WHERE show_id = $1 ORDER BY episode_number ASC', [showId]);
  const allEpisodes = allEpsResult.rows;

  let episodeHistory: string;
  let nextEpNum: number;

  if (allEpisodes.length > 0) {
    episodeHistory = allEpisodes
      .map((ep: any) => `Episode ${ep.episode_number}: ${(ep.script || '').substring(0, 120).replace(/\n/g, ' ')}...`)
      .join('\n');
    nextEpNum = allEpisodes[allEpisodes.length - 1].episode_number + 1;
  } else {
    episodeHistory = 'No previous episodes. This is the series premiere.';
    nextEpNum = 1;
  }

  const packet = {
    show: { title: show.title, genre: show.genre, tone: show.tone, premise: show.premise },
    characters,
    threads,
    episodeHistory,
    nextEpNum,
  };

  console.log('[contextPacket] Built packet for show', showId, '— episode', nextEpNum);
  return packet;
}
