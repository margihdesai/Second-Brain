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

/**
 * AI-powered categorisation via Cloudflare Worker.
 * Falls back to keyword matching if the Worker URL isn't configured or the call fails.
 */
export async function detectCatAI(text: string): Promise<string> {
  if (!WORKER_URL) return detectCat(text);

  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(4000), // 4s max — don't block the UI
    });
    if (!res.ok) return detectCat(text);
    const { category } = await res.json() as { category: string };
    return category || detectCat(text);
  } catch {
    return detectCat(text);
  }
}
