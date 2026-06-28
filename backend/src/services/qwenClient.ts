import dotenv from 'dotenv';
dotenv.config();

export async function generateEpisode(packet: any) {
  const endpoint = process.env.QWEN_ENDPOINT!;
  const apiKey = process.env.QWEN_API_KEY!;

  const characterBlock = packet.characters
    .map((c: any) => `${c.name} — traits: ${(c.traits || []).join(', ')}, current arc: ${c.arc_status}`)
    .join('\n');

  const threadBlock = packet.threads
    .map((t: any, i: number) => `${i + 1}. ${t.description}`)
    .join('\n');

  const systemPrompt = `You are a professional TV writer writing episode ${packet.nextEpNum} of '${packet.show.title}'.
Genre: ${packet.show.genre}. Tone: ${packet.show.tone}. Premise: ${packet.show.premise}.

Characters:
${characterBlock}

Open plot threads:
${threadBlock}

Episode history so far:
${packet.episodeHistory}

CRITICAL RULES:
- Do NOT repeat any scene, setting, or opening from previous episodes. Each episode MUST open in a DIFFERENT location with NEW dramatic circumstances.
- Advance the story meaningfully — introduce new conflicts, reveal secrets, shift alliances, or escalate stakes.
- Stay CONSISTENT with every character trait listed above.
- Advance at least one open plot thread.
- Vary the structure: not every episode needs to be a two-person conversation. Use different character combinations, locations (offices, markets, homes, vehicles, rooftops), and dramatic situations.

Write a 60-90 second episodic script.

Respond ONLY as valid JSON. No markdown. No backticks. No explanation before or after.
{
  "script": "full script here with character names and dialogue",
  "shot_list": [{"shot": 1, "framing": "CU", "action": "description", "dialogue": "line"}],
  "director_brief": "one paragraph of production notes"
}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'qwen-max',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate the next episode.' },
      ],
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Qwen API error ${response.status}: ${errText}`);
  }

  const data = await response.json() as any;
  console.log('[qwenClient] Raw response:', JSON.stringify(data).substring(0, 500));

  let content: string = data.choices[0].message.content;

  // Strip markdown fences if present
  content = content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();

  return JSON.parse(content);
}
