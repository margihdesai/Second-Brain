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
        max_tokens: 20,
        system: `You are a classifier for a household shared board. Classify the user's text into exactly one of these categories and respond with only the category ID, nothing else:

- task: things to do, errands, reminders, calls to make
- worry: anxieties, concerns, stress, fears
- idea: suggestions, possibilities, what-ifs, creative thoughts
- purchase: shopping, buying, ordering, groceries
- trip: travel, holidays, flights, destinations, getaways
- life-admin: appointments, bills, insurance, renewals, paperwork, taxes
- other: anything that doesn't fit the above`,
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
    const raw = data.content[0]?.text?.trim().toLowerCase() ?? 'other';
    const category: Category = VALID_CATEGORIES.includes(raw as Category) ? (raw as Category) : 'other';

    return new Response(JSON.stringify({ category }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  },
};
