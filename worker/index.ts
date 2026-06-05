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

interface BoardEntry { text: string; category: string; author: string; completed: boolean; }
interface RequestBody {
  text: string;
  partner?: string;
  history?: string[];
  entries?: BoardEntry[];
}

function buildBoardSummary(entries: BoardEntry[]): string {
  const active = entries.filter(e => !e.completed);
  if (!active.length) return '(empty)';
  const byCategory: Record<string, string[]> = {};
  for (const e of active) {
    (byCategory[e.category] ??= []).push(`"${e.text}" (${e.author})`);
  }
  return Object.entries(byCategory).map(([cat, items]) => `${cat}: ${items.join(', ')}`).join('\n');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

    let body: RequestBody;
    try {
      body = await request.json() as RequestBody;
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    const text = body.text?.trim() ?? '';
    if (!text) return new Response(JSON.stringify({ intent: 'chat', reply: '' }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });

    const boardSummary = buildBoardSummary(body.entries ?? []);
    const historyStr = (body.history ?? []).join('\n');
    const partner = body.partner ?? 'User';
    const completedCount = (body.entries ?? []).filter(e => e.completed).length;

    const systemPrompt = `You are "Second Brain" — a warm, smart assistant for a shared household board used by a couple or family. The current user is ${partner}.

Active board items:
${boardSummary}
(${completedCount} completed)

${historyStr ? `Recent conversation:\n${historyStr}\n` : ''}
Your job: understand what the user means and respond helpfully.

Decide the intent of their latest message:
- "add": they want to add a new item to the board (even if phrased casually like "we're running low on milk")
- "query": they're asking about what's on the board (counts, lists, summaries, follow-up questions about items)
- "chat": casual conversation — greetings, reactions ("nice", "ok", "cool"), thanks, or anything unrelated to the board

For "add": pick a category (task/worry/idea/purchase/trip/life-admin/other) and write a warm 1–2 sentence reply that references what they said.
For "query": answer specifically from the board data above. If it's a follow-up ("what is it?", "show me"), use the conversation context to know what they're referring to.
For "chat": reply naturally and briefly.

Return valid JSON only — no markdown, no extra text:
{"intent":"add"|"query"|"chat","category":"<only for add>","reply":"<your response>"}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 256,
        system: systemPrompt,
        messages: [{ role: 'user', content: text }],
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ intent: 'add', category: 'other', reply: '' }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json() as { content: { text: string }[] };
    const rawText = data.content[0]?.text?.trim() ?? '';
    // Strip markdown code fences if Claude wraps the JSON
    const raw = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    try {
      const parsed = JSON.parse(raw) as { intent?: string; category?: string; reply?: string };
      const intent = (['add', 'query', 'chat'] as const).includes(parsed.intent as 'add' | 'query' | 'chat')
        ? (parsed.intent as 'add' | 'query' | 'chat')
        : 'add';
      const category: Category = VALID_CATEGORIES.includes(parsed.category as Category)
        ? (parsed.category as Category)
        : 'other';
      return new Response(JSON.stringify({ intent, category, reply: parsed.reply?.trim() ?? '' }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    } catch {
      return new Response(JSON.stringify({ intent: 'add', category: 'other', reply: '' }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
  },
};
