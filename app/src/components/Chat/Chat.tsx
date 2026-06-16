import { useState, useRef, useEffect } from 'react';
import type { Entry } from '../../types';
import { detectCatAI } from '../../utils/detectCat';

const BOT_FALLBACK: Record<string, string> = {
  task: 'Added ✅ — on your task list.',
  worry: "Saved 💭. You can let it go for now.",
  idea: 'Love it 💡! On the board.',
  purchase: 'On the list 🛒!',
  trip: 'Ooh, travel! ✈️ Saved to Trips. That sounds exciting.',
  'life-admin': 'Filed under Life Admin 📋. One less thing to forget!',
  other: 'Got it 📝. Saved!',
};

interface Msg { role: 'bot' | 'user'; text: string; qrs?: { label: string; val: string }[]; }

interface Props {
  partner:    string;
  entries:    Entry[];
  hintCat:    string | null;
  forceOpen?: boolean;
  onAdd:      (text: string, cat: string) => void;
  onDelete:   (id: string) => void;
}

function cleanText(raw: string): string {
  const cleaned = raw
    .trim()
    .replace(/^(can you |please |could you |would you )?(add |put |include |log |save )(a |an |the )?/i, '')
    .replace(/^(remind me to |don't forget to |we need to |we should |make sure (we |to |i )?|i want to |i'd like to |let's )/i, '')
    .trim();
  return cleaned || raw.trim();
}

export default function Chat({ partner, entries, hintCat, forceOpen, onAdd, onDelete }: Props) {
  const [open, setOpen]           = useState(false);
  const [msgs, setMsgs]           = useState<Msg[]>([]);
  const [input, setInput]         = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(hintCat);
  const msgsEl                    = useRef<HTMLDivElement>(null);

  useEffect(() => { setActiveCat(hintCat); if (hintCat) setOpen(true); }, [hintCat]);
  useEffect(() => { if (forceOpen) setOpen(true); }, [forceOpen]);
  useEffect(() => { if (open && msgs.length === 0) greet(); }, [open]);
  useEffect(() => { if (msgsEl.current) msgsEl.current.scrollTop = msgsEl.current.scrollHeight; }, [msgs]);

  function greet() {
    addBot(`Hey ${partner}! 👋 What's on your mind? Just tell me — I'll sort it.`);
  }

  function addBot(text: string, qrs?: Msg['qrs']) {
    setMsgs(prev => [...prev, { role:'bot', text, qrs }]);
  }
  function addUser(text: string) {
    setMsgs(prev => [...prev, { role:'user', text }]);
  }

  function send() {
    const text = input.trim();
    if (!text) return;
    addUser(text);
    setInput('');
    setTimeout(() => void processMsg(text), 320);
  }

  async function processMsg(text: string) {
    // Undo is always local — needs direct access to entries + onDelete
    if (/\b(undo|scratch that|never mind)\b/i.test(text)) {
      const last = entries.find(e => e.author === partner);
      if (last) { onDelete(last.id); addBot(`Removed "${last.text.slice(0, 40)}…" 🗑`); }
      else addBot("Nothing recent to undo!");
      return;
    }

    const entry = cleanText(text);

    // When a column header hinted a category, skip AI and add directly
    if (activeCat) {
      const cat = activeCat; setActiveCat(null);
      onAdd(entry, cat);
      addBot(BOT_FALLBACK[cat] ?? BOT_FALLBACK.other);
      return;
    }

    // Build history from recent messages so Claude has conversation context
    const history = msgs.slice(-8).map(m => `${m.role === 'user' ? 'User' : 'Bot'}: ${m.text}`);
    const context = {
      partner,
      history,
      entries: entries.map(e => ({ text: e.text, category: e.category, author: e.author, completed: e.completed })),
    };

    const { intent, category: cat, reply } = await detectCatAI(entry, context);

    if (intent === 'add') {
      onAdd(entry, cat);
      addBot(reply || (BOT_FALLBACK[cat] ?? BOT_FALLBACK.other));
    } else {
      // 'query' or 'chat' — just reply, nothing added to board
      addBot(reply || "I'm not sure — try asking differently?");
    }
  }

  function qrClick(val: string, label: string) {
    addUser(label);
    onAdd(label, val);
    addBot(BOT_FALLBACK[val] ?? BOT_FALLBACK.other);
  }

  return (
    <>
      <button className={`fab ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)}>
        {open ? '✕' : '💬'}
      </button>

      <div className={`chat ${open ? 'on' : ''}`}>
        <div className="chat-hdr">
          <div className="chat-av">🧠</div>
          <div style={{ flex:1 }}>
            <div className="chat-name">Second Brain</div>
            <div className="chat-hint">{activeCat ? `Adding to ${activeCat}` : "Tell me anything — I'll sort it"}</div>
          </div>
          {entries.length > 0 && (
            <div style={{ fontSize:10, color:'#9CA3AF', background:'#F3F4F6', padding:'2px 8px', borderRadius:50 }}>
              {entries.length} items
            </div>
          )}
        </div>

        <div className="chat-msgs" ref={msgsEl}>
          {msgs.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              {m.role === 'bot' && <div className="msg-icon">🧠</div>}
              <div>
                <div className="bubble">{m.text}</div>
                {m.qrs && (
                  <div className="qrs">
                    {m.qrs.map(q => <button key={q.val} className="qr" onClick={() => qrClick(q.val, q.label)}>{q.label}</button>)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="chat-foot">
          <textarea className="chat-ta" rows={1} placeholder="What's on your mind?" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <button className="chat-send" onClick={send}>↑</button>
        </div>
      </div>
    </>
  );
}
