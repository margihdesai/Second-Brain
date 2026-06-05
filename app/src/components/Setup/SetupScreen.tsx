import { useState } from 'react';

interface Props {
  onCreate: (boardName: string, displayName: string) => Promise<void>;
  onJoin:   (code: string, displayName: string) => Promise<void>;
  onSignOut: () => void;
}

export default function SetupScreen({ onCreate, onJoin, onSignOut }: Props) {
  const [tab, setTab]           = useState<'create' | 'join'>('create');
  const [boardName, setBoardName] = useState('');
  const [myName, setMyName]     = useState('');
  const [code, setCode]         = useState('');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);

  async function handleCreate() {
    if (!boardName.trim() || !myName.trim()) { setError('Please fill in all fields.'); return; }
    setBusy(true); setError('Creating…');
    try { await onCreate(boardName.trim(), myName.trim()); }
    catch (e: any) { setError('Error: ' + e.message); }
    finally { setBusy(false); }
  }

  async function handleJoin() {
    if (!code.trim() || !myName.trim()) { setError('Please fill in all fields.'); return; }
    setBusy(true); setError('Looking up code…');
    try { await onJoin(code.trim(), myName.trim()); }
    catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  }

  const inp: React.CSSProperties = { width:'100%', padding:'10px 14px', border:'1px solid #E5E7EB', borderRadius:10, fontSize:14, fontFamily:'inherit', outline:'none', color:'#374151', marginBottom:10 };
  const btn: React.CSSProperties = { width:'100%', padding:11, borderRadius:50, border:'none', background:'#2D2535', color:'white', fontSize:14, fontWeight:600, cursor:'pointer', marginTop:4 };

  return (
    <div style={{ position:'fixed', inset:0, background:'#EEEAE3', display:'flex', alignItems:'center', justifyContent:'center', zIndex:998, padding:16 }}>
      <div style={{ background:'white', borderRadius:24, padding:36, maxWidth:380, width:'100%', boxShadow:'0 8px 40px rgba(0,0,0,0.10)' }}>
        <div style={{ fontSize:36, textAlign:'center', marginBottom:10 }}>🧠</div>
        <div style={{ fontSize:18, fontWeight:700, color:'#2D2535', textAlign:'center', marginBottom:4 }}>Welcome to Second Brain</div>
        <div style={{ fontSize:13, color:'#9CA3AF', textAlign:'center', marginBottom:22 }}>Create a shared board or join one with an invite code.</div>

        <div style={{ display:'flex', background:'#F3F4F6', borderRadius:50, padding:3, marginBottom:20 }}>
          {(['create','join'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              style={{ flex:1, padding:7, borderRadius:50, fontSize:13, fontWeight:500, border:'none', cursor:'pointer', background: tab===t ? 'white' : 'transparent', color: tab===t ? '#2D2535' : '#9CA3AF', boxShadow: tab===t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition:'all 0.15s' }}>
              {t === 'create' ? 'Create board' : 'Join board'}
            </button>
          ))}
        </div>

        {tab === 'create' ? (
          <>
            <input style={inp} placeholder="Board name (e.g. Our Home)" maxLength={40} value={boardName} onChange={e => setBoardName(e.target.value)} />
            <input style={inp} placeholder="Your name" maxLength={20} value={myName} onChange={e => setMyName(e.target.value)} />
            <button style={btn} onClick={handleCreate} disabled={busy}>Create board →</button>
          </>
        ) : (
          <>
            <input style={{ ...inp, textTransform:'uppercase', letterSpacing:3 }} placeholder="6-letter invite code" maxLength={6} value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
            <input style={inp} placeholder="Your name" maxLength={20} value={myName} onChange={e => setMyName(e.target.value)} />
            <button style={btn} onClick={handleJoin} disabled={busy}>Join board →</button>
          </>
        )}

        {error && <div style={{ fontSize:12, color:'#DC2626', marginTop:10, textAlign:'center' }}>{error}</div>}
        <div style={{ marginTop:18, textAlign:'center' }}>
          <button onClick={onSignOut} style={{ fontSize:12, color:'#9CA3AF', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}
