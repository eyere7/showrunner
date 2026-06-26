import { Router } from 'express';
import pool from '../db/pool';
import { buildContextPacket } from '../services/contextPacket';
import { generateEpisode } from '../services/qwenClient';
import { checkContinuity } from '../services/continuityCheck';

const router = Router();

// Test generation — no DB save
router.post('/shows/:id/generate-test', async (req, res) => {
  try {
    const showId = parseInt(req.params.id);
    const packet = await buildContextPacket(showId);
    const episode = await generateEpisode(packet);
    res.json(episode);
  } catch (err: any) {
    console.error('[generate-test] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Full pipeline: generate → save → check continuity → save flags → return
router.post('/shows/:id/episodes/generate', async (req, res) => {
  try {
    const showId = parseInt(req.params.id);

    const packet = await buildContextPacket(showId);
    const episode = await generateEpisode(packet);

    const epResult = await pool.query(
      'INSERT INTO episodes (show_id, episode_number, script, shot_list, director_brief) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [showId, packet.nextEpNum, episode.script, JSON.stringify(episode.shot_list), episode.director_brief]
    );
    const savedEpisode = epResult.rows[0];

    const flags = await checkContinuity(packet, episode);

    for (const flag of flags) {
      await pool.query(
        'INSERT INTO continuity_flags (episode_id, flag_type, description, severity) VALUES ($1, $2, $3, $4)',
        [savedEpisode.id, flag.type, flag.description, flag.severity]
      );
    }

    res.json({ episode: savedEpisode, flags });
  } catch (err: any) {
    console.error('[generate] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// List all episodes for a show
router.get('/shows/:id/episodes', async (req, res) => {
  try {
    const showId = parseInt(req.params.id);
    const result = await pool.query('SELECT * FROM episodes WHERE show_id = $1 ORDER BY episode_number', [showId]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update an episode and re-check continuity
router.patch('/episodes/:id', async (req, res) => {
  try {
    const episodeId = parseInt(req.params.id);
    const { script, director_brief, shot_list } = req.body;
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (script !== undefined) { fields.push(`script = $${idx++}`); values.push(script); }
    if (director_brief !== undefined) { fields.push(`director_brief = $${idx++}`); values.push(director_brief); }
    if (shot_list !== undefined) { fields.push(`shot_list = $${idx++}`); values.push(JSON.stringify(shot_list)); }
    if (fields.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }
    values.push(episodeId);
    const result = await pool.query(
      `UPDATE episodes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    const updatedEpisode = result.rows[0];

    // Re-run continuity check against the show bible
    await pool.query('DELETE FROM continuity_flags WHERE episode_id = $1', [episodeId]);
    const packet = await buildContextPacket(updatedEpisode.show_id);
    const flags = await checkContinuity(packet, {
      script: updatedEpisode.script,
      shot_list: updatedEpisode.shot_list,
      director_brief: updatedEpisode.director_brief,
    });
    for (const flag of flags) {
      await pool.query(
        'INSERT INTO continuity_flags (episode_id, flag_type, description, severity) VALUES ($1, $2, $3, $4)',
        [episodeId, flag.type, flag.description, flag.severity]
      );
    }

    res.json({ episode: updatedEpisode, flags });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all episodes for a show (reset)
router.delete('/shows/:id/episodes', async (req, res) => {
  try {
    const showId = parseInt(req.params.id);
    await pool.query(
      'DELETE FROM continuity_flags WHERE episode_id IN (SELECT id FROM episodes WHERE show_id = $1)',
      [showId]
    );
    await pool.query('DELETE FROM episodes WHERE show_id = $1', [showId]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get flags for an episode
router.get('/episodes/:id/flags', async (req, res) => {
  try {
    const episodeId = parseInt(req.params.id);
    const result = await pool.query('SELECT * FROM continuity_flags WHERE episode_id = $1', [episodeId]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
