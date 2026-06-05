import type { Household } from '../../types';

interface Props {
  household:       Household | null;
  onInvite:        () => void;
  onBoardActions:  () => void;
  onInsights:      () => void;
  onDigest:        () => void;
  onSignOut:       () => void;
  isAdmin?:        boolean;
}

const ghostBtn: React.CSSProperties = {
  padding:'5px 13px', borderRadius:50, fontSize:12, fontWeight:500, cursor:'pointer',
  border:'1px solid #E5E7EB', background:'white', color:'#6B7280', transition:'all 0.12s',
};

export default function Header({ household, onInvite, onBoardActions, onInsights, onDigest, onSignOut }: Props) {
  return (
    <header style={{ height:56, background:'white', borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', boxShadow:'0 1px 6px rgba(0,0,0,0.06)', position:'relative', zIndex:10 }}>
      <div style={{ fontSize:15, fontWeight:700, color:'#2D2535', display:'flex', alignItems:'center', gap:8 }}>
        🧠 {household?.name || 'Second Brain'}
        <span style={{ fontSize:11, fontWeight:400, color:'#9CA3AF', letterSpacing:'0.03em' }}>shared · private</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {household && <button style={ghostBtn} onClick={onInvite}>🔗 Invite</button>}
        {household && <button style={ghostBtn} onClick={onInsights}>📊 Insights</button>}
        {household && <button style={ghostBtn} onClick={onDigest}>🗓 Weekly Digest</button>}
        {household && (
          <button onClick={onBoardActions} title="Leave or delete this board"
            style={{ ...ghostBtn, color:'#DC2626', borderColor:'#FCA5A5' }}>🗑</button>
        )}
        <button style={ghostBtn} onClick={onSignOut}>Sign out</button>
      </div>
    </header>
  );
}
