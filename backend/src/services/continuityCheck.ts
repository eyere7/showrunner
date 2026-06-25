import dotenv from 'dotenv';
dotenv.config();

export async function checkContinuity(packet: any, newEpisode: any) {
  const endpoint = process.env.QWEN_ENDPOINT!;
  const apiKey = process.env.QWEN_API_KEY!;

  const systemPrompt = `You are a continuity editor. Compare the new episode script against the show bible below.
Find any contradictions:
- Character acting against their established traits
- Facts from previous episodes being ignored or reversed
- Open plot threads dropped without acknowledgement
- Tone inconsistent with the show's established tone

Return ONLY a valid JSON array. No markdown. No explanation:
[{"type": "character_contradiction|unresolved_thread|tone_drift", "description": "what's wrong", "severity": "high|medium|low"}]

If NO contradictions: return exactly []`;

  const userMessage = `Bible: ${JSON.stringify(packet)}\n\nNew episode: ${newEpisode.script}`;

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
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    console.error('[continuityCheck] Qwen API error:', response.status);
    return [];
  }

  const data = await response.json() as any;
  let content: string = data.choices[0].message.content;
  content = content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();

  try {
    return JSON.parse(content);
  } catch {
    console.error('[continuityCheck] Failed to parse response:', content);
    return [];
  }
}
