import { useState, useEffect, useCallback } from "react";

const API_BASE = "https://kreamz-backend.onrender.com";
const ADMIN_KEY   = import.meta.env.VITE_ADMIN_KEY    || "12345";
const QR_DOMAIN   = import.meta.env.VITE_FRONTEND_URL || "https://yourdomain.com";

const authHeaders = (extra = {}) => ({
  "Content-Type": "application/json",
  ...(ADMIN_KEY ? { Authorization: `Bearer ${ADMIN_KEY}` } : {}),
  ...extra,
});

function getQRUrl(storeId, size = 200) {
  const url = encodeURIComponent(`${QR_DOMAIN}?store=${storeId}`);
  return `${API_BASE}/stores/qr/${storeId}/image`;
}

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, sub, color = "#e91e8c", icon }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between">
        <span className="text-white/40 text-xs uppercase tracking-widest font-semibold">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="text-3xl font-black" style={{ color }}>{value}</div>
      {sub && <div className="text-white/35 text-xs">{sub}</div>}
    </div>
  );
}

// ── Sentiment Badge ──────────────────────────────────────────
function SentimentBadge({ s }) {
  const map = { positive: ["#22c55e","Positive"], negative: ["#ef4444","Negative"], neutral: ["#6b7280","Neutral"] };
  const [color, label] = map[s] || ["#6b7280", s];
  return <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: color + "20", color }}>{label}</span>;
}

