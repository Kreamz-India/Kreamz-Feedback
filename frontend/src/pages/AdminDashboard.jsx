import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { STORES, CITIES } from "../lib/stores";
import "./AdminDashboard.css";

// ── Auth guard ───────────────────────────────────────────────────────────────
function useAdminAuth() {
  const navigate = useNavigate();
  useEffect(() => {
    if (sessionStorage.getItem("kreamz_admin_auth") !== "true") {
      navigate("/admin/login");
    }
  }, [navigate]);
}

// ── QR code via Google Charts API (no npm dep needed) ───────────────────────
function qrUrl(text, size = 200) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&margin=10&color=1a0a14&bgcolor=ffffff`;
}

// ── Helper ───────────────────────────────────────────────────────────────────
function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function stars(n) {
  return "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));
}
function fmtDate(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "feedbacks", label: "Feedbacks", icon: "💬" },
  { id: "qrcodes", label: "QR Codes", icon: "📷" },
];

export default function AdminDashboard() {
  useAdminAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("overview");
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // QR tab filters
  const [qrSearch, setQrSearch] = useState("");
  const [qrCity, setQrCity] = useState("All");
  const [qrSize, setQrSize] = useState(200);

  // Feedback tab filters
  const [fbStore, setFbStore] = useState("All");
  const [fbDateRange, setFbDateRange] = useState("30");

  // Base URL for QR codes (current deployment origin)
  const BASE_URL =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://kreamz-feedback.vercel.app";

  // ── Live Firestore listener ────────────────────────────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, "feedbacks"),
      orderBy("createdAt", "desc"),
      limit(500)
    );
    const unsub = onSnapshot(q, (snap) => {
      setFeedbacks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalFeedbacks = feedbacks.length;
  const avgOverall = avg(feedbacks.map((f) => f.overall || 0)).toFixed(1);
  const avgTaste = avg(
    feedbacks.filter((f) => f.ratings?.taste).map((f) => f.ratings.taste)
  ).toFixed(1);
  const recommendPct =
    totalFeedbacks > 0
      ? Math.round(
          (feedbacks.filter((f) => f.recommend === 0).length / totalFeedbacks) *
            100
        )
      : 0;

  // Store leaderboard
  const storeStats = {};
  feedbacks.forEach((f) => {
    const key = f.store || "Unknown";
    if (!storeStats[key]) storeStats[key] = { count: 0, scores: [] };
    storeStats[key].count++;
    if (f.overall) storeStats[key].scores.push(f.overall);
  });
  const storeLB = Object.entries(storeStats)
    .map(([name, s]) => ({
      name,
      count: s.count,
      avg: avg(s.scores).toFixed(1),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // ── Filtered feedbacks ─────────────────────────────────────────────────────
  const filteredFbs = feedbacks.filter((f) => {
    if (fbStore !== "All" && f.store !== fbStore) return false;
    if (fbDateRange !== "all") {
      const days = parseInt(fbDateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const fbDate = f.createdAt?.toDate
        ? f.createdAt.toDate()
        : new Date(f.createdAt || 0);
      if (fbDate < cutoff) return false;
    }
    return true;
  });

  // ── Filtered QR stores ────────────────────────────────────────────────────
  const filteredStores = STORES.filter((s) => {
    const q = qrSearch.toLowerCase();
    const matchSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.area.toLowerCase().includes(q);
    const matchCity = qrCity === "All" || s.city === qrCity;
    return matchSearch && matchCity;
  });

  function downloadQR(store) {
    const url = qrUrl(
      `${BASE_URL}/?store=${encodeURIComponent(store.id)}`,
      400
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR_${store.id}_${store.name.replace(/\s+/g, "_")}.png`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function downloadAllQRs() {
    // Open each in a new tab with a short delay to avoid popup blocker
    filteredStores.forEach((store, i) => {
      setTimeout(() => {
        const url = qrUrl(
          `${BASE_URL}/?store=${encodeURIComponent(store.id)}`,
          400
        );
        window.open(url, "_blank");
      }, i * 300);
    });
  }

  function handleLogout() {
    sessionStorage.removeItem("kreamz_admin_auth");
    navigate("/admin/login");
  }

  return (
    <div className="ad-bg">
      {/* ── Sidebar ── */}
      <aside className="ad-sidebar">
        <div className="ad-sidebar-brand">
          <span className="ad-brand-icon">🍰</span>
          <div>
            <div className="ad-brand-name">Kreamz</div>
            <div className="ad-brand-sub">Admin Dashboard</div>
          </div>
        </div>

        <nav className="ad-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`ad-nav-btn ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-footer">
          <div className="ad-live-dot" />
          <span className="ad-live-label">Live — {totalFeedbacks} total</span>
          <button className="ad-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ad-main">
        {/* ══ OVERVIEW TAB ══════════════════════════════════════════════════ */}
        {tab === "overview" && (
          <div className="ad-section animate-fadeInUp">
            <h1 className="ad-page-title">Overview</h1>
            <p className="ad-page-sub">Real-time feedback analytics across all stores</p>

            {/* KPI Cards */}
            <div className="ad-kpi-grid">
              <div className="ad-kpi-card">
                <div className="ad-kpi-icon">💬</div>
                <div className="ad-kpi-value">{totalFeedbacks}</div>
                <div className="ad-kpi-label">Total Feedbacks</div>
              </div>
              <div className="ad-kpi-card">
                <div className="ad-kpi-icon">⭐</div>
                <div className="ad-kpi-value">{avgOverall}</div>
                <div className="ad-kpi-label">Avg Overall / 10</div>
              </div>
              <div className="ad-kpi-card">
                <div className="ad-kpi-icon">🎂</div>
                <div className="ad-kpi-value">{avgTaste}</div>
                <div className="ad-kpi-label">Avg Taste / 5</div>
              </div>
              <div className="ad-kpi-card">
                <div className="ad-kpi-icon">❤️</div>
                <div className="ad-kpi-value">{recommendPct}%</div>
                <div className="ad-kpi-label">Would Recommend</div>
              </div>
              <div className="ad-kpi-card">
                <div className="ad-kpi-icon">🏪</div>
                <div className="ad-kpi-value">{STORES.length}</div>
                <div className="ad-kpi-label">Active Outlets</div>
              </div>
              <div className="ad-kpi-card">
                <div className="ad-kpi-icon">📷</div>
                <div className="ad-kpi-value">{STORES.length}</div>
                <div className="ad-kpi-label">QR Codes Ready</div>
              </div>
            </div>

            {/* Store Leaderboard */}
            <div className="ad-card">
              <h2 className="ad-card-title">🏆 Top Stores by Feedback Volume</h2>
              {loading ? (
                <div className="ad-loading">Loading…</div>
              ) : storeLB.length === 0 ? (
                <p className="ad-empty">No feedback yet. Share your QR codes to get started!</p>
              ) : (
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Store</th>
                      <th>Feedbacks</th>
                      <th>Avg Score</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeLB.map((s, i) => (
                      <tr key={s.name}>
                        <td>
                          <span className="ad-rank">{i + 1}</span>
                        </td>
                        <td>{s.name}</td>
                        <td>
                          <span className="ad-badge">{s.count}</span>
                        </td>
                        <td>
                          <strong style={{ color: "var(--pink)" }}>{s.avg}/10</strong>
                        </td>
                        <td>
                          <span
                            className="ad-stars"
                            title={`${s.avg} / 10`}
                          >
                            {stars(Math.round((parseFloat(s.avg) / 10) * 5))}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Recent feedbacks */}
            <div className="ad-card">
              <h2 className="ad-card-title">🕐 Recent Feedbacks</h2>
              {feedbacks.slice(0, 5).map((f) => (
                <div key={f.id} className="ad-fb-row">
                  <div className="ad-fb-avatar">
                    {(f.name || "A")[0].toUpperCase()}
                  </div>
                  <div className="ad-fb-body">
                    <div className="ad-fb-name">
                      {f.name || "Anonymous"}{" "}
                      <span className="ad-fb-store">@ {f.store}</span>
                    </div>
                    <div className="ad-fb-comment">
                      {f.comment || "No comment"}
                    </div>
                    <div className="ad-fb-meta">{fmtDate(f.createdAt)}</div>
                  </div>
                  <div className="ad-fb-score">{f.overall || "—"}/10</div>
                </div>
              ))}
              {feedbacks.length === 0 && !loading && (
                <p className="ad-empty">No feedbacks yet.</p>
              )}
            </div>
          </div>
        )}

        {/* ══ FEEDBACKS TAB ═════════════════════════════════════════════════ */}
        {tab === "feedbacks" && (
          <div className="ad-section animate-fadeInUp">
            <h1 className="ad-page-title">All Feedbacks</h1>
            <p className="ad-page-sub">
              {filteredFbs.length} feedback{filteredFbs.length !== 1 ? "s" : ""}
            </p>

            {/* Filters */}
            <div className="ad-filters">
              <select
                className="ad-select"
                value={fbStore}
                onChange={(e) => setFbStore(e.target.value)}
              >
                <option value="All">All Stores</option>
                {STORES.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
              <select
                className="ad-select"
                value={fbDateRange}
                onChange={(e) => setFbDateRange(e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            {loading ? (
              <div className="ad-loading">Loading…</div>
            ) : filteredFbs.length === 0 ? (
              <p className="ad-empty">No feedbacks match your filters.</p>
            ) : (
              <div className="ad-fb-list">
                {filteredFbs.map((f) => (
                  <div key={f.id} className="ad-fb-card">
                    <div className="ad-fb-card-header">
                      <div className="ad-fb-avatar large">
                        {(f.name || "A")[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="ad-fb-name">{f.name || "Anonymous"}</div>
                        {f.phone && (
                          <div className="ad-fb-phone">📞 {f.phone}</div>
                        )}
                      </div>
                      <div className="ad-fb-score-badge">{f.overall || "—"}/10</div>
                    </div>

                    <div className="ad-fb-store-row">
                      📍 <strong>{f.store}</strong>
                      <span className="ad-fb-date">{fmtDate(f.createdAt)}</span>
                    </div>

                    {/* Ratings breakdown */}
                    {f.ratings && (
                      <div className="ad-fb-ratings">
                        {Object.entries(f.ratings).map(([k, v]) => (
                          <div key={k} className="ad-fb-rating-item">
                            <span className="ad-fb-rating-key">{k}</span>
                            <div className="ad-fb-rating-bar">
                              <div
                                className="ad-fb-rating-fill"
                                style={{ width: `${(v / 5) * 100}%` }}
                              />
                            </div>
                            <span className="ad-fb-rating-val">{v}/5</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {f.comment && (
                      <div className="ad-fb-comment-box">💬 {f.comment}</div>
                    )}

                    <div className="ad-fb-recommend">
                      {f.recommend === 0
                        ? "✅ Would recommend"
                        : f.recommend === 1
                        ? "🤔 Maybe recommend"
                        : f.recommend === 2
                        ? "❌ Would not recommend"
                        : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ QR CODES TAB ══════════════════════════════════════════════════ */}
        {tab === "qrcodes" && (
          <div className="ad-section animate-fadeInUp">
            <div className="ad-qr-header">
              <div>
                <h1 className="ad-page-title">QR Codes — All {STORES.length} Outlets</h1>
                <p className="ad-page-sub">
                  Auto-generated unique QR for every store. Scan → Customer lands on
                  feedback form pre-filled with that store.
                </p>
              </div>
              <button className="ad-dl-all-btn" onClick={downloadAllQRs}>
                ⬇ Download All ({filteredStores.length})
              </button>
            </div>

            {/* QR Filters */}
            <div className="ad-filters">
              <input
                className="ad-search"
                type="text"
                placeholder="🔍 Search store name, city, ID..."
                value={qrSearch}
                onChange={(e) => setQrSearch(e.target.value)}
              />
              <select
                className="ad-select"
                value={qrCity}
                onChange={(e) => setQrCity(e.target.value)}
              >
                <option value="All">All Cities</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                className="ad-select"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
              >
                <option value={150}>Small (150px)</option>
                <option value={200}>Medium (200px)</option>
                <option value={300}>Large (300px)</option>
              </select>
            </div>

            <div className="ad-qr-count">
              Showing <strong>{filteredStores.length}</strong> of {STORES.length} stores
            </div>

            <div className="ad-qr-grid">
              {filteredStores.map((store) => {
                const feedbackUrl = `${BASE_URL}/?store=${encodeURIComponent(store.id)}`;
                const storeData = storeStats[store.name] || { count: 0, scores: [] };
                return (
                  <div key={store.id} className="ad-qr-card">
                    <div className="ad-qr-store-meta">
                      <span className="ad-qr-id">{store.id}</span>
                      <span className="ad-qr-zone">{store.zone}</span>
                    </div>

                    <div className="ad-qr-img-wrap">
                      <img
                        src={qrUrl(feedbackUrl, qrSize)}
                        alt={`QR for ${store.name}`}
                        className="ad-qr-img"
                        loading="lazy"
                        width={qrSize}
                        height={qrSize}
                      />
                    </div>

                    <div className="ad-qr-store-name">{store.name}</div>
                    <div className="ad-qr-store-city">
                      📍 {store.area}, {store.city}
                    </div>

                    <div className="ad-qr-stats">
                      <span>💬 {storeData.count} feedback{storeData.count !== 1 ? "s" : ""}</span>
                      {storeData.scores.length > 0 && (
                        <span>⭐ {avg(storeData.scores).toFixed(1)}/10</span>
                      )}
                    </div>

                    <div className="ad-qr-url" title={feedbackUrl}>
                      {feedbackUrl.replace(/^https?:\/\//, "").slice(0, 38)}…
                    </div>

                    <div className="ad-qr-actions">
                      <button
                        className="ad-qr-btn"
                        onClick={() => navigator.clipboard.writeText(feedbackUrl)}
                      >
                        📋 Copy Link
                      </button>
                      <button
                        className="ad-qr-btn ad-qr-btn-dl"
                        onClick={() => downloadQR(store)}
                      >
                        ⬇ Download
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredStores.length === 0 && (
              <p className="ad-empty">No stores match your search.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
