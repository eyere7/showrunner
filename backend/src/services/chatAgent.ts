import dotenv from 'dotenv';
dotenv.config();

import { buildContextPacket } from './contextPacket';
import pool from '../db/pool';

export async function chatWithAgent(
  showId: number,
  userMessage: string,
  conversationHistory: { role: string; content: string }[]
) {
  const endpoint = process.env.QWEN_ENDPOINT!;
  const apiKey = process.env.QWEN_API_KEY!;

  const packet = await buildContextPacket(showId);

  const charactersBlock = packet.characters
    .map((c: any) => `- ${c.name} [traits: ${(c.traits || []).join(', ')}] [arc: ${c.arc_status}]${c.voice_notes ? ` [voice: ${c.voice_notes}]` : ''}`)
    .join('\n');

  const threadsBlock = packet.threads
    .map((t: any) => `- ${t.description} (${t.status})`)
    .join('\n');

  const epCount = await pool.query(
    'SELECT COUNT(*) FROM episodes WHERE show_id = $1',
    [showId]
  );

  const lastEp = await pool.query(
    'SELECT episode_number, script FROM episodes WHERE show_id = $1 ORDER BY episode_number DESC LIMIT 1',
    [showId]
  );
  const lastEpSummary = lastEp.rows.length > 0
    ? `Episode ${lastEp.rows[0].episode_number}: ${(lastEp.rows[0].script || '').substring(0, 200).replace(/\n/g, ' ')}...`
    : 'No episodes written yet.';

  const systemPrompt = `You are the Showrunner Memory Agent for '${packet.show.title}'. You have persistent memory of this show stored in a database.

Your memory contains:
Characters:
${charactersBlock || '(none yet)'}

Open plot threads:
${threadsBlock || '(none yet)'}

Episodes written so far: ${epCount.rows[0].count}
Last episode summary: ${lastEpSummary}

Show details:
- Genre: ${packet.show.genre}
- Tone: ${packet.show.tone}
- Premise: ${packet.show.premise}

Answer any question the user asks about this show using your memory. If asked about a character, thread, or past episode — recall it accurately. If the user wants to UPDATE something in memory (e.g. change a character trait, update arc status), confirm what you are updating and tell them it has been saved.

When the user asks to update something, respond with a JSON action block at the END of your reply on its own line, in this exact format:
%%%ACTION:{"type":"update_character","name":"CharName","fields":{"arc_status":"resolved"}}%%%
%%%ACTION:{"type":"update_character","name":"CharName","fields":{"traits":["trait1","trait2"]}}%%%
%%%ACTION:{"type":"update_thread","description":"thread text","fields":{"status":"resolved"}}%%%

Always reference your memory explicitly in answers — say "From my memory of this show..." or "I recall that..." to demonstrate active recall.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'qwen-max',
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Qwen API error ${response.status}: ${errText}`);
  }

  const data = await response.json() as any;
  let reply: string = data.choices[0].message.content;

  // Process any ACTION blocks for DB mutations
  const actionRegex = /%%%ACTION:(.*?)%%%/g;
  let match;
  while ((match = actionRegex.exec(reply)) !== null) {
    try {
      const action = JSON.parse(match[1]);
      await executeAction(showId, action);
    } catch (err) {
      console.error('[chatAgent] Failed to execute action:', err);
    }
  }

  // Strip action blocks from the reply shown to the user
  reply = reply.replace(/%%%ACTION:.*?%%%/g, '').trim();

  return reply;
}

async function executeAction(showId: number, action: any) {
  if (action.type === 'update_character') {
    const charResult = await pool.query(
      'SELECT id FROM characters WHERE show_id = $1 AND LOWER(name) = LOWER($2)',
      [showId, action.name]
    );
    if (charResult.rows.length === 0) return;
    const charId = charResult.rows[0].id;
    const fields = action.fields;
    if (fields.arc_status) {
      await pool.query('UPDATE characters SET arc_status = $1 WHERE id = $2', [fields.arc_status, charId]);
    }
    if (fields.traits) {
      await pool.query('UPDATE characters SET traits = $1 WHERE id = $2', [fields.traits, charId]);
    }
    if (fields.name) {
      await pool.query('UPDATE characters SET name = $1 WHERE id = $2', [fields.name, charId]);
    }
    console.log(`[chatAgent] Updated character ${action.name}:`, fields);
  } else if (action.type === 'update_thread') {
    const threadResult = await pool.query(
      'SELECT id FROM plot_threads WHERE show_id = $1 AND LOWER(description) LIKE LOWER($2)',
      [showId, `%${action.description.substring(0, 50)}%`]
    );
    if (threadResult.rows.length === 0) return;
    const threadId = threadResult.rows[0].id;
    if (action.fields.status) {
      await pool.query('UPDATE plot_threads SET status = $1 WHERE id = $2', [action.fields.status, threadId]);
    }
    console.log(`[chatAgent] Updated thread:`, action.fields);
  }
}
