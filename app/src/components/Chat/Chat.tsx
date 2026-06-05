import { useState, useRef, useEffect } from 'react';
import type { Entry } from '../../types';
import { detectCat, detectCatAI } from '../../utils/detectCat';

const CATS_KEYS = [
  { id:'task',       e:'✅', l:'Tasks',      keys:['need to','should','must','have to','remember to','todo','call','fix','schedule','book','remind','pick up','finish','complete','send','pay','submit'] },
  { id:'worry',      e:'💭', l:'Worries',    keys:['worried','worry','anxious','anxiety','stressed','stress','scared','nervous','fear','overwhelmed','concerned','dread','uneasy','unsure','panic','bothering me'] },
  { id:'idea',       e:'💡', l:'Ideas',      keys:['idea','what if','maybe we','could we','would be nice','imagine','how about','what about','let\'s try','suggestion','experiment','thinking of'] },
  { id:'purchase',   e:'🛒', l:'Purchases',  keys:['buy','order','purchase','need to get','looking for','amazon','shop','groceries','stock up','deal','sale','delivery'] },
  { id:'trip',       e:'✈️', l:'Trips',      keys:['trip','travel','visit','vacation','flight','hotel','airbnb','passport','destination','holiday','road trip','getaway'] },
  { id:'life-admin', e:'📋', l:'Life Admin', keys:['insurance','taxes','appointment','doctor','dentist','vet','bank','renew','deadline','budget','bill','lease','license','utilities','subscription'] },
];

