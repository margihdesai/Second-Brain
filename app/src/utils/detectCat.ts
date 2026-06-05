const CATS_KEYS = [
  { id:'task',       keys:['need to','should','must','have to','remember to','todo','call','fix','schedule','book','remind','pick up','finish','complete','send','pay','submit'] },
  { id:'worry',      keys:['worried','worry','anxious','anxiety','stressed','stress','scared','nervous','fear','overwhelmed','concerned','dread','uneasy','unsure','panic','bothering me'] },
  { id:'idea',       keys:['idea','what if','maybe we','could we','would be nice','imagine','how about','what about','let\'s try','suggestion','experiment','thinking of'] },
  { id:'purchase',   keys:['buy','order','purchase','need to get','looking for','amazon','shop','groceries','stock up','deal','sale','delivery'] },
  { id:'trip',       keys:['trip','travel','visit','vacation','flight','hotel','airbnb','passport','destination','holiday','road trip','getaway'] },
  { id:'life-admin', keys:['insurance','taxes','appointment','doctor','dentist','vet','bank','renew','deadline','budget','bill','lease','license','utilities','subscription'] },
];

/** Instant keyword-based fallback — always available, no network needed. */
export function detectCat(text: string): string {
  const lo = text.toLowerCase();
  const scored = CATS_KEYS
    .map(c => ({ id: c.id, score: c.keys.filter(k => lo.includes(k)).length }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.id || 'other';
}

const WORKER_URL = import.meta.env.VITE_CATEGORISE_WORKER_URL as string | undefined;

export interface AIResult {
  intent: 'add' | 'query' | 'chat';
  category: string;
  reply: string;
}

export interface ChatContext {
  partner: string;
  history: string[];
  entries: { text: string; category: string; author: string; completed: boolean }[];
}

/**
 * AI-powered intent detection + reply via Cloudflare Worker.
 * Falls back to keyword categorisation (intent="add") if the Worker is unavailable.
 */
export async function detectCatAI(text: string, context?: ChatContext): Promise<AIResult> {
  if (!WORKER_URL) return { intent: 'add', category: detectCat(text), reply: '' };

  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, ...context }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { intent: 'add', category: detectCat(text), reply: '' };
    const result = await res.json() as AIResult;
    return {
      intent: result.intent ?? 'add',
      category: result.category || detectCat(text),
      reply: result.reply ?? '',
    };
  } catch {
    return { intent: 'add', category: detectCat(text), reply: '' };
  }
}
