import { useState, useEffect, useRef } from 'react';
import type { Entry, Category } from '../../types';
import Card from './Card';
import { detectCat, detectCatAI } from '../../utils/detectCat';

const CATS: Category[] = [
  { id:'task',       e:'✅', l:'Tasks' },
  { id:'worry',      e:'💭', l:'Worries' },
  { id:'idea',       e:'💡', l:'Ideas' },
  { id:'purchase',   e:'🛒', l:'Purchases' },
  { id:'trip',       e:'✈️', l:'Trips' },
  { id:'life-admin', e:'📋', l:'Life Admin' },
  { id:'other',      e:'📝', l:'Other' },
  { id:'completed',  e:'☑️',  l:'Completed' },
];

const CAT_DEFS: Record<string, { desc: string; examples: string[] }> = {
  task:       { desc: 'Things you need to do — action items with a clear outcome.', examples: ['Call the dentist', 'Book car service', 'Email the landlord'] },
  worry:      { desc: 'Things weighing on your mind. Capture it so you can let it go.', examples: ["What if we can't afford the holiday?", "Stressed about the lease renewal"] },
  idea:       { desc: 'Things to explore or try someday. No pressure, just capture it.', examples: ['Weekend trip to the coast', 'Start a savings jar', 'Redesign the living room'] },
  purchase:   { desc: 'Things to buy, order, or pick up.', examples: ['Oat milk and eggs', 'New running shoes', 'Replacement kitchen bulbs'] },
  trip:       { desc: 'Travel plans, bookings, and anything trip-related.', examples: ['Book flights to New York', 'Research hotels in Rome', 'Renew passport'] },
  'life-admin':{ desc: 'Background tasks that keep life running — often time-sensitive.', examples: ['Renew car insurance', 'File tax return', 'Cancel unused subscription'] },
  other:      { desc: "Anything that doesn't fit neatly elsewhere.", examples: ['Movie recommendation', 'Book from Priya', 'Random thought'] },
  completed:  { desc: 'Items you\'ve marked as done. They live here for reference.', examples: [] },
};

const EMPTY_HINTS: Record<string, { title: string; hint: string }> = {
  task:       { title: 'No tasks yet',        hint: 'What needs to get done?' },
  worry:      { title: 'Nothing on your mind', hint: 'Share what\'s bothering you' },
  idea:       { title: 'No ideas yet',         hint: 'What have you been thinking about?' },
  purchase:   { title: 'Nothing to buy',       hint: 'Add something to the list' },
  trip:       { title: 'No trips planned',     hint: 'Where do you want to go?' },
  'life-admin':{ title: 'All clear',           hint: 'Anything to file or renew?' },
  other:      { title: 'Nothing here',         hint: 'Drop anything that doesn\'t fit elsewhere' },
  completed:  { title: 'Nothing completed yet', hint: 'Mark a task done and it\'ll appear here' },
};

interface Props {
  entries:        Entry[];
  partner:        string;
  isAdmin:        boolean;
  getMemberColor: (name: string) => string;
  onAck:          (id: string) => void;
  onComplete:     (id: string) => void;
  onDelete:       (id: string) => void;
  onReassign:     (id: string) => void;
  onOpenDetail:   (id: string) => void;
  onCategoryMove: (id: string, cat: string) => void;
  onOpenChatFor:  (cat: string) => void;
  onAdd:          (text: string, cat: string) => void;
}