const BOT: Record<string, string[]> = {
  task:        ["Added ✅ — on your task list.", "Got it ✅.", "Noted ✅ and saved."],
  worry:       ["Saved 💭. You can let it go for now.", "I hear you 💭. It's safe here."],
  idea:        ["Love it 💡! On the board.", "Great idea! 💡 Saved."],
  purchase:    ["On the list 🛒!", "Added to purchases 🛒."],
  trip:        ["Ooh, travel! ✈️ Saved.", "Added ✈️! That sounds exciting."],
  'life-admin':["Filed under Life Admin 📋.", "Saved 📋. Good staying on top of it."],
  other:       ["Got it 📝. Saved!", "Noted 📝!"],
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

export default function Chat({ partner, entries, hintCat, forceOpen, onAdd, onDelete }: Props) {
  const [open, setOpen]           = useState(false);
  const [msgs, setMsgs]           = useState<Msg[]>([]);
  const [input, setInput]         = useState('');
  const [state, setState]         = useState<'ready' | 'await_cat'>('ready');
  const [pending, setPending]     = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState<string | null>(hintCat);
  const msgsEl                    = useRef<HTMLDivElement>(null);

  useEffect(() => { setActiveCat(hintCat); if (hintCat) setOpen(true); }, [hintCat]);
  useEffect(() => { if (forceOpen) setOpen(true); }, [forceOpen]);
  useEffect(() => { if (open && msgs.length === 0) greet(); }, [open]);
  useEffect(() => { if (msgsEl.current) msgsEl.current.scrollTop = msgsEl.current.scrollHeight; }, [msgs]);

  function rand(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)]; }

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

  function answerBoardQuery(lo: string): string | null {
    const active = entries.filter(e => !e.completed);
    const completed = entries.filter(e => e.completed);

    // "how many X" / "count X" / "X count"
    const catMatch = CATS_KEYS.find(c =>
      lo.includes(c.id) || lo.includes(c.l.toLowerCase()) || lo.includes(c.l.toLowerCase().replace(/s$/, ''))
    );

    if (/\b(how many|count|number of)\b/.test(lo)) {
      if (catMatch) {
        const n = active.filter(e => e.category === catMatch.id).length;
        return `You have ${n} ${catMatch.l.toLowerCase()} ${n === 1 ? 'item' : 'items'} on the board ${catMatch.e}.`;
      }
      const n = active.length;
      return `There ${n === 1 ? 'is' : 'are'} ${n} active ${n === 1 ? 'item' : 'items'} on the board, plus ${completed.length} completed 🧠.`;
    }

    // "show my X" / "list my X" / "what are my X"
    if (/\b(show|list|what are|what's|whats)\b.*(my|mine)\b/.test(lo) ||
        /\bmy\b.*(task|worry|idea|purchase|trip|life.admin|item)\b/.test(lo)) {
      const mine = active.filter(e => e.author === partner && (!catMatch || e.category === catMatch.id));
      if (!mine.length) return `You haven't added any ${catMatch ? catMatch.l.toLowerCase() : 'items'} yet!`;
      return `Your ${catMatch ? catMatch.l.toLowerCase() : 'items'} ${catMatch?.e ?? '📝'}:\n${mine.map(e => `• ${e.text}`).join('\n')}`;
    }

    // "show [name]'s" / "what did X add"
    const nameMatch = lo.match(/\bshow\s+(\w+)'?s?\b|\bwhat did\s+(\w+)\b/);
    if (nameMatch) {
      const name = (nameMatch[1] || nameMatch[2]).toLowerCase();
      const theirs = active.filter(e => e.author.toLowerCase().startsWith(name));
      if (!theirs.length) return `Nothing from ${nameMatch[1] || nameMatch[2]} yet!`;
      return `From ${theirs[0].author} 📝:\n${theirs.map(e => `• ${e.text}`).join('\n')}`;
    }

    // "summary" / "show everything" / "show all"
    if (/\b(summary|summarize|show everything|show all|overview)\b/.test(lo)) {
      const lines = CATS_KEYS.map(c => {
        const n = active.filter(e => e.category === c.id).length;
        return n > 0 ? `${c.e} ${c.l}: ${n}` : null;
      }).filter(Boolean);
      if (!lines.length) return "The board is empty — a clean slate! ✨";
      return `Here's the board:\n${lines.join('\n')}\n(${completed.length} completed ☑️)`;
    }

    return null;
  }

  async function processMsg(text: string) {
    const lo = text.toLowerCase();
    if (/^(hi|hey|hello|yo)\b/.test(lo)) { addBot("Hey! 👋 What's on your mind?"); return; }
    if (/\b(thank|thanks|thx)\b/.test(lo)) { addBot("Happy to help 🧠 Anything else?"); return; }
    if (/\b(undo|scratch that|never mind)\b/.test(lo)) {
      const last = entries.find(e => e.author === partner);
      if (last) { onDelete(last.id); addBot(`Removed "${last.text.slice(0,40)}…" 🗑`); }
      else addBot("Nothing recent to undo!");
      return;
    }

    if (state === 'await_cat') { handleCatReply(text); return; }

    if (activeCat) {
      const cat = activeCat; setActiveCat(null);
      onAdd(text, cat); addBot(rand(BOT[cat] || BOT.other));
      return;
    }

    // Answer questions about the board without adding an entry
    const boardAnswer = answerBoardQuery(lo);
    if (boardAnswer) { addBot(boardAnswer); return; }

    const { category: cat, reply } = await detectCatAI(text);
    onAdd(text, cat);
    addBot(reply || rand(BOT[cat] || BOT.other));
  }

  function handleCatReply(reply: string) {
    setState('ready');
    const lo = reply.toLowerCase();
    let cat: string | null = null;
    for (const c of CATS_KEYS) { if (lo.includes(c.id) || lo.includes(c.l.toLowerCase().replace(/s$/,''))) { cat = c.id; break; } }
    if (!cat) cat = detectCat(pending || reply);
    const text = pending || reply;
    setPending(null);
    onAdd(text, cat); addBot(rand(BOT[cat] || BOT.other));
  }

  function qrClick(val: string, label: string) {
    addUser(label);
    if (state === 'await_cat') {
      setState('ready');
      const text = pending || label; setPending(null);
      onAdd(text, val); addBot(rand(BOT[val] || BOT.other));
    }
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
