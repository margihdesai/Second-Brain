import { useState } from 'react';
import { useAuth }      from './hooks/useAuth';
import { useHousehold } from './hooks/useHousehold';
import LoginScreen  from './components/Auth/LoginScreen';
import SetupScreen  from './components/Setup/SetupScreen';
import Header       from './components/Header/Header';
import Board, { CATS } from './components/Board/Board';
import BoardSkeleton from './components/Board/BoardSkeleton';
import Chat         from './components/Chat/Chat';
import type { Entry, Household } from './types';
import './App.css';

const DEMO_MODE = new URLSearchParams(window.location.search).get('demo') === 'true';

const DEMO_HOUSEHOLD: Household = {
  id: 'demo', name: 'Demo Board', inviteCode: 'DEMO01', createdAt: '', createdBy: 'u1',
  members: {
    u1: { displayName: 'Margi',   email: 'margi@demo.com',   color: '#E07A5F', joinedAt: '', role: 'admin' },
    u2: { displayName: 'Samarth', email: 'samarth@demo.com', color: '#3D8B8F', joinedAt: '', role: 'member' },
  },
};

const ts = (daysAgo: number) => new Date(Date.now() - daysAgo * 864e5).toISOString();
const DEMO_ENTRIES: Entry[] = [
  { id:'d1',  text:'Book dentist appointment',       author:'Margi',   category:'task',       ts:ts(1),  acked:false, ackedBy:null, completed:false, completedBy:null, completedAt:null, dueDate: new Date(Date.now()+3*864e5).toISOString().slice(0,10), notes:'' },
  { id:'d2',  text:'Renew car insurance',            author:'Samarth', category:'life-admin', ts:ts(2),  acked:true,  ackedBy:'Margi', completed:false, completedBy:null, completedAt:null, dueDate:null, notes:'Policy expires end of month' },
  { id:'d3',  text:'What if we can\'t afford the trip this year?', author:'Margi', category:'worry', ts:ts(1), acked:false, ackedBy:null, completed:false, completedBy:null, completedAt:null, dueDate:null, notes:'' },
  { id:'d4',  text:'Weekend trip to Lake Tahoe',     author:'Samarth', category:'trip',       ts:ts(3),  acked:true,  ackedBy:'Margi', completed:false, completedBy:null, completedAt:null, dueDate:null, notes:'Check Airbnb availability for July' },
  { id:'d5',  text:'Oat milk, eggs, sourdough bread', author:'Margi',  category:'purchase',   ts:ts(0),  acked:false, ackedBy:null, completed:false, completedBy:null, completedAt:null, dueDate:null, notes:'' },
  { id:'d6',  text:'App to track household splits',  author:'Margi',   category:'idea',       ts:ts(4),  acked:true,  ackedBy:'Samarth', completed:false, completedBy:null, completedAt:null, dueDate:null, notes:'' },
  { id:'d7',  text:'Call landlord about the leak',   author:'Samarth', category:'task',       ts:ts(0),  acked:false, ackedBy:null, completed:false, completedBy:null, completedAt:null, dueDate: new Date(Date.now()+1*864e5).toISOString().slice(0,10), notes:'' },
  { id:'d8',  text:'File taxes',                     author:'Margi',   category:'life-admin', ts:ts(5),  acked:true,  ackedBy:'Samarth', completed:true,  completedBy:'Margi', completedAt:ts(1), dueDate:null, notes:'' },
  { id:'d9',  text:'New standing desk',              author:'Samarth', category:'purchase',   ts:ts(6),  acked:false, ackedBy:null, completed:false, completedBy:null, completedAt:null, dueDate:null, notes:'Budget ~$400' },
  { id:'d10', text:'Weekly meal prep on Sundays',    author:'Margi',   category:'idea',       ts:ts(2),  acked:true,  ackedBy:'Samarth', completed:false, completedBy:null, completedAt:null, dueDate:null, notes:'' },
];

