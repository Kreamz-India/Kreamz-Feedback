import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase.js";
import { STORES, AFE_ZONES } from "../lib/stores.js";
import * as XLSX from "xlsx";

const ADMIN_PASS  = "kreamz@admin2024";
const WHO_OPTIONS = ["Customer", "Internal Team", "Franchise Owner", "Store Member"];

function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
function fmtDate(ts) {
  if (!ts) return "—";
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return "—"; }
}
function fmtDateExcel(ts) {
  if (!ts) return "";
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("en-IN");
  } catch { return ""; }
}

const C = {
  wrap:     { display:"flex", minHeight:"100vh", background:"#0c0116", color:"#f0e8f5", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:14 },
  sidebar:  { width:220, minWidth:220, background:"rgba(255,255,255,.035)", borderRight:"1px solid rgba(233,30,140,.13)", display:"flex", flexDirection:"column", padding:"1.2rem .8rem", position:"sticky", top:0, height:"100vh", overflowY:"auto" },
  main:     { flex:1, overflowY:"auto", padding:"1.75rem 2rem", maxWidth:1200 },
  brand:    { display:"flex", alignItems:"center", gap:10, marginBottom:22, padding:"0 4px" },
  brandTxt: { fontFamily:"'Playfair Display',serif", color:"white", fontWeight:800, fontSize:15, lineHeight:1.2 },
  brandSub: { color:"rgba(255,255,255,.3)", fontSize:10, letterSpacing:".05em" },
  nav:      { display:"flex", flexDirection:"column", gap:3, flex:1 },
  nb:       { display:"flex", alignItems:"center", gap:8, padding:".6rem .85rem", borderRadius:10, border:"none", background:"transparent", color:"rgba(255,255,255,.5)", fontSize:13.5, fontWeight:500, cursor:"pointer", textAlign:"left", width:"100%", transition:"all .15s" },
  nba:      { background:"rgba(233,30,140,.18)", color:"#e91e8c", fontWeight:700 },
  lbg:      { minHeight:"100vh", background:"linear-gradient(135deg,#0c0116,#280040)", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'DM Sans',system-ui,sans-serif" },
  lcard:    { background:"rgba(255,255,255,.06)", border:"1px solid rgba(233,30,140,.3)", borderRadius:22, padding:"2.5rem 2rem", maxWidth:380, width:"100%", textAlign:"center" },
  ph:       { marginBottom:18 },
  ptitle:   { fontFamily:"'Playfair Display',serif", color:"white", fontSize:"1.55rem", fontWeight:800, margin:"0 0 3px" },
  psub:     { color:"rgba(255,255,255,.4)", fontSize:12.5 },
  kgrid:    { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))", gap:10, marginBottom:18 },
  kcard:    { background:"rgba(255,255,255,.05)", border:"1px solid rgba(233,30,140,.13)", borderRadius:14, padding:"1rem .9rem", textAlign:"center" },
  kval:     { color:"#e91e8c", fontSize:26, fontWeight:800, lineHeight:1, marginBottom:3 },
  klbl:     { color:"rgba(255,255,255,.4)", fontSize:11 },
  card:     { background:"rgba(255,255,255,.04)", border:"1px solid rgba(233,30,140,.1)", borderRadius:16, padding:"1.2rem 1.25rem", marginBottom:14 },
  ctitle:   { color:"white", fontWeight:700, fontSize:13.5, marginBottom:11 },
  tbl:      { width:"100%", borderCollapse:"collapse" },
  th:       { textAlign:"left", padding:"7px 10px", color:"rgba(255,255,255,.32)", fontSize:10.5, borderBottom:"1px solid rgba(255,255,255,.06)", textTransform:"uppercase", letterSpacing:".05em", whiteSpace:"nowrap" },
  td:       { padding:"9px 10px", borderBottom:"1px solid rgba(255,255,255,.04)", verticalAlign:"top" },
  badge:    { background:"rgba(233,30,140,.2)", color:"#e91e8c", borderRadius:99, padding:"2px 9px", fontSize:11.5, fontWeight:700, display:"inline-block" },
  badgeG:   { background:"rgba(74,222,128,.15)", color:"#4ade80", borderRadius:99, padding:"2px 9px", fontSize:11, fontWeight:600, display:"inline-block" },
  badgeY:   { background:"rgba(250,204,21,.12)", color:"#facc15", borderRadius:99, padding:"2px 9px", fontSize:11, fontWeight:600, display:"inline-block" },
  badgeR:   { background:"rgba(248,113,113,.12)", color:"#f87171", borderRadius:99, padding:"2px 9px", fontSize:11, fontWeight:600, display:"inline-block" },
  badgeB:   { background:"rgba(147,197,253,.12)", color:"#93c5fd", borderRadius:99, padding:"2px 9px", fontSize:11, fontWeight:600, display:"inline-block" },
  frow:     { display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 },
  sel:      { background:"rgba(255,255,255,.07)", border:"1px solid rgba(233,30,140,.2)", borderRadius:10, color:"white", padding:"7px 11px", fontSize:12.5, outline:"none", cursor:"pointer" },
  srch:     { flex:1, minWidth:180, background:"rgba(255,255,255,.07)", border:"1px solid rgba(233,30,140,.2)", borderRadius:10, color:"white", padding:"7px 12px", fontSize:12.5, outline:"none" },
  btn:      { background:"linear-gradient(135deg,#e91e8c,#c41674)", color:"white", border:"none", borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:5 },
  btnGhost: { background:"transparent", color:"rgba(255,255,255,.5)", border:"1px solid rgba(255,255,255,.12)", borderRadius:10, padding:"7px 14px", fontSize:12.5, cursor:"pointer" },
  avatar:   { width:34, height:34, minWidth:34, borderRadius:"50%", background:"linear-gradient(135deg,#e91e8c,#c41674)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"white", fontSize:14 },
  fbrow:    { display:"flex", alignItems:"flex-start", gap:10, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,.05)" },
  pill:     { display:"inline-block", background:"rgba(255,255,255,.06)", borderRadius:8, padding:"2px 9px", fontSize:11.5, marginRight:4, marginTop:3 },
  errbox:   { background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.3)", borderRadius:12, padding:14, color:"#f87171", fontSize:13, marginBottom:14 },
  loading:  { textAlign:"center", color:"rgba(255,255,255,.3)", padding:40, fontSize:13 },
  empty:    { textAlign:"center", color:"rgba(255,255,255,.28)", padding:28, fontSize:13 },
  logoutBtn:{ background:"transparent", border:"1px solid rgba(233,30,140,.22)", color:"rgba(255,255,255,.38)", borderRadius:8, padding:"5px 11px", fontSize:11.5, cursor:"pointer", width:"100%", marginTop:8 },
  sfooter:  { borderTop:"1px solid rgba(255,255,255,.06)", paddingTop:10, marginTop:8 },
};

function Login({ onLogin }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(""); const [show, setShow] = useState(false);
  function go(e) { e.preventDefault(); if (pw === ADMIN_PASS) onLogin(); else { setErr("Incorrect password."); setPw(""); } }
  return (
    <div style={C.lbg}>
      <div style={C.lcard}>
        <div style={{ fontSize:46, marginBottom:10 }}>🍰</div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", color:"white", fontSize:"1.55rem", fontWeight:800, margin:"0 0 4px" }}>Kreamz Admin</h1>
        <p style={{ color:"rgba(255,255,255,.38)", fontSize:13, marginBottom:22 }}>Dashboard · Restricted Access</p>
        <form onSubmit={go}>
          <div style={{ position:"relative", marginBottom:10 }}>
            <input style={{ width:"100%", padding:".78rem 2.5rem .78rem 1rem", borderRadius:11, border:"1.5px solid rgba(233,30,140,.32)", background:"rgba(255,255,255,.07)", color:"white", fontSize:15, outline:"none", boxSizing:"border-box" }}
              type={show ? "text" : "password"} placeholder="Enter admin password"
              value={pw} onChange={e => { setPw(e.target.value); setErr(""); }} autoFocus />
            <button type="button" onClick={() => setShow(s => !s)}
              style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"rgba(255,255,255,.45)", cursor:"pointer", fontSize:16 }}>
              {show ? "🙈" : "👁️"}
            </button>
          </div>
          {err && <p style={{ color:"#f87171", fontSize:13, marginBottom:8 }}>{err}</p>}
          <button style={{ ...C.btn, width:"100%", justifyContent:"center", padding:".84rem", fontSize:15, borderRadius:12 }} type="submit">Login →</button>
        </form>
        <p style={{ marginTop:14, fontSize:11, color:"rgba(255,255,255,.2)" }}>Default: kreamz@admin2024</p>
      </div>
    </div>
  );
}

