import { Router } from 'express';
import pool from '../db/pool';
import { buildContextPacket } from '../services/contextPacket';

const router = Router();

router.post('/shows', async (req, res) => {
  try {
    const { title, genre, tone, premise } = req.body;
    const result = await pool.query(
      'INSERT INTO shows (title, genre, tone, premise) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, genre, tone, premise]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/shows/:id/characters', async (req, res) => {
  try {
    const showId = parseInt(req.params.id);
    const { name, traits, voice_notes, relationship_map, arc_status } = req.body;
    const result = await pool.query(
      'INSERT INTO characters (show_id, name, traits, voice_notes, relationship_map, arc_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [showId, name, traits || [], voice_notes || '', relationship_map || {}, arc_status || 'emerging']
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/shows/:id/threads', async (req, res) => {
  try {
    const showId = parseInt(req.params.id);
    const { description, status } = req.body;
    const result = await pool.query(
      'INSERT INTO plot_threads (show_id, description, status) VALUES ($1, $2, $3) RETURNING *',
      [showId, description, status || 'open']
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/shows/:id/bible', async (req, res) => {
  try {
    const showId = parseInt(req.params.id);
    const showResult = await pool.query('SELECT * FROM shows WHERE id = $1', [showId]);
    if (showResult.rows.length === 0) {
      res.status(404).json({ error: 'Show not found' });
      return;
    }
    const show = showResult.rows[0];
    const chars = await pool.query('SELECT * FROM characters WHERE show_id = $1', [showId]);
    const threads = await pool.query('SELECT * FROM plot_threads WHERE show_id = $1', [showId]);
    res.json({ show, characters: chars.rows, threads: threads.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/shows/:id/context-packet', async (req, res) => {
  try {
    const showId = parseInt(req.params.id);
    const packet = await buildContextPacket(showId);
    res.json(packet);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