export default function Board({ entries, partner, isAdmin, getMemberColor, onAck, onComplete, onDelete, onReassign, onOpenDetail, onCategoryMove, onOpenChatFor, onAdd }: Props) {
  const [dragId, setDragId]       = useState<string | null>(null);
  const [overCat, setOverCat]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('task');
  const [quickText, setQuickText] = useState('');
  const [addedCat, setAddedCat]   = useState<string | null>(null);
  const [openCats, setOpenCats]   = useState<Set<string>>(new Set(CATS.map(c => c.id)));
  const [tooltipCat, setTooltipCat] = useState<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && entries.length > 0) {
      initializedRef.current = true;
      setOpenCats(new Set(
        CATS.filter(cat => {
          if (cat.id === 'completed') return false;
          return entries.some(e => e.category === cat.id && !e.completed);
        }).map(c => c.id)
      ));
    }
  }, [entries]);

  function toggleCat(id: string) {
    setOpenCats(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const catLabels: Record<string, string> = {
    task:'Tasks', worry:'Worries', idea:'Ideas', purchase:'Purchases',
    trip:'Trips', 'life-admin':'Life Admin', other:'Other',
  };
  const catEmoji: Record<string, string> = {
    task:'✅', worry:'💭', idea:'💡', purchase:'🛒',
    trip:'✈️', 'life-admin':'📋', other:'📝',
  };

  const detectedCat = quickText.trim() ? detectCat(quickText) : null;

  async function submitQuick() {
    const text = quickText.trim();
    if (!text) return;
    setQuickText('');
    const { category: cat } = await detectCatAI(text);
    onAdd(text, cat);
    setAddedCat(cat);
    setTimeout(() => setAddedCat(null), 2000);
  }

  function getCards(cat: Category) {
    return cat.id === 'completed'
      ? entries.filter(e => e.completed)
      : entries.filter(e => e.category === cat.id && !e.completed);
  }

  const colTints: Record<string, { bg: string; color: string }> = {
    task:       { bg:'#EFF6FF', color:'#1D4ED8' },
    worry:      { bg:'#FFFBEB', color:'#B45309' },
    idea:       { bg:'#F5F3FF', color:'#6D28D9' },
    purchase:   { bg:'#F0FDF4', color:'#166534' },
    trip:       { bg:'#F0F9FF', color:'#0369A1' },
    'life-admin':{ bg:'#F1F5F9', color:'#475569' },
    other:      { bg:'#F9FAFB', color:'#6B7280' },
    completed:  { bg:'#F0FDF4', color:'#166534' },
  };

  void activeTab; void setActiveTab;

  return (
    <>
      {/* Quick add bar */}
      <div style={{ padding:'12px 16px 0', maxWidth:680, margin:'0 auto' }}>
        <div style={{ display:'flex', gap:8, alignItems:'center', background:'#fff', border:'1.5px solid #E2E8F0', borderRadius:12, padding:'8px 12px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <span style={{ fontSize:20 }}>{detectedCat ? catEmoji[detectedCat] : '✏️'}</span>
          <input
            style={{ flex:1, border:'none', outline:'none', fontSize:15, background:'transparent', color:'#1E293B' }}
            placeholder="Add anything — tasks, ideas, worries…"
            value={quickText}
            onChange={e => setQuickText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') void submitQuick(); }}
          />
          {detectedCat && (
            <span style={{ fontSize:11, color:'#64748B', background:'#F1F5F9', borderRadius:6, padding:'2px 8px', whiteSpace:'nowrap' }}>
              → {catLabels[detectedCat]}
            </span>
          )}
          <button
            onClick={() => void submitQuick()}
            style={{ background:'#1E293B', color:'#fff', border:'none', borderRadius:8, padding:'6px 14px', fontSize:13, fontWeight:600, cursor:'pointer', opacity: quickText.trim() ? 1 : 0.4 }}
          >Add</button>
        </div>
        {addedCat && (
          <div style={{ textAlign:'center', marginTop:6, fontSize:12, color:'#64748B' }}>
            {catEmoji[addedCat]} Added to {catLabels[addedCat]}
          </div>
        )}
      </div>

      <div className="board">
        {CATS.map(cat => {
          const cards = getCards(cat);
          const tint  = colTints[cat.id] || colTints.other;

          const isOpen = openCats.has(cat.id);
          return (
            <div key={cat.id} className={`col ${isOpen ? 'open' : ''}`} data-cat={cat.id}>
              <div className="col-head" style={{ background: tint.bg, color: tint.color }} onClick={() => toggleCat(cat.id)}>
                <span className="col-emoji">{cat.e}</span>
                <span className="col-label">{cat.l}</span>
                <span className="col-count">{cards.length}</span>
                <span
                  style={{ fontSize:13, opacity:0.55, cursor:'pointer', userSelect:'none', flexShrink:0 }}
                  onClick={e => { e.stopPropagation(); setTooltipCat(tooltipCat === cat.id ? null : cat.id); }}
                  title="What goes here?"
                >ⓘ</span>
                {cat.id !== 'completed' && (
                  <button className="col-plus" onClick={e => { e.stopPropagation(); onOpenChatFor(cat.id); }}>+</button>
                )}
                <span className="col-chevron">▼</span>
              </div>
              {tooltipCat === cat.id && CAT_DEFS[cat.id] && (
                <div style={{ padding:'9px 12px 10px', fontSize:12, background:'rgba(255,255,255,0.85)', borderBottom:'1px solid rgba(0,0,0,0.07)', lineHeight:1.55 }}>
                  <div style={{ fontWeight:600, color: tint.color, marginBottom:3 }}>{CAT_DEFS[cat.id].desc}</div>
                  {CAT_DEFS[cat.id].examples.length > 0 && (
                    <div style={{ color:'#6B7280', fontSize:11 }}>e.g. {CAT_DEFS[cat.id].examples.join(' · ')}</div>
                  )}
                </div>
              )}
              <div
                className={`col-body ${overCat === cat.id ? 'over' : ''}`}
                onDragOver={e => { e.preventDefault(); setOverCat(cat.id); }}
                onDragLeave={() => setOverCat(null)}
                onDrop={e => {
                  e.preventDefault();
                  setOverCat(null);
                  if (dragId) onCategoryMove(dragId, cat.id);
                  setDragId(null);
                }}
              >
                {cards.length === 0
                  ? <div className="col-empty">
                      <div style={{ fontWeight:600, color:'#94A3B8', marginBottom:4 }}>{EMPTY_HINTS[cat.id]?.title}</div>
                      <div style={{ fontSize:10.5, color:'#CBD5E1' }}>{EMPTY_HINTS[cat.id]?.hint}</div>
                    </div>
                  : cards.map(entry => (
                    <Card
                      key={entry.id}
                      entry={entry}
                      partner={partner}
                      isAdmin={isAdmin}
                      color={getMemberColor(entry.author)}
                      onAck={onAck}
                      onComplete={onComplete}
                      onDelete={onDelete}
                      onReassign={onReassign}
                      onOpenDetail={onOpenDetail}
                      onDragStart={(e, id) => { setDragId(id); e.currentTarget.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; }}
                      onDragEnd={e => { e.currentTarget.classList.remove('dragging'); setOverCat(null); }}
                    />
                  ))
                }
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export { CATS };