function DemoApp() {
  const [entries, setEntries] = useState<Entry[]>(DEMO_ENTRIES);
  const [detailId, setDetailId]   = useState<string | null>(null);
  const [reassignId, setReassignId] = useState<string | null>(null);
  const partner = 'Margi';

  function getMemberColor(name: string) {
    const m = Object.values(DEMO_HOUSEHOLD.members).find(m => m.displayName === name);
    return m?.color || '#888';
  }

  function updateEntry(id: string, changes: Partial<Entry>) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...changes } : e));
  }

  function DemoBanner() {
    return (
      <div style={{ background:'linear-gradient(135deg,#6B4E71,#2D2535)', color:'white', padding:'11px 20px', display:'flex', alignItems:'center', justifyContent:'center', gap:16, flexWrap:'wrap', fontSize:13 }}>
        <a href="../" style={{ background:'rgba(255,255,255,0.15)', color:'white', padding:'5px 14px', borderRadius:50, fontSize:12, fontWeight:600, textDecoration:'none', whiteSpace:'nowrap' }}>← Home</a>
        <span>👀 Demo mode — explore a sample board, no sign-in needed</span>
        <a href="./" style={{ background:'white', color:'#2D2535', padding:'5px 16px', borderRadius:50, fontSize:12, fontWeight:700, textDecoration:'none', whiteSpace:'nowrap' }}>Create your own board →</a>
      </div>
    );
  }

  function CardDetailModal() {
    const e = entries.find(x => x.id === detailId);
    if (!e) return null;
    const cat = CATS.find(c => c.id === e.category);
    let dueVal = e.dueDate || '', notesVal = e.notes || '';
    return (
      <Modal title={`${cat?.e || '📝'} ${cat?.l || 'Entry'}`} onClose={() => setDetailId(null)}>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:13.5, color:'#1F2937', background:'#F9FAFB', borderRadius:8, padding:'10px 12px', lineHeight:1.5 }}>{e.text}</div>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Due date</label>
          <input type="date" defaultValue={dueVal} onChange={ev => { dueVal = ev.target.value; }}
            style={{ width:'100%', padding:'8px 12px', border:'1px solid #E5E7EB', borderRadius:8, fontSize:13, fontFamily:'inherit', outline:'none' }} />
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Notes</label>
          <textarea rows={4} defaultValue={notesVal} onChange={ev => { notesVal = ev.target.value; }}
            style={{ width:'100%', padding:'8px 12px', border:'1px solid #E5E7EB', borderRadius:8, fontSize:13, fontFamily:'inherit', resize:'vertical', outline:'none' }}
            placeholder="Add context, links, details…" />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:11, color:'#9CA3AF' }}>Added by {e.author}</span>
          <button onClick={() => { updateEntry(e.id, { dueDate: dueVal || null, notes: notesVal }); setDetailId(null); }}
            style={{ padding:'8px 20px', borderRadius:50, border:'none', background:'#2D2535', color:'white', fontSize:13, fontWeight:600, cursor:'pointer' }}>Save</button>
        </div>
      </Modal>
    );
  }

  function ReassignModal() {
    return (
      <Modal title="Move to…" onClose={() => setReassignId(null)} maxWidth={320}>
        <p style={{ fontSize:13, color:'#6B7280', marginBottom:14 }}>Choose a column:</p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {CATS.filter(c => c.id !== 'completed').map(cat => {
            const e = entries.find(x => x.id === reassignId);
            const isCurrent = e?.category === cat.id && !e?.completed;
            return (
              <button key={cat.id} onClick={() => { if (reassignId) updateEntry(reassignId, { category: cat.id, completed: false, completedBy: null, completedAt: null }); setReassignId(null); }}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', border:`1px solid ${isCurrent?'#6B4E71':'#E5E7EB'}`, borderRadius:10, background:isCurrent?'#F5F3FF':'white', cursor:'pointer', fontSize:13, fontWeight:500, textAlign:'left', width:'100%' }}>
                <span style={{ fontSize:16 }}>{cat.e}</span><span>{cat.l}</span>
                {isCurrent && <span style={{ marginLeft:'auto', fontSize:11, color:'#6D28D9' }}>current</span>}
              </button>
            );
          })}
        </div>
      </Modal>
    );
  }

  return (
    <>
      <DemoBanner />
      <Header
        household={DEMO_HOUSEHOLD}
        onInvite={() => {}}
        onBoardActions={() => {}}
        onInsights={() => {}}
        onDigest={() => {}}
        onSignOut={() => {}}
        isAdmin={false}
      />
      <Board
        entries={entries}
        partner={partner}
        isAdmin={false}
        getMemberColor={getMemberColor}
        onAck={id => { const e = entries.find(x => x.id === id); if (e) updateEntry(id, { acked: !e.acked, ackedBy: !e.acked ? partner : null }); }}
        onComplete={id => { const e = entries.find(x => x.id === id); if (e) updateEntry(id, { completed: !e.completed, completedBy: !e.completed ? partner : null, completedAt: !e.completed ? new Date().toISOString() : null }); }}
        onDelete={id => setEntries(prev => prev.filter(e => e.id !== id))}
        onReassign={id => setReassignId(id)}
        onOpenDetail={id => setDetailId(id)}
        onCategoryMove={(id, cat) => updateEntry(id, { category: cat, completed: false, completedBy: null, completedAt: null })}
        onOpenChatFor={() => {}}
        onAdd={(text, cat) => setEntries(prev => [{ id: Date.now().toString(), text, author: partner, category: cat, ts: new Date().toISOString(), acked: false, ackedBy: null, completed: false, completedBy: null, completedAt: null, dueDate: null, notes: '' }, ...prev])}
      />
      <Chat
        partner={partner}
        entries={entries}
        hintCat={null}
        onAdd={(text, cat) => setEntries(prev => [{ id: Date.now().toString(), text, author: partner, category: cat, ts: new Date().toISOString(), acked: false, ackedBy: null, completed: false, completedBy: null, completedAt: null, dueDate: null, notes: '' }, ...prev])}
        onDelete={id => setEntries(prev => prev.filter(e => e.id !== id))}
      />
      {detailId   && <CardDetailModal />}
      {reassignId && <ReassignModal />}
    </>
  );
}

