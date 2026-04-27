import { useState } from "react";

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────
const CATEGORIES = [
  { id: "service_staff", label: "Service & Staff",  icon: "🤝" },
  { id: "staff_warmth",  label: "Staff Warmth",     icon: "😊" },
  { id: "cake_quality",  label: "Cake & Desserts",  icon: "🎂" },
  { id: "beverages",     label: "Beverages",        icon: "☕" },
  { id: "ambience",      label: "Ambience",         icon: "✨" },
  { id: "cleanliness",   label: "Cleanliness",      icon: "🧹" },
  { id: "packaging",     label: "Packaging",        icon: "🎁" },
  { id: "value",         label: "Value for Money",  icon: "💰" },
];

const EMOTIONS = [
  { score: 1, emoji: "😡", label: "Very Bad",  color: "#ef4444", bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.4)"  },
  { score: 2, emoji: "😐", label: "Okay",      color: "#f59e0b", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.4)" },
  { score: 3, emoji: "🙂", label: "Good",      color: "#22c55e", bg: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.4)"  },
  { score: 4, emoji: "🤩", label: "Amazing!",  color: "#e91e8c", bg: "rgba(233,30,140,0.15)", border: "rgba(233,30,140,0.4)" },
];

const NEGATIVE_TAGS = ["Long wait","Rude staff","Cold food","Wrong order","Dirty tables","Overpriced","Small portions","Slow service","Poor packaging","Noisy environment"];
const POSITIVE_TAGS = ["Amazing taste","Friendly staff","Great ambience","Fast service","Worth the price","Beautiful decor","Will visit again","Fresh ingredients","Perfect portions","Loved the vibe"];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─────────────────────────────────────────────
//  Star Rating Row
// ─────────────────────────────────────────────
function StarRow({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value || 0;
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(value === n ? 0 : n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="text-3xl transition-transform duration-100 active:scale-90"
          style={{ transform: display >= n ? "scale(1.15)" : "scale(1)" }}
        >
          <span style={{ filter: display >= n ? "none" : "grayscale(1) opacity(0.3)" }}>⭐</span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────
export default function FeedbackFlow({ storeData, storeName, storeId, onComplete }) {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [catRatings, setCatRatings]           = useState({});
  const [selectedTags, setSelectedTags]       = useState([]);
  const [feedbackText, setFeedbackText]       = useState("");
  const [phone, setPhone]                     = useState("");
  const [submitting, setSubmitting]           = useState(false);
  const [emotionLocked, setEmotionLocked]     = useState(false);

  const emotion    = EMOTIONS.find(e => e.score === selectedEmotion);
  const accentColor = emotion?.color  || "#e91e8c";
  const isGood     = selectedEmotion !== null && selectedEmotion >= 3;
  const tags       = selectedEmotion !== null ? (isGood ? POSITIVE_TAGS : NEGATIVE_TAGS) : POSITIVE_TAGS;

  function handleEmotionClick(score) {
    setSelectedEmotion(score);
    setSelectedTags([]);
    setEmotionLocked(true);
  }

  function toggleTag(tag) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const payload = {
        storeId,
        storeName,
        emotionScore: selectedEmotion || 3,
        categoryRatings: catRatings,
        feedbackText,
        tags: selectedTags,
        phone: phone || undefined,
      };
      await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      onComplete();
    } catch {
      onComplete();
    }
  }

  return (
    <div className="min-h-screen w-full" style={{ background: "#0f0f11" }}>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${accentColor}30 0%, transparent 70%)`,
            filter: "blur(60px)",
            transition: "background 0.6s ease",
          }}
        />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-5 pb-28 pt-6">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white rounded-xl overflow-hidden shadow-lg flex-shrink-0">
            <img src="/kreamz-logo.jpg" alt="Kreamz" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-white font-black text-base leading-none">Kreamz Feedback</p>
            <p className="text-white/40 text-sm mt-0.5 leading-none">{storeName}</p>
          </div>
        </div>

        {/* ── Store banner ── */}
        {storeData?.address && (
          <div
            className="rounded-2xl px-5 py-4 mb-8 flex items-center gap-3"
            style={{ background: "rgba(233,30,140,0.1)", border: "1px solid rgba(233,30,140,0.2)" }}
          >
            <span className="text-2xl">📍</span>
            <div>
              <p className="text-white font-bold text-base leading-tight">{storeName}</p>
              {storeData.city && <p className="text-white/50 text-sm">{storeData.city}</p>}
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            SECTION 1 — Overall Feeling
        ════════════════════════════════ */}
        <div className="mb-10">
          <h2 className="text-white font-black text-2xl mb-2">How was your visit?</h2>
          <p className="text-white/40 text-base mb-6">Tap to tell us how you felt</p>

          <div className="grid grid-cols-4 gap-3">
            {EMOTIONS.map(e => {
              const active = selectedEmotion === e.score;
              return (
                <button
                  key={e.score}
                  onClick={() => handleEmotionClick(e.score)}
                  className="flex flex-col items-center gap-2 py-5 rounded-2xl transition-all duration-200 active:scale-95"
                  style={{
                    background: active ? e.bg : "rgba(255,255,255,0.04)",
                    border: `2px solid ${active ? e.border : "rgba(255,255,255,0.08)"}`,
                    transform: active ? "scale(1.06)" : "scale(1)",
                    boxShadow: active ? `0 8px 32px ${e.color}30` : "none",
                  }}
                >
                  <span className="text-4xl leading-none" style={{ filter: active ? "none" : "grayscale(0.3)" }}>
                    {e.emoji}
                  </span>
                  <span
                    className="text-xs font-bold leading-none"
                    style={{ color: active ? e.color : "rgba(255,255,255,0.35)" }}
                  >
                    {e.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ════════════════════════════════
            SECTION 2 — Category Ratings
        ════════════════════════════════ */}
        <div className="mb-10">
          <h2 className="text-white font-black text-2xl mb-1">Rate each area</h2>
          <p className="text-white/40 text-base mb-6">Optional — tap the stars</p>

          <div className="flex flex-col gap-4">
            {CATEGORIES.map(cat => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-2xl px-5 py-4"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-white font-semibold text-base">{cat.label}</span>
                </div>
                <StarRow
                  value={catRatings[cat.id] || 0}
                  onChange={v => setCatRatings(prev => ({ ...prev, [cat.id]: v }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════
            SECTION 3 — Quick Tags
        ════════════════════════════════ */}
        <div className="mb-10">
          <h2 className="text-white font-black text-2xl mb-1">
            {selectedEmotion !== null
              ? (isGood ? "What did you love?" : "What went wrong?")
              : "Quick reactions"
            }
          </h2>
          <p className="text-white/40 text-base mb-6">Tap all that apply</p>

          <div className="flex flex-wrap gap-3">
            {tags.map(tag => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="px-5 py-3 rounded-2xl text-base font-semibold transition-all duration-150 active:scale-95"
                  style={{
                    background: active ? accentColor : "rgba(255,255,255,0.06)",
                    color: active ? "#fff" : "rgba(255,255,255,0.6)",
                    border: `2px solid ${active ? accentColor : "rgba(255,255,255,0.1)"}`,
                    boxShadow: active ? `0 4px 20px ${accentColor}40` : "none",
                    transform: active ? "scale(1.04)" : "scale(1)",
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* ════════════════════════════════
            SECTION 4 — Text Feedback
        ════════════════════════════════ */}
        <div className="mb-10">
          <h2 className="text-white font-black text-2xl mb-1">Anything else?</h2>
          <p className="text-white/40 text-base mb-6">Optional — we read every word</p>

          <textarea
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value)}
            placeholder="Anything else? (optional)"
            rows={4}
            className="w-full rounded-2xl px-5 py-4 text-base resize-none outline-none"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: `2px solid ${feedbackText ? accentColor + "60" : "rgba(255,255,255,0.1)"}`,
              color: "rgba(255,255,255,0.85)",
              transition: "border-color 0.25s",
            }}
          />
        </div>

        {/* ════════════════════════════════
            SECTION 5 — Contact (optional)
        ════════════════════════════════ */}
        <div className="mb-10">
          <h2 className="text-white font-black text-2xl mb-1">Your phone</h2>
          <p className="text-white/40 text-base mb-6">Optional — so we can follow up</p>

          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-4"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `2px solid ${phone ? accentColor + "50" : "rgba(255,255,255,0.08)"}`,
              transition: "border-color 0.25s",
            }}
          >
            <span className="text-2xl">📱</span>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Phone number (optional)"
              className="flex-1 bg-transparent outline-none text-base"
              style={{ color: "rgba(255,255,255,0.85)" }}
            />
          </div>
        </div>

        {/* ════════════════════════════════
            Submit Button
        ════════════════════════════════ */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-5 rounded-2xl font-black text-xl transition-all duration-200 active:scale-95 disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, #c2185b)`,
            color: "#fff",
            boxShadow: `0 12px 40px ${accentColor}50`,
          }}
        >
          {submitting ? "Sending…" : "Submit Feedback"}
        </button>
        <p className="text-white/25 text-sm text-center mt-4">
          Takes less than 60 seconds · Completely anonymous
        </p>

      </div>
    </div>
  );
}
