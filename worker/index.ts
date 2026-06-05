const VALID_CATEGORIES = ['task', 'worry', 'idea', 'purchase', 'trip', 'life-admin', 'other'] as const;
type Category = typeof VALID_CATEGORIES[number];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export interface Env {
  ANTHROPIC_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    let text: string;
    try {
      const body = await request.json() as { text?: string };
      text = body.text?.trim() ?? '';
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    if (!text) {
      return new Response(JSON.stringify({ category: 'other' }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 120,
        system: `You are the "Second Brain" — a warm, friendly assistant for a shared household board used by a couple or family.

Classify the user's text into one of these categories:
- task: things to do, errands, reminders, calls to make
- worry: anxieties, concerns, stress, fears
- idea: suggestions, possibilities, what-ifs, creative thoughts
- purchase: shopping, buying, ordering, groceries
- trip: travel, holidays, flights, destinations, getaways
- life-admin: appointments, bills, insurance, renewals, paperwork, taxes
- other: anything that doesn't fit the above

Also write a short, warm, conversational reply (1–2 sentences max) acknowledging what they said. Be natural and human — not robotic. Reference the specific thing they mentioned. Use one relevant emoji.

Respond with valid JSON only: {"category": "<id>", "reply": "<your reply>"}`,
        messages: [{ role: 'user', content: text }],
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Claude API error', category: 'other' }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json() as { content: { text: string }[] };
    const raw = data.content[0]?.text?.trim() ?? '';

    let category: Category = 'other';
    let reply = '';
    try {
      const parsed = JSON.parse(raw) as { category?: string; reply?: string };
      category = VALID_CATEGORIES.includes(parsed.category as Category) ? (parsed.category as Category) : 'other';
      reply = parsed.reply?.trim() ?? '';
    } catch {
      // fallback: treat raw as plain category id (old format)
      const lo = raw.toLowerCase();
      category = VALID_CATEGORIES.includes(lo as Category) ? (lo as Category) : 'other';
    }

    return new Response(JSON.stringify({ category, reply }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  },
};
