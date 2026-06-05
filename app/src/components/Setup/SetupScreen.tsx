import { useState } from 'react';

interface Props {
  onCreate: (boardName: string, displayName: string) => Promise<void>;
  onJoin:   (code: string, displayName: string) => Promise<void>;
  onSignOut: () => void;
}

const FEATURES = [
  { e:'✅', l:'Tasks' }, { e:'💭', l:'Worries' }, { e:'💡', l:'Ideas' },
  { e:'🛒', l:'Purchases' }, { e:'✈️', l:'Trips' }, { e:'📋', l:'Life Admin' },
];

export default function SetupScreen({ onCreate, onJoin, onSignOut }: Props) {
  const [tab, setTab]             = useState<'create' | 'join'>('create');
  const [boardName, setBoardName] = useState('');
  const [myName, setMyName]       = useState('');
  const [code, setCode]           = useState('');
  const [error, setError]         = useState('');
  const [busy, setBusy]           = useState(false);

  async function handleCreate() {
    if (!boardName.trim() || !myName.trim()) { setError('Please fill in all fields.'); return; }
    setBusy(true); setError('Creating…');
    try { await onCreate(boardName.trim(), myName.trim()); }
    catch (e: any) { setError('Error: ' + e.message); setBusy(false); }
  }

  async function handleJoin() {
    if (!code.trim() || !myName.trim()) { setError('Please fill in all fields.'); return; }
    setBusy(true); setError('Looking up code…');
    try { await onJoin(code.trim(), myName.trim()); }
    catch (e: any) { setError(e.message); setBusy(false); }
  }

  const inp: React.CSSProperties = {
    width:'100%', padding:'10px 14px', border:'1px solid #E5E7EB', borderRadius:10,
    fontSize:14, fontFamily:'inherit', outline:'none', color:'#374151', marginBottom:10,
    transition:'border-color 0.14s',
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'#EEEAE3', display:'flex', alignItems:'center', justifyContent:'center', zIndex:998, padding:16, overflowY:'auto' }}>
      <div style={{ maxWidth:400, width:'100%', paddingTop:24, paddingBottom:24 }}>

        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🧠</div>
          <div style={{ fontSize:22, fontWeight:800, color:'#2D2535', marginBottom:8 }}>Your shared second brain</div>
          <div style={{ fontSize:14, color:'#6B7280', lineHeight:1.6, marginBottom:20 }}>
            A private board for two — capture tasks, ideas, worries,<br/>and plans together. In real time.
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center' }}>
            {FEATURES.map(f => (
              <span key={f.l} style={{ fontSize:12, padding:'4px 10px', borderRadius:50, background:'white', border:'1px solid #E5E7EB', color:'#374151' }}>
                {f.e} {f.l}
              </span>
            ))}
          </div>
        </div>

        {/* Card */}
        <div style={{ background:'white', borderRadius:24, padding:28, boxShadow:'0 8px 40px rgba(0,0,0,0.10)' }}>
          <div style={{ display:'flex', background:'#F3F4F6', borderRadius:50, padding:3, marginBottom:20 }}>
            {(['create','join'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                style={{ flex:1, padding:8, borderRadius:50, fontSize:13, fontWeight:600, border:'none', cursor:'pointer', transition:'all 0.15s', background:tab===t?'white':'transparent', color:tab===t?'#2D2535':'#9CA3AF', boxShadow:tab===t?'0 1px 4px rgba(0,0,0,0.1)':'none' }}>
                {t === 'create' ? '✨ Create board' : '🔗 Join board'}
              </button>
            ))}
          </div>

          {tab === 'create' ? (
            <>
              <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Board name</label>
              <input style={inp} placeholder="e.g. Margi & Samarth" maxLength={40} value={boardName} onChange={e => setBoardName(e.target.value)} autoFocus />
              <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Your name</label>
              <input style={inp} placeholder="e.g. Margi" maxLength={20} value={myName} onChange={e => setMyName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()} />
              <button onClick={handleCreate} disabled={busy}
                style={{ width:'100%', padding:12, borderRadius:50, border:'none', background:'#2D2535', color:'white', fontSize:14, fontWeight:700, cursor:'pointer', marginTop:4, opacity:busy?0.6:1, transition:'opacity 0.14s' }}>
                {busy ? 'Creating…' : 'Create board →'}
              </button>
            </>
          ) : (
            <>
              <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Invite code</label>
              <input style={{ ...inp, textTransform:'uppercase', letterSpacing:4, fontSize:16, fontWeight:700 }}
                placeholder="ABC123" maxLength={6} value={code} onChange={e => setCode(e.target.value.toUpperCase())} autoFocus />
              <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Your name</label>
              <input style={inp} placeholder="e.g. Samarth" maxLength={20} value={myName} onChange={e => setMyName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleJoin()} />
              <button onClick={handleJoin} disabled={busy}
                style={{ width:'100%', padding:12, borderRadius:50, border:'none', background:'#2D2535', color:'white', fontSize:14, fontWeight:700, cursor:'pointer', marginTop:4, opacity:busy?0.6:1, transition:'opacity 0.14s' }}>
                {busy ? 'Joining…' : 'Join board →'}
              </button>
            </>
          )}

          {error && !error.startsWith('Creating') && !error.startsWith('Looking') && (
            <div style={{ fontSize:12, color:'#DC2626', marginTop:12, textAlign:'center', padding:'8px 12px', background:'#FEF2F2', borderRadius:8 }}>{error}</div>
          )}
        </div>

        <div style={{ textAlign:'center', marginTop:16 }}>
          <button onClick={onSignOut} style={{ fontSize:12, color:'#9CA3AF', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}
