import { useState } from 'react';
import type { Entry, Category } from '../../types';
import Card from './Card';

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
  getMemberColor: (name: string) => string;
  onAck:          (id: string) => void;
  onComplete:     (id: string) => void;
  onDelete:       (id: string) => void;
  onReassign:     (id: string) => void;
  onOpenDetail:   (id: string) => void;
  onCategoryMove: (id: string, cat: string) => void;
  onOpenChatFor:  (cat: string) => void;
}

export default function Board({ entries, partner, getMemberColor, onAck, onComplete, onDelete, onReassign, onOpenDetail, onCategoryMove, onOpenChatFor }: Props) {
  const [dragId, setDragId]       = useState<string | null>(null);
  const [overCat, setOverCat]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('task');
  const isMobile = window.innerWidth <= 640;

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

  return (
    <>
      {/* Mobile tab bar */}
      <div className="tab-bar">
        {CATS.map(cat => {
          const count = getCards(cat).length;
          return (
            <button key={cat.id} className={`tab-btn ${activeTab === cat.id ? 'active' : ''}`} onClick={() => setActiveTab(cat.id)}>
              {cat.e} {count}
            </button>
          );
        })}
      </div>

      <div className="board">
        {CATS.map(cat => {
          const cards    = getCards(cat);
          const tint     = colTints[cat.id] || colTints.other;
          const isActive = !isMobile || activeTab === cat.id;

          return (
            <div key={cat.id} className={`col ${isActive ? 'mobile-active' : ''}`} data-cat={cat.id}>
              <div className="col-head" style={{ background: tint.bg, color: tint.color }}>
                <span className="col-emoji">{cat.e}</span>
                <span className="col-label">{cat.l}</span>
                <span className="col-count">{cards.length}</span>
                {cat.id !== 'completed' && (
                  <button className="col-plus" onClick={() => onOpenChatFor(cat.id)}>+</button>
                )}
              </div>
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
                      <div style={{ fontSize:24, marginBottom:6 }}>{cat.e}</div>
                      <div style={{ fontWeight:600, color:'#94A3B8', marginBottom:4 }}>{EMPTY_HINTS[cat.id]?.title}</div>
                      <div style={{ fontSize:10.5, color:'#CBD5E1' }}>{EMPTY_HINTS[cat.id]?.hint}</div>
                    </div>
                  : cards.map(entry => (
                    <Card
                      key={entry.id}
                      entry={entry}
                      partner={partner}
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
