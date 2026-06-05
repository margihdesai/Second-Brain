import type { Entry } from '../../types';

interface Props {
  entry:        Entry;
  partner:      string;
  color:        string;
  isAdmin:      boolean;
  onAck:        (id: string) => void;
  onComplete:   (id: string) => void;
  onDelete:     (id: string) => void;
  onReassign:   (id: string) => void;
  onOpenDetail: (id: string) => void;
  onDragStart:  (e: React.DragEvent, id: string) => void;
  onDragEnd:    (e: React.DragEvent) => void;
}

function ago(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m  = Math.floor(ms / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h';
  const d = Math.floor(h / 24);
  if (d === 1) return 'yesterday';
  if (d < 7)  return d + 'd';
  return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric' });
}

function formatDue(isoDate: string) {
  const today = new Date(); today.setHours(0,0,0,0);
  const due   = new Date(new Date(isoDate).toDateString());
  const diff  = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0)   return `Overdue ${Math.abs(diff)}d`;
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  return 'Due ' + new Date(isoDate).toLocaleDateString('en-US', { month:'short', day:'numeric' });
}

function isOverdue(e: Entry) {
  if (!e.dueDate || e.completed) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  return new Date(e.dueDate) < today;
}

export default function Card({ entry: e, partner, color, isAdmin, onAck, onComplete, onDelete, onReassign, onOpenDetail, onDragStart, onDragEnd }: Props) {
  const isOwn      = e.author === partner;
  const canDelete  = isOwn || isAdmin;
  const done  = e.completed;
  const over  = isOverdue(e);
  const due   = e.dueDate ? formatDue(e.dueDate) : null;

  return (
    <div
      draggable
      onDragStart={ev => onDragStart(ev, e.id)}
      onDragEnd={onDragEnd}
      onClick={() => onOpenDetail(e.id)}
      className={`card ${done ? 'done' : ''} ${over ? 'overdue' : ''} ${e.acked ? 'acked' : ''}`}
    >
      {/* Author + text */}
      <div style={{ display:'flex', gap:8, marginBottom:6 }}>
        <div style={{ width:20, height:20, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:800, color:'white', flexShrink:0, marginTop:2 }}>
          {e.author[0]}
        </div>
        <div className="card-text">{e.text}</div>
      </div>

      {/* Due / notes */}
      {(due || e.notes) && (
        <div style={{ paddingLeft:28, marginBottom:6 }}>
          {due && <span className={`card-due ${over ? 'overdue' : ''}`}>{due}</span>}
          {e.notes && <div className="card-notes">📝 {e.notes}</div>}
        </div>
      )}

      {/* Footer */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingLeft:28 }}>
        <span style={{ fontSize:10, color:'#D1D5DB' }}>{ago(e.ts)}</span>

        <div style={{ display:'flex', gap:2 }} onClick={ev => ev.stopPropagation()}>
          {/* Complete */}
          <button className={`card-btn ${done ? 'done-btn' : 'cmp'}`} title={done ? 'Undo' : 'Mark complete'} onClick={() => onComplete(e.id)}>
            {done ? '↩' : '✓'}
          </button>
          {/* Move */}
          <button className="card-btn rsn" title="Move to…" onClick={() => onReassign(e.id)}>⇢</button>
          {/* Ack */}
          {!isOwn
            ? <button className="card-btn ack" title={e.acked ? 'Un-acknowledge' : 'Acknowledge'} onClick={() => onAck(e.id)}>{e.acked ? '✓' : '👋'}</button>
            : e.acked ? <span style={{ fontSize:9, color:'#6EE7B7', padding:'2px 4px' }}>seen</span> : null
          }
          {/* Delete — own entries or admin only */}
          {canDelete && <button className="card-btn del" title="Delete" onClick={() => onDelete(e.id)}>×</button>}
        </div>
      </div>
    </div>
  );
}
