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

  const systemPrompt = `You are a professional showrunner writing episode ${packet.nextEpNum} of '${packet.show.title}'.
Genre: ${packet.show.genre}. Tone: ${packet.show.tone}. Premise: ${packet.show.premise}.

Characters:
${characterBlock}

Open plot threads:
${threadBlock}

Previous episode: ${packet.lastEpSummary}

Write a 60-90 second episodic script that stays CONSISTENT with every character trait listed above and advances at least one open plot thread.

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
      temperature: 0.8,
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
