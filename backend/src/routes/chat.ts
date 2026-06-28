import { Router } from 'express';
import pool from '../db/pool';
import { chatWithAgent } from '../services/chatAgent';

const router = Router();

router.post('/shows/:id/chat', async (req, res) => {
  try {
    const showId = parseInt(req.params.id);
    const { message, conversationHistory } = req.body;

    await pool.query(
      'INSERT INTO chat_messages (show_id, role, content) VALUES ($1, $2, $3)',
      [showId, 'user', message]
    );

    const reply = await chatWithAgent(showId, message, conversationHistory || []);

    await pool.query(
      'INSERT INTO chat_messages (show_id, role, content) VALUES ($1, $2, $3)',
      [showId, 'assistant', reply]
    );

    const history = conversationHistory || [];
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: reply });

    res.json({ reply, updatedHistory: history });
  } catch (err: any) {
    console.error('[chat] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/shows/:id/chat/history', async (req, res) => {
  try {
    const showId = parseInt(req.params.id);
    const result = await pool.query(
      'SELECT * FROM chat_messages WHERE show_id = $1 ORDER BY created_at ASC',
      [showId]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
