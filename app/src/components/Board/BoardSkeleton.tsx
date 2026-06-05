function SkeletonCard({ width = '100%' }: { width?: string }) {
  return (
    <div style={{ background:'white', borderRadius:9, padding:'10px 12px', boxShadow:'0 1px 4px rgba(0,0,0,0.07)' }}>
      <div style={{ display:'flex', gap:8, marginBottom:8 }}>
        <div style={{ width:20, height:20, borderRadius:'50%', background:'#E5E7EB', flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div style={{ height:10, background:'#E5E7EB', borderRadius:4, marginBottom:5, width }} />
          <div style={{ height:10, background:'#F3F4F6', borderRadius:4, width:'60%' }} />
        </div>
      </div>
      <div style={{ height:8, background:'#F9FAFB', borderRadius:4, width:'30%', marginLeft:28 }} />
    </div>
  );
}

export default function BoardSkeleton() {
  const cols = [
    { e:'✅', l:'Tasks',     n:2 },
    { e:'💭', l:'Worries',   n:1 },
    { e:'💡', l:'Ideas',     n:3 },
    { e:'🛒', l:'Purchases', n:1 },
  ];

  return (
    <div className="board" style={{ pointerEvents:'none' }}>
      {cols.map(col => (
        <div key={col.l} className="col" style={{ opacity:0.7 }}>
          <div className="col-head" style={{ background:'#F9FAFB', color:'#9CA3AF' }}>
            <span className="col-emoji">{col.e}</span>
            <span className="col-label">{col.l}</span>
            <div style={{ width:16, height:16, background:'#E5E7EB', borderRadius:50 }} />
          </div>
          <div className="col-body" style={{ gap:6, display:'flex', flexDirection:'column' }}>
            {Array.from({ length: col.n }).map((_, i) => (
              <SkeletonCard key={i} width={i % 2 === 0 ? '90%' : '75%'} />
            ))}
          </div>
        </div>
      ))}
      <style>{`
        @keyframes shimmer { 0%{opacity:1} 50%{opacity:0.5} 100%{opacity:1} }
        .board > .col { animation: shimmer 1.4s ease-in-out infinite; }
        .board > .col:nth-child(2) { animation-delay: 0.15s; }
        .board > .col:nth-child(3) { animation-delay: 0.3s; }
        .board > .col:nth-child(4) { animation-delay: 0.45s; }
      `}</style>
    </div>
  );
}