function Modal({ title, onClose, children, maxWidth = 500 }: { title: string; onClose: () => void; children: React.ReactNode; maxWidth?: number }) {
  return (
    <div className="overlay on" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-head">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const {
    household, entries, loading: hhLoading,
    createBoard, joinBoard, leaveBoard, deleteBoard, promoteToAdmin,
    addEntry, updateEntry, deleteEntry,
    getMyRole, getMemberColor, repairInviteCode,
  } = useHousehold(user);

  const [loginError, setLoginError]   = useState('');
  const [modal, setModal]             = useState<string | null>(null);
  const [chatHintCat, setChatHintCat] = useState<string | null>(null);
  const [detailId, setDetailId]       = useState<string | null>(null);
  const [reassignId, setReassignId]   = useState<string | null>(null);

  const partner = household?.members?.[user?.uid || '']?.displayName || user?.displayName || 'You';
  const myRole  = getMyRole();

  if (DEMO_MODE) return <DemoApp />;

  if (authLoading) return (
    <div style={{ position:'fixed', inset:0, background:'#EEEAE3', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:42 }}>🧠</div>
    </div>
  );

  if (hhLoading && household) return (
    <>
      <Header household={household} onInvite={() => {}} onBoardActions={() => {}} onInsights={() => {}} onDigest={() => {}} onSignOut={signOut} />
      <BoardSkeleton />
    </>
  );

  if (!user) return (
    <LoginScreen error={loginError} onSignIn={async () => {
      try { await signIn(); setLoginError(''); }
      catch (e: any) { setLoginError(e.message); }
    }} />
  );

  if (!household) return (
    <SetupScreen onCreate={createBoard} onJoin={joinBoard} onSignOut={signOut} />
  );

  function ackEntry(id: string) {
    const e = entries.find(x => x.id === id);
    if (!e || e.author === partner) return;
    updateEntry(id, { acked: !e.acked, ackedBy: !e.acked ? partner : null });
  }

  function completeEntry(id: string) {
    const e = entries.find(x => x.id === id);
    if (!e) return;
    updateEntry(id, { completed: !e.completed, completedBy: !e.completed ? partner : null, completedAt: !e.completed ? new Date().toISOString() : null });
  }

  function moveEntry(id: string, cat: string) {
    updateEntry(id, { category: cat, completed: false, completedBy: null, completedAt: null });
  }

  function BoardActionsModal() {
    const members      = Object.entries(household!.members);
    const memberCount  = members.length;
    const adminCount   = members.filter(([uid, m]) => (m.role || (household!.createdBy === uid ? 'admin' : 'member')) === 'admin').length;
    const isAdmin      = myRole === 'admin';
    const otherMembers = members.filter(([uid]) => uid !== user!.uid);

    const deleteBtn = (label: string) => (
      <button onClick={async () => { if (confirm(`Delete "${household!.name}"? This cannot be undone.`)) { setModal(null); await deleteBoard(); } }}
        style={{ width:'100%', padding:10, borderRadius:50, border:'1px solid #FCA5A5', background:'white', color:'#DC2626', fontSize:13, fontWeight:500, cursor:'pointer' }}>
        {label}
      </button>
    );
    const cancelBtn = <button onClick={() => setModal(null)} style={{ width:'100%', padding:10, borderRadius:50, border:'1px solid #E5E7EB', background:'white', fontSize:13, cursor:'pointer', marginTop:6 }}>Cancel</button>;

    if (memberCount === 1) return (
      <Modal title="🗑 Delete Board" onClose={() => setModal(null)} maxWidth={380}>
        <p style={{ fontSize:13, color:'#6B7280', marginBottom:20 }}>You're the only member. All data will be permanently deleted.</p>
        {deleteBtn('🗑 Delete Board')}{cancelBtn}
      </Modal>
    );

    if (!isAdmin) return (
      <Modal title="🚪 Leave Board" onClose={() => setModal(null)} maxWidth={380}>
        <p style={{ fontSize:13, color:'#6B7280', marginBottom:20 }}>You'll be removed from <strong>"{household!.name}"</strong>. You'll need an invite code to rejoin.</p>
        <button onClick={async () => { setModal(null); await leaveBoard(); }} style={{ width:'100%', padding:10, borderRadius:50, border:'none', background:'#2D2535', color:'white', fontSize:13, fontWeight:600, cursor:'pointer' }}>🚪 Leave Board</button>
        {cancelBtn}
      </Modal>
    );

    if (adminCount <= 1) return (
      <Modal title="Board Actions" onClose={() => setModal(null)} maxWidth={380}>
        <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:10, padding:'11px 14px', marginBottom:16, fontSize:13, color:'#92400E' }}>
          You're the only admin. Make someone else admin before leaving.
        </div>
        <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:10 }}>Transfer admin to:</div>
        <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:18 }}>
          {otherMembers.map(([uid, m]) => (
            <div key={uid} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:m.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'white', flexShrink:0 }}>{m.displayName[0]}</div>
              <span style={{ fontSize:13, color:'#374151', flex:1 }}>{m.displayName}</span>
              <button onClick={async () => { await promoteToAdmin(uid); }} style={{ padding:'4px 12px', borderRadius:50, border:'1px solid #E5E7EB', background:'white', fontSize:12, cursor:'pointer' }}>Make Admin</button>
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid #FEE2E2', paddingTop:14 }}>{deleteBtn('🗑 Delete Board for Everyone')}</div>
        {cancelBtn}
      </Modal>
    );

    return (
      <Modal title="Board Actions" onClose={() => setModal(null)} maxWidth={380}>
        <p style={{ fontSize:13, color:'#6B7280', marginBottom:16 }}>What would you like to do with <strong>"{household!.name}"</strong>?</p>
        <button onClick={async () => { setModal(null); await leaveBoard(); }} style={{ width:'100%', padding:10, borderRadius:50, border:'1px solid #E5E7EB', background:'white', fontSize:13, cursor:'pointer', marginBottom:8 }}>🚪 Leave Board</button>
        {deleteBtn('🗑 Delete Board for Everyone')}
        {cancelBtn}
      </Modal>
    );
  }

  function InviteModal() {
    repairInviteCode();
    const code          = household!.inviteCode;
    const link          = `https://margihdesai.github.io/Second-Brain/app/?code=${code}`;
    const memberEntries = Object.entries(household!.members);
    const isAdmin       = myRole === 'admin';
    return (
      <Modal title="🔗 Invite someone" onClose={() => setModal(null)}>
        <p style={{ fontSize:13, color:'#6B7280', marginBottom:8 }}>Share this code:</p>
        <div style={{ fontSize:30, fontWeight:800, letterSpacing:8, color:'#2D2535', textAlign:'center', padding:18, background:'#F3F4F6', borderRadius:12, marginBottom:16 }}>{code}</div>
        <div style={{ fontSize:11.5, color:'#6B7280', wordBreak:'break-all', marginBottom:8 }}>{link}</div>
        <button onClick={() => navigator.clipboard.writeText(link)} style={{ width:'100%', padding:9, borderRadius:8, border:'1px solid #E5E7EB', background:'white', fontSize:13, cursor:'pointer', marginBottom:18 }}>📋 Copy link</button>
        <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:10 }}>Members ({memberEntries.length})</div>
        {memberEntries.map(([uid, m]) => {
          const isMe = m.email === user!.email;
          const role = m.role || (household!.createdBy === uid ? 'admin' : 'member');
          return (
            <div key={uid} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background:m.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'white', flexShrink:0 }}>{m.displayName[0]}</div>
              <span style={{ fontSize:13, color:'#374151', flex:1 }}>{m.displayName}</span>
              <span style={{ fontSize:10, padding:'2px 8px', borderRadius:50, background:role==='admin'?'#F5F3FF':'#F3F4F6', color:role==='admin'?'#6D28D9':'#6B7280', fontWeight:600 }}>{role}</span>
              {isMe && <span style={{ fontSize:11, color:'#9CA3AF' }}>(you)</span>}
              {isAdmin && !isMe && role !== 'admin' && (
                <button onClick={() => promoteToAdmin(uid)} style={{ fontSize:11, padding:'3px 10px', borderRadius:50, border:'1px solid #E5E7EB', background:'white', cursor:'pointer' }}>Make Admin</button>
              )}
            </div>
          );
        })}
      </Modal>
    );
  }

  function CardDetailModal() {
    const e = entries.find(x => x.id === detailId);
    if (!e) return null;
    const cat = CATS.find(c => c.id === e.category);
    let dueVal   = e.dueDate || '';
    let notesVal = e.notes   || '';
    return (
      <Modal title={`${cat?.e || '📝'} ${cat?.l || 'Entry'}`} onClose={() => setDetailId(null)}>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:13.5, color:'#1F2937', background:'#F9FAFB', borderRadius:8, padding:'10px 12px', lineHeight:1.5 }}>{e.text}</div>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Due date</label>
          <input type="date" defaultValue={dueVal} onChange={ev => { dueVal = ev.target.value; }}
            style={{ width:'100%', padding:'8px 12px', border:'1px solid #E5E7EB', borderRadius:8, fontSize:13, fontFamily:'inherit', outline:'none' }} />
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Notes</label>
          <textarea rows={4} defaultValue={notesVal} onChange={ev => { notesVal = ev.target.value; }}
            style={{ width:'100%', padding:'8px 12px', border:'1px solid #E5E7EB', borderRadius:8, fontSize:13, fontFamily:'inherit', resize:'vertical', outline:'none' }}
            placeholder="Add context, links, details…" />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:11, color:'#9CA3AF' }}>Added by {e.author}</span>
          <button onClick={() => { updateEntry(e.id, { dueDate: dueVal || null, notes: notesVal }); setDetailId(null); }}
            style={{ padding:'8px 20px', borderRadius:50, border:'none', background:'#2D2535', color:'white', fontSize:13, fontWeight:600, cursor:'pointer' }}>Save</button>
        </div>
      </Modal>
    );
  }

  function ReassignModal() {
    return (
      <Modal title="Move to…" onClose={() => setReassignId(null)} maxWidth={320}>
        <p style={{ fontSize:13, color:'#6B7280', marginBottom:14 }}>Choose a column:</p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {CATS.filter(c => c.id !== 'completed').map(cat => {
            const e          = entries.find(x => x.id === reassignId);
            const isCurrent  = e?.category === cat.id && !e?.completed;
            return (
              <button key={cat.id} onClick={() => { if (reassignId) moveEntry(reassignId, cat.id); setReassignId(null); }}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', border:`1px solid ${isCurrent?'#6B4E71':'#E5E7EB'}`, borderRadius:10, background:isCurrent?'#F5F3FF':'white', cursor:'pointer', fontSize:13, fontWeight:500, textAlign:'left', width:'100%' }}>
                <span style={{ fontSize:16 }}>{cat.e}</span><span>{cat.l}</span>
                {isCurrent && <span style={{ marginLeft:'auto', fontSize:11, color:'#6D28D9' }}>current</span>}
              </button>
            );
          })}
        </div>
      </Modal>
    );
  }

  function DigestModal() {
    const week   = entries.filter(e => Date.now() - new Date(e.ts).getTime() < 7*864e5);
    const unseen = week.filter(e => e.author !== partner && !e.acked).length;
    const byCat: Record<string, typeof entries> = {};
    week.forEach(e => { byCat[e.category] = [...(byCat[e.category]||[]), e]; });
    return (
      <Modal title="🗓 Weekly Digest" onClose={() => setModal(null)}>
        {week.length === 0
          ? <p style={{ textAlign:'center', color:'#9CA3AF', padding:'24px 0' }}>No entries from the last 7 days.</p>
          : <>
            <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:10, padding:'11px 15px', marginBottom:18, fontSize:13, color:'#92400E' }}>
              <strong>{week.length}</strong> entries this week · <strong>{unseen}</strong> new for you
            </div>
            {CATS.filter(c => byCat[c.id]?.length).map(cat => (
              <div key={cat.id} style={{ marginBottom:16 }}>
                <div style={{ fontSize:12.5, fontWeight:600, color:'#374151', marginBottom:7 }}>{cat.e} {cat.l} <span style={{ color:'#9CA3AF', fontWeight:400 }}>({byCat[cat.id].length})</span></div>
                {byCat[cat.id].map(e => (
                  <div key={e.id} style={{ display:'flex', gap:8, marginBottom:5, fontSize:12.5, color:'#4B5563', lineHeight:1.4 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:getMemberColor(e.author), flexShrink:0, marginTop:5, display:'inline-block' }} />
                    <span>{e.text}</span>
                  </div>
                ))}
              </div>
            ))}
          </>
        }
      </Modal>
    );
  }

  function InsightsModal() {
    const total     = entries.length;
    const completed = entries.filter(e => e.completed).length;
    const byCat     = Object.fromEntries(CATS.map(c => [c.id, entries.filter(e => e.category===c.id && !e.completed).length]));
    const maxCat    = Math.max(...Object.values(byCat), 1);
    const byMember: Record<string,number> = {};
    entries.forEach(e => { byMember[e.author] = (byMember[e.author]||0)+1; });
    const overdue   = entries.filter(e => e.dueDate && !e.completed && new Date(e.dueDate) < new Date()).length;
    return (
      <Modal title="📊 Insights" onClose={() => setModal(null)}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
          {([['Pending', total-completed, '#F9FAFB', '#1F2937'], ['Completed', completed, '#F0FDF4', '#16A34A'], ['Overdue', overdue, '#FEF2F2', '#DC2626']] as const).map(([l, n, bg, col]) => (
            <div key={l} style={{ background:bg, borderRadius:10, padding:14, textAlign:'center' }}>
              <div style={{ fontSize:24, fontWeight:700, color:col }}>{n}</div>
              <div style={{ fontSize:11, color:'#9CA3AF', marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:10 }}>Active by category</div>
          {CATS.filter(c => c.id !== 'completed' && byCat[c.id] > 0).map(c => (
            <div key={c.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <span style={{ fontSize:14, width:20 }}>{c.e}</span>
              <span style={{ fontSize:11, color:'#6B7280', width:65 }}>{c.l}</span>
              <div style={{ flex:1, background:'#F3F4F6', borderRadius:50, height:8 }}>
                <div style={{ width:`${Math.round(byCat[c.id]/maxCat*100)}%`, height:'100%', borderRadius:50, background:'#6B4E71', minWidth:4 }} />
              </div>
              <span style={{ fontSize:12, fontWeight:600, color:'#374151', width:18, textAlign:'right' }}>{byCat[c.id]}</span>
            </div>
          ))}
        </div>
        {Object.keys(byMember).length > 0 && (
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:10 }}>Contributions</div>
            {Object.entries(byMember).sort((a,b)=>b[1]-a[1]).map(([name, count]) => {
              const col = getMemberColor(name);
              const max = Math.max(...Object.values(byMember), 1);
              return (
                <div key={name} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <div style={{ width:22, height:22, borderRadius:'50%', background:col, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'white', flexShrink:0 }}>{name[0]}</div>
                  <span style={{ fontSize:12, color:'#6B7280', flex:1 }}>{name}</span>
                  <div style={{ flex:1, background:'#F3F4F6', borderRadius:50, height:8, maxWidth:90 }}>
                    <div style={{ width:`${Math.round(count/max*100)}%`, height:'100%', borderRadius:50, background:col }} />
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, color:'#374151', width:18, textAlign:'right' }}>{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    );
  }

  return (
    <>
      <Header
        household={household}
        onInvite={() => setModal('invite')}
        onBoardActions={() => setModal('boardActions')}
        onInsights={() => setModal('insights')}
        onDigest={() => setModal('digest')}
        onSignOut={signOut}
        isAdmin={myRole === 'admin'}
      />
      <Board
        entries={entries}
        partner={partner}
        isAdmin={myRole === 'admin'}
        getMemberColor={getMemberColor}
        onAck={ackEntry}
        onComplete={completeEntry}
        onDelete={deleteEntry}
        onReassign={id => setReassignId(id)}
        onOpenDetail={id => setDetailId(id)}
        onCategoryMove={moveEntry}
        onOpenChatFor={cat => setChatHintCat(cat)}
        onAdd={(text, cat) => addEntry(text, cat, partner)}
      />
      <Chat
        partner={partner}
        entries={entries}
        hintCat={chatHintCat}
        onAdd={(text, cat) => { addEntry(text, cat, partner); setChatHintCat(null); }}
        onDelete={deleteEntry}
      />
      {modal === 'invite'       && <InviteModal />}
      {modal === 'boardActions' && <BoardActionsModal />}
      {modal === 'digest'       && <DigestModal />}
      {modal === 'insights'     && <InsightsModal />}
      {detailId                 && <CardDetailModal />}
      {reassignId               && <ReassignModal />}
    </>
  );
}
