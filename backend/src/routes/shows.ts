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

router.patch('/shows/:id', async (req, res) => {
  try {
    const showId = parseInt(req.params.id);
    const { title, genre, tone, premise } = req.body;
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
    if (genre !== undefined) { fields.push(`genre = $${idx++}`); values.push(genre); }
    if (tone !== undefined) { fields.push(`tone = $${idx++}`); values.push(tone); }
    if (premise !== undefined) { fields.push(`premise = $${idx++}`); values.push(premise); }
    if (fields.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }
    values.push(showId);
    const result = await pool.query(
      `UPDATE shows SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/shows/:id/characters/:charId', async (req, res) => {
  try {
    const charId = parseInt(req.params.charId);
    const { name, traits, arc_status, voice_notes } = req.body;
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (traits !== undefined) { fields.push(`traits = $${idx++}`); values.push(traits); }
    if (arc_status !== undefined) { fields.push(`arc_status = $${idx++}`); values.push(arc_status); }
    if (voice_notes !== undefined) { fields.push(`voice_notes = $${idx++}`); values.push(voice_notes); }
    if (fields.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }
    values.push(charId);
    const result = await pool.query(
      `UPDATE characters SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/shows/:id/characters/:charId', async (req, res) => {
  try {
    const charId = parseInt(req.params.charId);
    await pool.query('DELETE FROM characters WHERE id = $1', [charId]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/shows/:id/threads/:threadId', async (req, res) => {
  try {
    const threadId = parseInt(req.params.threadId);
    const { description, status } = req.body;
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status); }
    if (fields.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }
    values.push(threadId);
    const result = await pool.query(
      `UPDATE plot_threads SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/shows/:id/threads/:threadId', async (req, res) => {
  try {
    const threadId = parseInt(req.params.threadId);
    await pool.query('DELETE FROM plot_threads WHERE id = $1', [threadId]);
    res.json({ success: true });
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
