import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase.js";
import { STORES } from "../lib/stores.js";

const PASS = "kreamz@admin2024";
const BASE = typeof window !== "undefined" ? window.location.origin : "https://kreamz-feedback.vercel.app";

function qr(storeId, size = 180) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(BASE + "/?store=" + storeId)}&margin=8`;
}
function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
function pct(n) { return (n * 100).toFixed(1) + "%"; }
function fmtDate(ts) {
  if (!ts) return "—";
  try { const d = ts.toDate ? ts.toDate() : new Date(ts); return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return "—"; }
}

const S = {
  body: { display:"flex", minHeight:"100vh", background:"#0d0118", color:"#f0e8f5", fontFamily:"'DM Sans',system-ui,sans-serif" },
  // Login
  lbg: { minHeight:"100vh", background:"linear-gradient(135deg,#0d0118,#2d0140)", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'DM Sans',system-ui,sans-serif" },
  lcard: { background:"rgba(255,255,255,0.06)", border:"1px solid rgba(233,30,140,0.3)", borderRadius:22, padding:"2.5rem 2rem", maxWidth:380, width:"100%", textAlign:"center" },
  ltitle: { fontFamily:"'Playfair Display',serif", color:"white", fontSize:"1.6rem", fontWeight:800, margin:"12px 0 4px" },
  lsub: { color:"rgba(255,255,255,0.4)", fontSize:13, marginBottom:24 },
  linput: { width:"100%", padding:"0.8rem 1rem", borderRadius:11, border:"1.5px solid rgba(233,30,140,0.3)", background:"rgba(255,255,255,0.07)", color:"white", fontSize:15, outline:"none", boxSizing:"border-box", marginBottom:10 },
  lbtn: { width:"100%", padding:"0.85rem", background:"linear-gradient(135deg,#e91e8c,#c41674)", color:"white", border:"none", borderRadius:12, fontSize:16, fontWeight:700, cursor:"pointer" },
  lerr: { color:"#f87171", fontSize:13, marginBottom:10 },
  // Sidebar
  sidebar: { width:230, minWidth:230, background:"rgba(255,255,255,0.03)", borderRight:"1px solid rgba(233,30,140,0.12)", display:"flex", flexDirection:"column", padding:"1.25rem 0.85rem", position:"sticky", top:0, height:"100vh", overflowY:"auto" },
  brand: { display:"flex", alignItems:"center", gap:10, marginBottom:24, padding:"0 4px" },
  brandName: { fontFamily:"'Playfair Display',serif", color:"white", fontWeight:800, fontSize:16 },
  brandSub: { color:"rgba(255,255,255,0.35)", fontSize:10, letterSpacing:"0.05em" },
  nav: { display:"flex", flexDirection:"column", gap:4, flex:1 },
  nbtn: { display:"flex", alignItems:"center", gap:8, padding:"0.65rem 0.9rem", borderRadius:10, border:"none", background:"transparent", color:"rgba(255,255,255,0.5)", fontSize:14, fontWeight:500, cursor:"pointer", textAlign:"left", width:"100%" },
  nbtnA: { background:"rgba(233,30,140,0.18)", color:"#e91e8c", fontWeight:700 },
  sfooter: { borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:12, marginTop:8 },
  logoutBtn: { background:"transparent", border:"1px solid rgba(233,30,140,0.25)", color:"rgba(255,255,255,0.4)", borderRadius:8, padding:"5px 12px", fontSize:12, cursor:"pointer", width:"100%", marginTop:8 },
  // Main
  main: { flex:1, overflowY:"auto", padding:"2rem 1.75rem" },
  ptitle: { fontFamily:"'Playfair Display',serif", color:"white", fontSize:"1.65rem", fontWeight:800, margin:"0 0 4px" },
  psub: { color:"rgba(255,255,255,0.4)", fontSize:13, marginBottom:20 },
  // KPI
  kgrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))", gap:12, marginBottom:20 },
  kcard: { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(233,30,140,0.12)", borderRadius:14, padding:"1.1rem", textAlign:"center" },
  kval: { color:"#e91e8c", fontSize:28, fontWeight:800, lineHeight:1, marginBottom:4 },
  klbl: { color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:500 },
  // Card
  card: { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(233,30,140,0.1)", borderRadius:16, padding:"1.25rem", marginBottom:16 },
  ctitle: { color:"white", fontWeight:700, fontSize:14, marginBottom:12 },
  // Table
  th: { textAlign:"left", padding:"6px 10px", color:"rgba(255,255,255,0.35)", fontSize:10, borderBottom:"1px solid rgba(255,255,255,0.06)", textTransform:"uppercase", letterSpacing:"0.06em" },
  td: { padding:"8px 10px", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:13 },
  badge: { background:"rgba(233,30,140,0.2)", color:"#e91e8c", borderRadius:99, padding:"2px 9px", fontSize:12, fontWeight:700 },
  // Feedback rows
  fbrow: { display:"flex", alignItems:"flex-start", gap:10, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" },
  avatar: { width:36, height:36, minWidth:36, borderRadius:"50%", background:"linear-gradient(135deg,#e91e8c,#c41674)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"white", fontSize:15 },
  // Filters
  filters: { display:"flex", flexWrap:"wrap", gap:10, marginBottom:16 },
  sel: { background:"rgba(255,255,255,0.07)", border:"1px solid rgba(233,30,140,0.2)", borderRadius:10, color:"white", padding:"8px 12px", fontSize:13, outline:"none" },
  srch: { flex:1, minWidth:200, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(233,30,140,0.2)", borderRadius:10, color:"white", padding:"8px 12px", fontSize:13, outline:"none" },
  // QR grid
  qrgrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 },
  qrcard: { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(233,30,140,0.12)", borderRadius:16, padding:12, display:"flex", flexDirection:"column", alignItems:"center", gap:6 },
  qrid: { background:"rgba(233,30,140,0.15)", color:"#e91e8c", borderRadius:6, padding:"2px 7px", fontSize:10, fontWeight:700 },
  qrimgwrap: { background:"white", borderRadius:10, padding:5, display:"flex", justifyContent:"center" },
  qrbtn: { flex:1, padding:"7px 0", background:"transparent", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, color:"rgba(255,255,255,0.6)", fontSize:12, fontWeight:600, cursor:"pointer" },
  errbox: { background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:12, padding:16, color:"#f87171", fontSize:13, marginBottom:16 },
  loading: { textAlign:"center", color:"rgba(255,255,255,0.3)", padding:32, fontSize:13 },
  empty: { textAlign:"center", color:"rgba(255,255,255,0.3)", padding:24, fontSize:13 },
};

// ── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(""); const [show, setShow] = useState(false);
  function go(e) { e.preventDefault(); if (pw === PASS) onLogin(); else { setErr("Wrong password."); setPw(""); } }
  return (
    <div style={S.lbg}>
      <div style={S.lcard}>
        <div style={{ fontSize:48 }}>🍰</div>
        <h1 style={S.ltitle}>Kreamz Admin</h1>
        <p style={S.lsub}>Dashboard — Restricted Access</p>
        <form onSubmit={go}>
          <div style={{ position:"relative" }}>
            <input style={S.linput} type={show ? "text" : "password"} placeholder="Enter admin password"
              value={pw} onChange={e => { setPw(e.target.value); setErr(""); }} autoFocus />
            <button type="button" onClick={() => setShow(s => !s)}
              style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:15 }}>
              {show ? "🙈" : "👁️"}
            </button>
          </div>
          {err && <p style={S.lerr}>{err}</p>}
          <button style={S.lbtn} type="submit">Login →</button>
        </form>
        <p style={{ marginTop:16, fontSize:11, color:"rgba(255,255,255,0.2)" }}>kreamz@admin2024</p>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("overview");
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fbErr, setFbErr] = useState("");
  const [qrSearch, setQrSearch] = useState("");
  const [fbStore, setFbStore] = useState("All");
  const [fbDays, setFbDays] = useState("all");

  useEffect(() => {
    if (!authed) return;
    setLoading(true); setFbErr("");
    try {
      const q = query(collection(db, "feedbacks"), orderBy("createdAt", "desc"), limit(500));
      return onSnapshot(q,
        snap => { setFeedbacks(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
        err => { setFbErr(err.message); setLoading(false); }
      );
    } catch(e) { setFbErr(e.message); setLoading(false); }
  }, [authed]);

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  // Stats
  const total = feedbacks.length;
  const aOverall = avg(feedbacks.map(f => f.overall || 0)).toFixed(1);
  const aTaste = avg(feedbacks.filter(f => f.ratings?.taste).map(f => f.ratings.taste)).toFixed(1);
  const recPct = total ? Math.round(feedbacks.filter(f => f.recommend === 0).length / total * 100) : 0;
  const withEmail = feedbacks.filter(f => f.email).length;
  const withBday = feedbacks.filter(f => f.birthday).length;

  const storeStats = {};
  feedbacks.forEach(f => {
    const k = f.store || "Unknown";
    if (!storeStats[k]) storeStats[k] = { count: 0, scores: [] };
    storeStats[k].count++;
    if (f.overall) storeStats[k].scores.push(f.overall);
  });
  const lb = Object.entries(storeStats)
    .map(([n, s]) => ({ n, count: s.count, avg: avg(s.scores).toFixed(1) }))
    .sort((a, b) => b.count - a.count).slice(0, 10);

  const filtFbs = feedbacks.filter(f => {
    if (fbStore !== "All" && f.store !== fbStore) return false;
    if (fbDays !== "all") {
      const cut = new Date(); cut.setDate(cut.getDate() - parseInt(fbDays));
      const d = f.createdAt?.toDate ? f.createdAt.toDate() : new Date(0);
      if (d < cut) return false;
    }
    return true;
  });

  const filtStores = STORES.filter(s => {
    const q = qrSearch.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.afe?.toLowerCase().includes(q);
  });

  const TABS = [
    { id: "overview", icon: "📊", label: "Overview" },
    { id: "feedbacks", icon: "💬", label: "Feedbacks" },
    { id: "customers", icon: "🎂", label: "Customers" },
    { id: "qrcodes", icon: "📷", label: "QR Codes" },
  ];

  return (
    <div style={S.body}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.brand}>
          <span style={{ fontSize:26 }}>🍰</span>
          <div><div style={S.brandName}>Kreamz</div><div style={S.brandSub}>ADMIN DASHBOARD</div></div>
        </div>
        <nav style={S.nav}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ ...S.nbtn, ...(tab === t.id ? S.nbtnA : {}) }}>
              {t.icon} {t.label}
            </button>
          ))}
        </nav>
        <div style={S.sfooter}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginBottom:4 }}>
            <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:"#22c55e", marginRight:5 }} />
            Live · {total} feedbacks
          </div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", marginBottom:4 }}>{STORES.length} outlets · {STORES.length} QR codes</div>
          <button style={S.logoutBtn} onClick={() => setAuthed(false)}>Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main style={S.main}>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && <>
          <h1 style={S.ptitle}>Overview</h1>
          <p style={S.psub}>Live analytics across all {STORES.length} Kreamz outlets</p>

          {fbErr && <div style={S.errbox}>
            ⚠️ Firebase error: {fbErr}
            <div style={{ fontSize:12, marginTop:6, opacity:0.75 }}>
              Go to <strong>Firebase Console → Firestore → Rules</strong> and set: <code>allow read, write: if true;</code> then click Publish.
            </div>
          </div>}

          <div style={S.kgrid}>
            {[
              { icon:"💬", val:total, lbl:"Total Feedbacks" },
              { icon:"⭐", val:aOverall, lbl:"Avg Score /10" },
              { icon:"🎂", val:aTaste, lbl:"Avg Taste /5" },
              { icon:"❤️", val:recPct+"%", lbl:"Recommend" },
              { icon:"📧", val:withEmail, lbl:"Emails Collected" },
              { icon:"🎁", val:withBday, lbl:"Birthdays Saved" },
              { icon:"🏪", val:STORES.length, lbl:"Total Outlets" },
              { icon:"📷", val:STORES.length, lbl:"QR Codes Ready" },
            ].map((k, i) => (
              <div key={i} style={S.kcard}>
                <div style={{ fontSize:22, marginBottom:6 }}>{k.icon}</div>
                <div style={S.kval}>{k.val}</div>
                <div style={S.klbl}>{k.lbl}</div>
              </div>
            ))}
          </div>

          <div style={S.card}>
            <div style={S.ctitle}>🏆 Top Stores by Feedback Volume</div>
            {loading ? <div style={S.loading}>Connecting to Firebase...</div> :
             lb.length === 0 ? <div style={S.empty}>No feedbacks yet — share the QR codes to get started!</div> : (
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>
                  {["#","Store","AFE","Feedbacks","Avg /10"].map(h => <th key={h} style={S.th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {lb.map((s, i) => {
                    const store = STORES.find(x => x.name === s.n);
                    return (
                      <tr key={s.n}>
                        <td style={{ ...S.td, color:"#e91e8c", fontWeight:700 }}>{i+1}</td>
                        <td style={{ ...S.td, color:"white", fontWeight:600 }}>{s.n}</td>
                        <td style={{ ...S.td, color:"rgba(255,255,255,0.45)", fontSize:12 }}>{store?.afe || "—"}</td>
                        <td style={S.td}><span style={S.badge}>{s.count}</span></td>
                        <td style={{ ...S.td, color:"#e91e8c", fontWeight:700 }}>{s.avg}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div style={S.card}>
            <div style={S.ctitle}>🕐 Recent Feedbacks</div>
            {feedbacks.slice(0, 8).map(f => (
              <div key={f.id} style={S.fbrow}>
                <div style={S.avatar}>{(f.name || "A")[0].toUpperCase()}</div>
                <div style={{ flex:1 }}>
                  <div style={{ color:"white", fontWeight:600, fontSize:13 }}>
                    {f.name || "Anonymous"}
                    <span style={{ color:"rgba(255,255,255,0.35)", fontWeight:400, fontSize:12 }}> @ {f.store}</span>
                  </div>
                  {f.comment && <div style={{ color:"rgba(255,255,255,0.45)", fontSize:12, marginTop:2 }}>{f.comment}</div>}
                  <div style={{ color:"rgba(255,255,255,0.25)", fontSize:11, marginTop:3 }}>{fmtDate(f.createdAt)}</div>
                </div>
                <div style={{ background:"rgba(233,30,140,0.18)", color:"#e91e8c", borderRadius:8, padding:"3px 9px", fontWeight:800, fontSize:14, whiteSpace:"nowrap" }}>{f.overall || "—"}/10</div>
              </div>
            ))}
            {!loading && feedbacks.length === 0 && <div style={S.empty}>No feedbacks yet.</div>}
          </div>
        </>}

        {/* ── FEEDBACKS ── */}
        {tab === "feedbacks" && <>
          <h1 style={S.ptitle}>All Feedbacks</h1>
          <p style={S.psub}>{filtFbs.length} result{filtFbs.length !== 1 ? "s" : ""}</p>
          <div style={S.filters}>
            <select style={S.sel} value={fbStore} onChange={e => setFbStore(e.target.value)}>
              <option value="All">All Stores</option>
              {STORES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <select style={S.sel} value={fbDays} onChange={e => setFbDays(e.target.value)}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          {loading ? <div style={S.loading}>Loading...</div> :
           filtFbs.length === 0 ? <div style={S.empty}>No feedbacks match filters.</div> :
           filtFbs.map(f => (
            <div key={f.id} style={{ ...S.card, marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <div style={{ ...S.avatar, width:44, height:44, fontSize:18 }}>{(f.name || "A")[0].toUpperCase()}</div>
                <div style={{ flex:1 }}>
                  <div style={{ color:"white", fontWeight:700 }}>{f.name || "Anonymous"}</div>
                  <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:3 }}>
                    {f.phone && <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>📞 {f.phone}</span>}
                    {f.email && <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>📧 {f.email}</span>}
                    {f.birthday && <span style={{ color:"#f9a8d4", fontSize:12 }}>🎂 {f.birthday}</span>}
                    {f.anniversary && <span style={{ color:"#f9a8d4", fontSize:12 }}>💍 {f.anniversary}</span>}
                  </div>
                </div>
                <div style={{ background:"rgba(233,30,140,0.2)", color:"#e91e8c", borderRadius:10, padding:"4px 12px", fontWeight:800, fontSize:16 }}>{f.overall || "—"}/10</div>
              </div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:8, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span>📍 <strong style={{ color:"rgba(255,255,255,0.75)" }}>{f.store}</strong></span>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{fmtDate(f.createdAt)}</span>
              </div>
              {f.ratings && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 }}>
                  {Object.entries(f.ratings).map(([k, v]) => (
                    <span key={k} style={{ background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"3px 10px", fontSize:12 }}>
                      {k}: <strong style={{ color:"#e91e8c" }}>{v}/5</strong>
                    </span>
                  ))}
                </div>
              )}
              {f.comment && <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"8px 12px", fontSize:13, color:"rgba(255,255,255,0.6)", borderLeft:"3px solid #e91e8c", marginBottom:8 }}>💬 {f.comment}</div>}
              {f.recommend === 0 && <div style={{ fontSize:12, color:"#4ade80" }}>✅ Would recommend</div>}
              {f.recommend === 1 && <div style={{ fontSize:12, color:"#facc15" }}>🤔 Maybe recommend</div>}
              {f.recommend === 2 && <div style={{ fontSize:12, color:"#f87171" }}>❌ Would not recommend</div>}
            </div>
          ))}
        </>}

        {/* ── CUSTOMERS ── */}
        {tab === "customers" && <>
          <h1 style={S.ptitle}>Customer Database</h1>
          <p style={S.psub}>Emails, birthdays & anniversaries collected</p>
          {loading ? <div style={S.loading}>Loading...</div> : (
            <div style={S.card}>
              <div style={S.ctitle}>🎂 Birthdays & Special Occasions</div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>
                  {["Name","Phone","Email","Birthday","Anniversary","Store"].map(h => <th key={h} style={S.th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {feedbacks.filter(f => f.email || f.birthday || f.anniversary || f.phone).map(f => (
                    <tr key={f.id}>
                      <td style={{ ...S.td, color:"white", fontWeight:600 }}>{f.name || "Anonymous"}</td>
                      <td style={{ ...S.td, color:"rgba(255,255,255,0.55)", fontSize:12 }}>{f.phone || "—"}</td>
                      <td style={{ ...S.td, color:"rgba(255,255,255,0.55)", fontSize:12 }}>{f.email || "—"}</td>
                      <td style={{ ...S.td, color:"#f9a8d4", fontSize:12 }}>{f.birthday || "—"}</td>
                      <td style={{ ...S.td, color:"#f9a8d4", fontSize:12 }}>{f.anniversary || "—"}</td>
                      <td style={{ ...S.td, color:"rgba(255,255,255,0.45)", fontSize:12 }}>{f.store}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {feedbacks.filter(f => f.email || f.birthday || f.anniversary).length === 0 && (
                <div style={S.empty}>No customer details collected yet.</div>
              )}
            </div>
          )}
        </>}

        {/* ── QR CODES ── */}
        {tab === "qrcodes" && <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:16 }}>
            <div>
              <h1 style={S.ptitle}>QR Codes — All {STORES.length} Outlets</h1>
              <p style={S.psub}>Each QR auto-links to the feedback form for that specific store</p>
            </div>
            <button
              style={{ background:"linear-gradient(135deg,#e91e8c,#c41674)", color:"white", border:"none", borderRadius:12, padding:"10px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}
              onClick={() => filtStores.forEach((s, i) => setTimeout(() => window.open(qr(s.id, 400), "_blank"), i * 250))}>
              ⬇ Download All ({filtStores.length})
            </button>
          </div>

          <div style={S.filters}>
            <input style={S.srch} type="text" placeholder="🔍 Search store name, AFE..."
              value={qrSearch} onChange={e => setQrSearch(e.target.value)} />
          </div>

          <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginBottom:14 }}>
            Showing {filtStores.length} of {STORES.length} stores
          </div>

          <div style={S.qrgrid}>
            {filtStores.map(store => {
              const url = BASE + "/?store=" + encodeURIComponent(store.id);
              const stat = storeStats[store.name] || { count: 0, scores: [] };
              return (
                <div key={store.id} style={S.qrcard}>
                  <div style={{ display:"flex", justifyContent:"space-between", width:"100%" }}>
                    <span style={S.qrid}>{store.id}</span>
                    <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>{store.afe}</span>
                  </div>
                  <div style={S.qrimgwrap}>
                    <img src={qr(store.id, 170)} alt={store.name} width={170} height={170} loading="lazy" style={{ display:"block", borderRadius:6 }} />
                  </div>
                  <div style={{ fontWeight:700, color:"white", fontSize:13, textAlign:"center" }}>{store.name}</div>
                  <div style={{ display:"flex", justifyContent:"center", gap:10, fontSize:11, color:"rgba(255,255,255,0.4)" }}>
                    <span>💬 {stat.count}</span>
                    {stat.scores?.length > 0 && <span>⭐ {avg(stat.scores).toFixed(1)}/10</span>}
                  </div>
                  <div style={{ display:"flex", gap:6, width:"100%" }}>
                    <button style={S.qrbtn} onClick={() => { navigator.clipboard.writeText(url); alert("Link copied!"); }}>📋 Copy</button>
                    <button style={{ ...S.qrbtn, background:"rgba(233,30,140,0.18)", color:"#e91e8c", border:"1px solid rgba(233,30,140,0.35)" }}
                      onClick={() => window.open(qr(store.id, 400), "_blank")}>⬇ Save</button>
                  </div>
                </div>
              );
            })}
          </div>
          {filtStores.length === 0 && <div style={S.empty}>No stores match your search.</div>}
        </>}
      </main>
    </div>
  );
}