// ── Feedback Row ─────────────────────────────────────────────
function FeedbackRow({ f, onPatch, onDelete, onSelect, selected }) {
  const EMOJIS = ["","😡","😞","😐","🙂","😃","🤩"];
  return (
    <div onClick={() => onSelect(f)} className="rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
      style={{ background: selected ? "rgba(233,30,140,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${selected ? "rgba(233,30,140,0.3)" : "rgba(255,255,255,0.06)"}` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0">{EMOJIS[f.emotionScore] || "⭐"}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-semibold text-sm truncate">{f.storeName}</span>
              <SentimentBadge s={f.sentiment} />
              {f.priority === "high" && <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "#ef444420", color: "#ef4444" }}>High Priority</span>}
            </div>
            {f.feedbackText && <p className="text-white/45 text-xs mt-1 truncate">{f.feedbackText}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-white/25 text-xs">{new Date(f.createdAt).toLocaleDateString("en-IN")}</span>
          <button onClick={e => { e.stopPropagation(); if (confirm("Delete?")) onDelete(f._id); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all hover:bg-red-500/20"
            style={{ color: "rgba(255,255,255,0.3)" }}>✕</button>
        </div>
      </div>
    </div>
  );
}

// ── QR Card ──────────────────────────────────────────────────
function QRCard({ store }) {
  const [imgErr, setImgErr] = useState(false);
  const feedbackUrl = `${QR_DOMAIN}?store=${store.id}`;
  const qrFallback  = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(feedbackUrl)}&color=c2185b&bgcolor=FFFFFF&qzone=2&format=png`;

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 hover:scale-[1.02]"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="bg-white rounded-xl p-2 mx-auto w-[120px] h-[120px] flex items-center justify-center overflow-hidden">
        <img
          src={imgErr ? qrFallback : `${API_BASE}/stores/qr/${store.id}/image`}
          alt={`QR - ${store.name}`}
          className="w-full h-full object-contain"
          onError={() => setImgErr(true)}
        />
      </div>
      <div>
        <p className="text-white font-bold text-sm text-center leading-tight">{store.name}</p>
        <p className="text-white/40 text-xs text-center mt-0.5">{store.city}</p>
      </div>
      <div className="flex gap-2">
        <a href={`${API_BASE}/stores/qr/${store.id}`} target="_blank" rel="noreferrer"
          className="flex-1 py-2 rounded-xl text-xs font-bold text-center transition-all hover:opacity-80"
          style={{ background: "rgba(233,30,140,0.15)", color: "#e91e8c", border: "1px solid rgba(233,30,140,0.2)" }}>
          ↓ PNG
        </a>
        <button onClick={() => navigator.clipboard.writeText(feedbackUrl)}
          className="flex-1 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
          Copy Link
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard({ darkMode, setDarkMode, allStores: propStores = [] }) {
  const [authed, setAuthed]         = useState(false);
  const [password, setPassword]     = useState("");
  const [feedbacks, setFeedbacks]   = useState([]);
  const [stats, setStats]           = useState(null);
  const [stores, setStores]         = useState(propStores);
  const [loading, setLoading]       = useState(false);
  const [storeFilter, setStoreFilter]   = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [search, setSearch]         = useState("");
  const [activeTab, setActiveTab]   = useState("overview");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [qrSearch, setQrSearch]     = useState("");
  const [qrCity, setQrCity]         = useState("all");

  // Keep stores updated from props
  useEffect(() => { if (propStores.length) setStores(propStores); }, [propStores]);

  // Also fetch stores directly (in case admin opened separately)
  useEffect(() => {
    if (!stores.length) {
      fetch(`${API_BASE}/stores`).then(r => r.json()).then(d => setStores(d.stores || [])).catch(() => {});
    }
  }, [stores.length]);

  const cities = [...new Set(stores.map(s => s.city).filter(Boolean))].sort();

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (storeFilter !== "all") params.set("store", storeFilter);
      if (sentimentFilter !== "all") params.set("sentiment", sentimentFilter);
      if (search) params.set("search", search);
      const res  = await fetch(`${API_BASE}/feedback?${params}`);
      const data = await res.json();
      setFeedbacks(data.feedbacks || []);
    } catch { setFeedbacks([]); }
    setLoading(false);
  }, [storeFilter, sentimentFilter, search]);

  const fetchStats = useCallback(async () => {
    try {
      const res  = await fetch(`${API_BASE}/feedback/stats`);
      const data = await res.json();
      setStats(data);
    } catch {}
  }, []);

  useEffect(() => { if (authed) { fetchFeedbacks(); fetchStats(); } }, [authed, fetchFeedbacks, fetchStats]);

  async function patchFeedback(id, updates) {
    await fetch(`${API_BASE}/feedback/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    fetchFeedbacks();
  }

  async function deleteFeedback(id) {
    await fetch(`${API_BASE}/feedback/${id}`, { method: "DELETE", headers: authHeaders() });
    fetchFeedbacks();
    fetchStats();
    setSelectedFeedback(null);
  }

  function exportCSV() {
    const header = ["ID","Store","Rating","Sentiment","Priority","Status","Text","Tags","Date"];
    const rows   = feedbacks.map(f => [
      f._id, f.storeName, f.emotionScore, f.sentiment, f.priority,
      f.status, (f.feedbackText || "").replace(/,/g,""), (f.tags || []).join("|"),
      new Date(f.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv  = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "kreamz-feedback.csv"; a.click();
  }

  const avg  = feedbacks.length ? (feedbacks.reduce((s, f) => s + f.emotionScore, 0) / feedbacks.length).toFixed(1) : 0;
  const pos  = feedbacks.filter(f => f.sentiment === "positive").length;
  const neg  = feedbacks.filter(f => f.sentiment === "negative").length;

  const filteredQR = stores.filter(s => {
    const matchSearch = !qrSearch || s.name.toLowerCase().includes(qrSearch.toLowerCase()) || s.city.toLowerCase().includes(qrSearch.toLowerCase());
    const matchCity   = qrCity === "all" || s.city === qrCity;
    return matchSearch && matchCity;
  });

  const TABS = [
    { id: "overview",  label: "Overview",  icon: "📊" },
    { id: "feedbacks", label: "Feedbacks", icon: "💬" },
    { id: "qr",        label: "QR Codes",  icon: "📲" },
  ];

  // ── Login Screen ─────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0d0d0f" }}>
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #e91e8c 0%, transparent 70%)", filter: "blur(60px)" }} />
        </div>
        <div className="relative z-10 w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden shadow-2xl mx-auto mb-4">
              <img src="/kreamz-logo.jpg" alt="Kreamz" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-white font-black text-2xl">Admin Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">Kreamz Feedback System</p>
          </div>
          <div className="rounded-3xl p-6 flex flex-col gap-4"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <input type="password" placeholder="Admin password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && setAuthed(password === (import.meta.env.VITE_ADMIN_PASSWORD || "kreamz2024"))}
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
            <button
              onClick={() => setAuthed(password === (import.meta.env.VITE_ADMIN_PASSWORD || "kreamz2024"))}
              className="w-full py-3.5 rounded-2xl font-black text-white text-sm transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg,#e91e8c,#c2185b)" }}>
              Enter Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Dashboard ───────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "#0d0d0f" }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #e91e8c 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl overflow-hidden shadow-lg">
              <img src="/kreamz-logo.jpg" alt="Kreamz" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-white font-black text-lg leading-none">Kreamz Admin</h1>
              <p className="text-white/40 text-xs mt-0.5">{stores.length} stores · {feedbacks.length} feedbacks</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportCSV}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
              ↓ CSV
            </button>
            <button onClick={() => setAuthed(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
              style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 my-6 p-1 rounded-2xl w-fit" style={{ background: "rgba(255,255,255,0.04)" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
              style={{
                background: activeTab === t.id ? "rgba(233,30,140,0.2)" : "transparent",
                color: activeTab === t.id ? "#e91e8c" : "rgba(255,255,255,0.4)",
                border: activeTab === t.id ? "1px solid rgba(233,30,140,0.3)" : "1px solid transparent",
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="pb-16">
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Feedbacks" value={feedbacks.length} icon="💬" color="#e91e8c" />
              <StatCard label="Avg. Rating" value={`${avg}/6`} icon="⭐" color="#ffa726"
                sub={avg >= 4 ? "Great performance" : avg >= 3 ? "Room to improve" : "Needs attention"} />
              <StatCard label="Positive" value={pos} icon="😃" color="#22c55e"
                sub={feedbacks.length ? `${((pos/feedbacks.length)*100).toFixed(0)}% of total` : "–"} />
              <StatCard label="Negative" value={neg} icon="😞" color="#ef4444"
                sub={feedbacks.length ? `${((neg/feedbacks.length)*100).toFixed(0)}% of total` : "–"} />
            </div>

            {/* Sentiment breakdown */}
            {stats && (
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <h3 className="text-white font-bold mb-4">Sentiment Split</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: "Positive", pct: stats.sentiment?.positivePct || 0, color: "#22c55e" },
                      { label: "Neutral",  pct: stats.sentiment?.neutralPct  || 0, color: "#6b7280" },
                      { label: "Negative", pct: stats.sentiment?.negativePct || 0, color: "#ef4444" },
                    ].map(({ label, pct, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color }} className="font-semibold">{label}</span>
                          <span className="text-white/40">{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Worst stores */}
                <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <h3 className="text-white font-bold mb-4">Needs Attention</h3>
                  {(stats.worstStores || []).length === 0
                    ? <p className="text-white/30 text-sm">No data yet</p>
                    : (stats.worstStores || []).map(s => (
                      <div key={s._id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <div>
                          <p className="text-white/70 text-sm font-semibold">{s.storeName}</p>
                          <p className="text-white/30 text-xs">{s.count} feedbacks</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm" style={{ color: s.avgScore < 3 ? "#ef4444" : "#ffa726" }}>
                            {s.avgScore?.toFixed(1)}/6
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Top complaint keywords */}
            {stats?.topComplaintKeywords?.length > 0 && (
              <div className="rounded-2xl p-5 mb-8" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h3 className="text-white font-bold mb-4">Top Complaint Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.topComplaintKeywords.map(({ keyword, count }) => (
                    <span key={keyword} className="px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                      {keyword} · {count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Store performance table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <h3 className="text-white font-bold">Store Performance</h3>
              </div>
              <div className="divide-y" style={{ divideColor: "rgba(255,255,255,0.05)" }}>
                {(stats?.byStore || []).slice(0, 15).map(s => {
                  const storeObj = stores.find(st => st.id === s._id);
                  return (
                    <div key={s._id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm font-semibold">{s.storeName || storeObj?.name || s._id}</p>
                        {storeObj?.city && <p className="text-white/30 text-xs">{storeObj.city}</p>}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-white/40 text-xs">{s.count} feedbacks</span>
                        <span className="font-black text-sm" style={{ color: s.avgScore >= 4 ? "#22c55e" : s.avgScore >= 3 ? "#ffa726" : "#ef4444" }}>
                          {s.avgScore?.toFixed(1)}/6
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── FEEDBACKS TAB ── */}
        {activeTab === "feedbacks" && (
          <div className="pb-16">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <input placeholder="🔍 Search feedbacks..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              <select value={storeFilter} onChange={e => setStoreFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                <option value="all">All Stores</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={sentimentFilter} onChange={e => setSentimentFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
              <button onClick={fetchFeedbacks}
                className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                style={{ background: "rgba(233,30,140,0.15)", color: "#e91e8c", border: "1px solid rgba(233,30,140,0.2)" }}>
                Search
              </button>
            </div>

            {/* Main content */}
            <div className="flex gap-6">
              {/* List */}
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                {loading && <div className="text-white/40 text-sm text-center py-8">Loading...</div>}
                {!loading && feedbacks.length === 0 && (
                  <div className="text-white/30 text-sm text-center py-12">No feedbacks found</div>
                )}
                {feedbacks.map(f => (
                  <FeedbackRow key={f._id} f={f}
                    onPatch={patchFeedback} onDelete={deleteFeedback}
                    onSelect={setSelectedFeedback}
                    selected={selectedFeedback?._id === f._id} />
                ))}
              </div>

              {/* Detail panel */}
              {selectedFeedback && (
                <div className="w-80 flex-shrink-0 rounded-2xl p-5 sticky top-24 self-start"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-sm">Feedback Detail</h3>
                    <button onClick={() => setSelectedFeedback(null)} className="text-white/30 hover:text-white/60 transition-colors">✕</button>
                  </div>
                  <div className="flex flex-col gap-3 text-sm">
                    <div><p className="text-white/40 text-xs mb-1">Store</p><p className="text-white font-semibold">{selectedFeedback.storeName}</p></div>
                    <div><p className="text-white/40 text-xs mb-1">Rating</p><p className="text-white font-semibold">{selectedFeedback.emotionScore}/6</p></div>
                    <div><p className="text-white/40 text-xs mb-1">Sentiment</p><SentimentBadge s={selectedFeedback.sentiment} /></div>
                    {selectedFeedback.feedbackText && (
                      <div><p className="text-white/40 text-xs mb-1">Message</p><p className="text-white/70 leading-relaxed">{selectedFeedback.feedbackText}</p></div>
                    )}
                    {selectedFeedback.tags?.length > 0 && (
                      <div><p className="text-white/40 text-xs mb-2">Tags</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedFeedback.tags.map(t => (
                            <span key={t} className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedFeedback.name && <div><p className="text-white/40 text-xs mb-1">Customer</p><p className="text-white/70">{selectedFeedback.name}</p></div>}
                    {selectedFeedback.phone && <div><p className="text-white/40 text-xs mb-1">Phone</p><p className="text-white/70">{selectedFeedback.phone}</p></div>}
                    <div><p className="text-white/40 text-xs mb-1">Date</p><p className="text-white/70">{new Date(selectedFeedback.createdAt).toLocaleString("en-IN")}</p></div>
                    <div className="flex gap-2 pt-2">
                      <select onChange={e => patchFeedback(selectedFeedback._id, { status: e.target.value })}
                        defaultValue={selectedFeedback.status || "new"}
                        className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="resolved">Resolved</option>
                        <option value="escalated">Escalated</option>
                      </select>
                      <button onClick={() => deleteFeedback(selectedFeedback._id)}
                        className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                        style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── QR CODES TAB ── */}
        {activeTab === "qr" && (
          <div className="pb-16">
            {/* QR Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex gap-3 flex-wrap">
                <input placeholder="🔍 Search stores..." value={qrSearch}
                  onChange={e => setQrSearch(e.target.value)}
                  className="px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white", minWidth: 200 }} />
                <select value={qrCity} onChange={e => setQrCity(e.target.value)}
                  className="px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                  <option value="all">All Cities</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-sm">{filteredQR.length} stores</span>
                <a href={`${API_BASE}/stores/qr/download`} target="_blank" rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl text-sm font-black transition-all hover:opacity-80"
                  style={{ background: "linear-gradient(135deg,#e91e8c,#c2185b)", color: "white" }}>
                  ↓ Download All ZIP
                </a>
              </div>
            </div>

            {stores.length === 0 && (
              <div className="text-white/30 text-center py-16">
                <p className="text-4xl mb-4">📲</p>
                <p className="text-sm">No stores loaded. Ensure backend is running with stores.json.</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredQR.map(store => <QRCard key={store.id} store={store} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