function WhoBadge({ who }) {
  const map = { "Customer":C.badgeG, "Internal Team":C.badgeB, "Franchise Owner":C.badge, "Store Member":C.badgeY };
  return <span style={map[who] || C.pill}>{who || "—"}</span>;
}

function exportToExcel(data, filename) {
  const rows = data.map(f => ({
    "Date & Time": fmtDateExcel(f.createdAt),
    "Name": f.name || "Anonymous",
    "Email": f.email || "",
    "Phone": f.phone || "",
    "Are You?": f.whoAreYou || "",
    "Outlet Name": f.store || "",
    "Location / Zone": f.location || "",
    "Taste (1-5)": f.ratings?.taste || "",
    "Presentation (1-5)": f.ratings?.presentation || "",
    "Service (1-5)": f.ratings?.service || "",
    "Value (1-5)": f.ratings?.value || "",
    "Overall Score (/10)": f.overall || "",
    "Avg Rating (/5)": f.avgRating || "",
    "What to Improve": f.improve || "",
    "Recommend": f.recommend === 0 ? "Yes" : f.recommend === 1 ? "Maybe" : f.recommend === 2 ? "No" : "",
    "Birthday": f.birthday || "",
    "Anniversary": f.anniversary || "",
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch:20 },{ wch:20 },{ wch:25 },{ wch:16 },{ wch:16 },
    { wch:28 },{ wch:22 },{ wch:13 },{ wch:18 },{ wch:14 },
    { wch:12 },{ wch:17 },{ wch:14 },{ wch:40 },{ wch:12 },
    { wch:13 },{ wch:14 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Kreamz Feedbacks");
  XLSX.writeFile(wb, filename);
}

export default function AdminDashboard() {
  const [authed, setAuthed]       = useState(false);
  const [tab, setTab]             = useState("overview");
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fbErr, setFbErr]         = useState("");
  const [fStore, setFStore]       = useState("All");
  const [fLocation, setFLocation] = useState("All");
  const [fWho, setFWho]           = useState("All");
  const [fDays, setFDays]         = useState("all");
  const [fSearch, setFSearch]     = useState("");

  useEffect(() => {
    if (!authed) return;
    setLoading(true); setFbErr("");
    try {
      const q = query(collection(db, "feedbacks"), orderBy("createdAt", "desc"), limit(1000));
      return onSnapshot(q,
        snap => { setFeedbacks(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
        err  => { setFbErr(err.message); setLoading(false); }
      );
    } catch(e) { setFbErr(e.message); setLoading(false); }
  }, [authed]);

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const total    = feedbacks.length;
  const aOverall = avg(feedbacks.map(f => f.overall || 0)).toFixed(1);
  const aTaste   = avg(feedbacks.filter(f => f.ratings?.taste).map(f => f.ratings.taste)).toFixed(1);
  const recPct   = total ? Math.round(feedbacks.filter(f => f.recommend === 0).length / total * 100) : 0;
  const withEmail= feedbacks.filter(f => f.email).length;
  const withBday = feedbacks.filter(f => f.birthday).length;
  const whoDist  = {};
  WHO_OPTIONS.forEach(w => whoDist[w] = feedbacks.filter(f => f.whoAreYou === w).length);

  const storeMap = {};
  feedbacks.forEach(f => {
    const k = f.store || "Unknown";
    if (!storeMap[k]) storeMap[k] = { count:0, scores:[], loc:f.location||"" };
    storeMap[k].count++;
    if (f.overall) storeMap[k].scores.push(f.overall);
  });
  const storeLB = Object.entries(storeMap)
    .map(([n,s]) => ({ n, count:s.count, avg:avg(s.scores).toFixed(1), loc:s.loc }))
    .sort((a,b) => b.count - a.count).slice(0,12);

  const filtered = useMemo(() => feedbacks.filter(f => {
    if (fStore    !== "All" && f.store     !== fStore)    return false;
    if (fLocation !== "All" && f.location  !== fLocation) return false;
    if (fWho      !== "All" && f.whoAreYou !== fWho)      return false;
    if (fDays !== "all") {
      const cut = new Date(); cut.setDate(cut.getDate() - parseInt(fDays));
      const d = f.createdAt?.toDate ? f.createdAt.toDate() : new Date(0);
      if (d < cut) return false;
    }
    if (fSearch) {
      const q = fSearch.toLowerCase();
      if (!(f.name?.toLowerCase().includes(q) || f.store?.toLowerCase().includes(q) ||
            f.email?.toLowerCase().includes(q) || f.improve?.toLowerCase().includes(q))) return false;
    }
    return true;
  }), [feedbacks, fStore, fLocation, fWho, fDays, fSearch]);

  const TABS = [
    { id:"overview",  icon:"📊", label:"Overview"  },
    { id:"feedbacks", icon:"💬", label:"Feedbacks"  },
    { id:"customers", icon:"🎂", label:"Customers"  },
    { id:"export",    icon:"⬇️",  label:"Export"     },
  ];

  return (
    <div style={C.wrap}>
      <aside style={C.sidebar}>
        <div style={C.brand}>
          <span style={{ fontSize:24 }}>🍰</span>
          <div>
            <div style={C.brandTxt}>Kreamz</div>
            <div style={C.brandSub}>ADMIN DASHBOARD</div>
          </div>
        </div>
        <nav style={C.nav}>
          {TABS.map(t => (
            <button key={t.id} style={{ ...C.nb, ...(tab === t.id ? C.nba : {}) }} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </nav>
        <div style={C.sfooter}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.28)", marginBottom:3 }}>
            <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:"#22c55e", marginRight:5, verticalAlign:"middle" }} />
            Live · {total} feedbacks
          </div>
          <div style={{ fontSize:10.5, color:"rgba(255,255,255,.22)", marginBottom:2 }}>{STORES.length} outlets</div>
          <button style={C.logoutBtn} onClick={() => setAuthed(false)}>Logout</button>
        </div>
      </aside>

      <main style={C.main}>
        {fbErr && (
          <div style={C.errbox}>
            ⚠️ Firebase error: {fbErr}
            <div style={{ fontSize:12, marginTop:6, opacity:.75 }}>
              Fix: Firebase Console → Firestore → Rules → <code>allow read, write: if true;</code> → Publish
            </div>
          </div>
        )}

        {tab === "overview" && (
          <div>
            <div style={C.ph}>
              <h1 style={C.ptitle}>Overview</h1>
              <p style={C.psub}>Live analytics across all {STORES.length} Kreamz outlets</p>
            </div>
            <div style={C.kgrid}>
              {[
                { icon:"💬", val:total,        lbl:"Total Feedbacks"  },
                { icon:"⭐", val:aOverall,      lbl:"Avg Score /10"    },
                { icon:"🎂", val:aTaste,        lbl:"Avg Taste /5"     },
                { icon:"❤️", val:recPct+"%",    lbl:"Recommend"        },
                { icon:"📧", val:withEmail,     lbl:"Emails Collected" },
                { icon:"🎁", val:withBday,      lbl:"Birthdays Saved"  },
                { icon:"🏪", val:STORES.length, lbl:"Active Outlets"   },
              ].map((k,i) => (
                <div key={i} style={C.kcard}>
                  <div style={{ fontSize:20, marginBottom:5 }}>{k.icon}</div>
                  <div style={C.kval}>{k.val}</div>
                  <div style={C.klbl}>{k.lbl}</div>
                </div>
              ))}
            </div>

            <div style={C.card}>
              <div style={C.ctitle}>👥 "Are You?" Distribution</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:8 }}>
                {WHO_OPTIONS.map(w => (
                  <div key={w} style={{ background:"rgba(255,255,255,.04)", borderRadius:12, padding:"12px 14px", border:"1px solid rgba(255,255,255,.06)" }}>
                    <div style={{ color:"white", fontWeight:700, fontSize:18, lineHeight:1 }}>{whoDist[w]}</div>
                    <div style={{ color:"rgba(255,255,255,.45)", fontSize:12, marginTop:4 }}>{w}</div>
                    {total > 0 && <div style={{ color:"#e91e8c", fontSize:11, marginTop:2 }}>{Math.round(whoDist[w]/total*100)}%</div>}
                  </div>
                ))}
              </div>
            </div>

            <div style={C.card}>
              <div style={C.ctitle}>🏆 Top Stores by Feedback Volume</div>
              {loading ? <div style={C.loading}>Connecting to Firebase…</div> :
               storeLB.length === 0 ? <div style={C.empty}>No feedbacks yet!</div> : (
                <div style={{ overflowX:"auto" }}>
                  <table style={C.tbl}>
                    <thead><tr>{["#","Outlet","Location","Feedbacks","Avg /10"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {storeLB.map((s,i) => (
                        <tr key={s.n}>
                          <td style={{ ...C.td, color:"#e91e8c", fontWeight:700, width:32 }}>{i+1}</td>
                          <td style={{ ...C.td, color:"white", fontWeight:600 }}>{s.n}</td>
                          <td style={{ ...C.td, color:"rgba(255,255,255,.45)", fontSize:12 }}>{s.loc||"—"}</td>
                          <td style={C.td}><span style={C.badge}>{s.count}</span></td>
                          <td style={{ ...C.td, color:"#e91e8c", fontWeight:700 }}>{s.avg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={C.card}>
              <div style={C.ctitle}>🕐 Recent Feedbacks</div>
              {feedbacks.slice(0,8).map(f => (
                <div key={f.id} style={C.fbrow}>
                  <div style={C.avatar}>{(f.name||"A")[0].toUpperCase()}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <span style={{ color:"white", fontWeight:600, fontSize:13 }}>{f.name||"Anonymous"}</span>
                      <WhoBadge who={f.whoAreYou} />
                    </div>
                    <div style={{ color:"rgba(255,255,255,.4)", fontSize:12, marginTop:2 }}>📍 {f.store}{f.location ? ` · ${f.location}` : ""}</div>
                    {f.improve && <div style={{ color:"rgba(255,255,255,.4)", fontSize:11.5, marginTop:2, fontStyle:"italic" }}>"{f.improve.slice(0,80)}{f.improve.length>80?"…":""}"</div>}
                    <div style={{ color:"rgba(255,255,255,.24)", fontSize:11, marginTop:3 }}>{fmtDate(f.createdAt)}</div>
                  </div>
                  <div style={{ ...C.badge, fontSize:14, fontWeight:800, whiteSpace:"nowrap", marginLeft:6 }}>{f.overall||"—"}/10</div>
                </div>
              ))}
              {!loading && feedbacks.length === 0 && <div style={C.empty}>No feedbacks yet.</div>}
            </div>
          </div>
        )}

        {tab === "feedbacks" && (
          <div>
            <div style={{ ...C.ph, display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:10 }}>
              <div>
                <h1 style={C.ptitle}>All Feedbacks</h1>
                <p style={C.psub}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}{filtered.length !== feedbacks.length ? ` (filtered from ${feedbacks.length})` : ""}</p>
              </div>
              <button style={C.btn} onClick={() => exportToExcel(filtered, `kreamz-feedbacks-${new Date().toISOString().slice(0,10)}.xlsx`)}>⬇ Export Excel</button>
            </div>
            <div style={C.frow}>
              <input style={C.srch} type="text" placeholder="🔍 Search name, outlet, email..." value={fSearch} onChange={e => setFSearch(e.target.value)} />
              <select style={C.sel} value={fWho} onChange={e => setFWho(e.target.value)}>
                <option value="All">All Types</option>
                {WHO_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
              <select style={C.sel} value={fStore} onChange={e => setFStore(e.target.value)}>
                <option value="All">All Outlets</option>
                {STORES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
              <select style={C.sel} value={fLocation} onChange={e => setFLocation(e.target.value)}>
                <option value="All">All Locations</option>
                {AFE_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
              <select style={C.sel} value={fDays} onChange={e => setFDays(e.target.value)}>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="all">All time</option>
              </select>
              {(fSearch||fWho!=="All"||fStore!=="All"||fLocation!=="All"||fDays!=="all") && (
                <button style={C.btnGhost} onClick={() => { setFSearch(""); setFWho("All"); setFStore("All"); setFLocation("All"); setFDays("all"); }}>✕ Clear</button>
              )}
            </div>
            {loading ? <div style={C.loading}>Loading…</div> :
             filtered.length === 0 ? <div style={C.empty}>No feedbacks match filters.</div> :
             filtered.map(f => (
              <div key={f.id} style={{ ...C.card, marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:10 }}>
                  <div style={{ ...C.avatar, width:42, height:42, fontSize:17 }}>{(f.name||"A")[0].toUpperCase()}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <span style={{ color:"white", fontWeight:700, fontSize:14 }}>{f.name||"Anonymous"}</span>
                      <WhoBadge who={f.whoAreYou} />
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"3px 12px", marginTop:3 }}>
                      {f.phone && <span style={{ color:"rgba(255,255,255,.42)", fontSize:12 }}>📞 {f.phone}</span>}
                      {f.email && <span style={{ color:"rgba(255,255,255,.42)", fontSize:12 }}>📧 {f.email}</span>}
                      {f.birthday && <span style={{ color:"#f9a8d4", fontSize:12 }}>🎂 {f.birthday}</span>}
                      {f.anniversary && <span style={{ color:"#f9a8d4", fontSize:12 }}>💍 {f.anniversary}</span>}
                    </div>
                  </div>
                  <div style={{ ...C.badge, fontSize:15, fontWeight:800, whiteSpace:"nowrap" }}>{f.overall||"—"}/10</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:6, marginBottom:9, fontSize:12.5, color:"rgba(255,255,255,.5)" }}>
                  <span>📍 <strong style={{ color:"rgba(255,255,255,.78)" }}>{f.store}</strong>{f.location ? ` · ${f.location}` : ""}</span>
                  <span style={{ color:"rgba(255,255,255,.28)", fontSize:11.5 }}>{fmtDate(f.createdAt)}</span>
                </div>
                {f.ratings && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:9 }}>
                    {Object.entries(f.ratings).map(([k,v]) => (
                      <span key={k} style={C.pill}>{k}: <strong style={{ color:"#e91e8c" }}>{v}/5</strong></span>
                    ))}
                  </div>
                )}
                {f.improve && (
                  <div style={{ background:"rgba(255,255,255,.04)", borderRadius:10, padding:"8px 12px", fontSize:13, color:"rgba(255,255,255,.65)", borderLeft:"3px solid #e91e8c", marginBottom:7 }}>
                    <div style={{ fontSize:10.5, color:"rgba(255,255,255,.35)", marginBottom:3, textTransform:"uppercase", letterSpacing:".04em" }}>What to improve</div>
                    {f.improve}
                  </div>
                )}
                <div style={{ fontSize:12 }}>
                  {f.recommend === 0 && <span style={{ color:"#4ade80" }}>✅ Would recommend</span>}
                  {f.recommend === 1 && <span style={{ color:"#facc15" }}>🤔 Maybe recommend</span>}
                  {f.recommend === 2 && <span style={{ color:"#f87171" }}>❌ Would not recommend</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "customers" && (
          <div>
            <div style={{ ...C.ph, display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:10 }}>
              <div>
                <h1 style={C.ptitle}>Customer Database</h1>
                <p style={C.psub}>Emails, birthdays & anniversaries collected</p>
              </div>
              <button style={C.btn} onClick={() => exportToExcel(feedbacks.filter(f => f.email||f.phone||f.birthday||f.anniversary), "kreamz-customers.xlsx")}>⬇ Export Customers</button>
            </div>
            {loading ? <div style={C.loading}>Loading…</div> : (
              <div style={C.card}>
                <div style={C.ctitle}>🎂 All Customers <span style={{ ...C.badge, fontSize:11 }}>{feedbacks.filter(f => f.email||f.phone||f.birthday||f.anniversary).length}</span></div>
                <div style={{ overflowX:"auto" }}>
                  <table style={C.tbl}>
                    <thead><tr>{["Name","Type","Phone","Email","Birthday","Anniversary","Outlet","Location"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {feedbacks.filter(f => f.email||f.phone||f.birthday||f.anniversary).map(f => (
                        <tr key={f.id}>
                          <td style={{ ...C.td, color:"white", fontWeight:600 }}>{f.name||"Anon"}</td>
                          <td style={C.td}><WhoBadge who={f.whoAreYou} /></td>
                          <td style={{ ...C.td, color:"rgba(255,255,255,.5)", fontSize:12 }}>{f.phone||"—"}</td>
                          <td style={{ ...C.td, color:"rgba(255,255,255,.5)", fontSize:12 }}>{f.email||"—"}</td>
                          <td style={{ ...C.td, color:"#f9a8d4", fontSize:12 }}>{f.birthday||"—"}</td>
                          <td style={{ ...C.td, color:"#f9a8d4", fontSize:12 }}>{f.anniversary||"—"}</td>
                          <td style={{ ...C.td, color:"rgba(255,255,255,.55)", fontSize:12 }}>{f.store}</td>
                          <td style={{ ...C.td, color:"rgba(255,255,255,.4)", fontSize:12 }}>{f.location||"—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {feedbacks.filter(f => f.email||f.birthday||f.anniversary).length === 0 && <div style={C.empty}>No customer details yet.</div>}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "export" && (
          <div>
            <div style={C.ph}>
              <h1 style={C.ptitle}>Export Data</h1>
              <p style={C.psub}>Download feedback data as Excel files</p>
            </div>
            <div style={C.card}>
              <div style={C.ctitle}>🔽 Filter Before Export</div>
              <div style={C.frow}>
                <select style={C.sel} value={fWho} onChange={e => setFWho(e.target.value)}>
                  <option value="All">All Types</option>
                  {WHO_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
                <select style={C.sel} value={fStore} onChange={e => setFStore(e.target.value)}>
                  <option value="All">All Outlets</option>
                  {STORES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
                <select style={C.sel} value={fLocation} onChange={e => setFLocation(e.target.value)}>
                  <option value="All">All Locations</option>
                  {AFE_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
                <select style={C.sel} value={fDays} onChange={e => setFDays(e.target.value)}>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="all">All time</option>
                </select>
                {(fWho!=="All"||fStore!=="All"||fLocation!=="All"||fDays!=="all") && (
                  <button style={C.btnGhost} onClick={() => { setFWho("All"); setFStore("All"); setFLocation("All"); setFDays("all"); }}>✕ Clear</button>
                )}
              </div>
              <p style={{ fontSize:12, color:"rgba(255,255,255,.35)", marginTop:4 }}>{filtered.length} records match filters</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
              {[
                { icon:"📊", title:"All Feedbacks (Filtered)", desc:`Export ${filtered.length} records`, fn:() => exportToExcel(filtered, `kreamz-feedbacks-${new Date().toISOString().slice(0,10)}.xlsx`) },
                { icon:"📋", title:"All Feedbacks (Complete)", desc:`Export all ${feedbacks.length} records`, fn:() => exportToExcel(feedbacks, `kreamz-all-feedbacks-${new Date().toISOString().slice(0,10)}.xlsx`) },
                { icon:"🎂", title:"Customers Database", desc:"Names, emails, birthdays, anniversaries", fn:() => exportToExcel(feedbacks.filter(f => f.email||f.phone||f.birthday||f.anniversary), "kreamz-customers.xlsx") },
                { icon:"👥", title:"Customers Only", desc:"Only Customer type feedbacks", fn:() => exportToExcel(feedbacks.filter(f => f.whoAreYou==="Customer"), "kreamz-customers-only.xlsx") },
                { icon:"🏪", title:"Internal & Franchise", desc:"Team, franchise, store member feedbacks", fn:() => exportToExcel(feedbacks.filter(f => f.whoAreYou!=="Customer"), "kreamz-internal.xlsx") },
              ].map((btn,i) => (
                <div key={i} style={{ ...C.card, marginBottom:0, cursor:"pointer", border:"1px solid rgba(233,30,140,.15)" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor="rgba(233,30,140,.4)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="rgba(233,30,140,.15)"}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{btn.icon}</div>
                  <div style={{ color:"white", fontWeight:700, fontSize:14, marginBottom:4 }}>{btn.title}</div>
                  <div style={{ color:"rgba(255,255,255,.4)", fontSize:12, marginBottom:12 }}>{btn.desc}</div>
                  <button style={C.btn} onClick={btn.fn}>⬇ Download .xlsx</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
