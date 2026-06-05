interface Props { onSignIn: () => void; error: string; }

export default function LoginScreen({ onSignIn, error }: Props) {
  return (
    <div style={{ position:'fixed', inset:0, background:'#EEEAE3', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
      <div style={{ background:'white', borderRadius:24, padding:'40px 36px', textAlign:'center', boxShadow:'0 8px 40px rgba(0,0,0,0.10)', maxWidth:340, width:'100%' }}>
        <div style={{ fontSize:42, marginBottom:12 }}>🧠</div>
        <div style={{ fontSize:20, fontWeight:700, color:'#2D2535', marginBottom:6 }}>Second Brain</div>
        <div style={{ fontSize:13, color:'#9CA3AF', marginBottom:28 }}>Sign in to access your shared board</div>
        <button onClick={onSignIn} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, width:'100%', padding:'11px 20px', borderRadius:50, border:'1px solid #E5E7EB', background:'white', fontSize:14, fontWeight:500, color:'#374151', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
          Sign in with Google
        </button>
        {error && <div style={{ fontSize:12, color:'#DC2626', marginTop:14 }}>{error}</div>}
      </div>
    </div>
  );
}
