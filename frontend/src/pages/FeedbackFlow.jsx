import { useState, useRef, useEffect } from "react";

const CATEGORIES = [
  { id: "service_staff",  label: "Service & Staff",      icon: "🤝", color: "#e91e8c" },
  { id: "staff_warmth",   label: "Staff Warmth",          icon: "😊", color: "#f06292" },
  { id: "cake_quality",   label: "Cake & Desserts",        icon: "🎂", color: "#e91e8c" },
  { id: "beverages",      label: "Beverages",              icon: "☕", color: "#ab47bc" },
  { id: "ambience",       label: "Ambience & Décor",       icon: "✨", color: "#7e57c2" },
  { id: "cleanliness",    label: "Cleanliness",            icon: "🧹", color: "#26c6da" },
  { id: "packaging",      label: "Packaging",              icon: "🎁", color: "#66bb6a" },
  { id: "value",          label: "Value for Money",        icon: "💰", color: "#ffa726" },
];

const EMOJIS       = ["😡","😞","😐","🙂","😃","🤩"];
const EMOJI_LABELS = ["Very Bad","Poor","Okay","Good","Great","Amazing!"];
const EMOTION_COLORS = ["#ef4444","#f97316","#eab308","#84cc16","#22c55e","#10b981"];
const EMOTION_BG    = [
  "linear-gradient(135deg,#450a0a,#7f1d1d)",
  "linear-gradient(135deg,#431407,#7c2d12)",
  "linear-gradient(135deg,#422006,#713f12)",
  "linear-gradient(135deg,#1a2e05,#1a3a1c)",
  "linear-gradient(135deg,#052e16,#14532d)",
  "linear-gradient(135deg,#022c22,#064e3b)",
];

const NEGATIVE_TAGS = ["Long wait","Rude staff","Cold food","Wrong order","Dirty tables","Overpriced","Small portions","Slow service","Poor packaging","Noisy environment"];
const POSITIVE_TAGS = ["Amazing taste","Friendly staff","Great ambience","Fast service","Worth the price","Beautiful decor","Will visit again","Fresh ingredients","Perfect portions","Loved the vibe"];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Section wrapper with scroll reveal
function Section({ id, children, className = "" }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section id={id} ref={ref} className={`transition-all duration-700 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>
      {children}
    </section>
  );
}

// Star / emoji rating card for categories
function RatingCard({ cat, value, onChange }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{cat.icon}</span>
        <span className="text-white/80 text-sm font-semibold">{cat.label}</span>
      </div>
      <div className="flex gap-1.5">
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={() => onChange(n)}
            className="flex-1 h-9 rounded-xl text-sm font-bold transition-all duration-150 active:scale-90"
            style={{
              background: (value || 0) >= n ? cat.color : "rgba(255,255,255,0.07)",
              color: (value || 0) >= n ? "#fff" : "rgba(255,255,255,0.3)",
              transform: (value || 0) === n ? "scale(1.1)" : "scale(1)",
            }}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FeedbackFlow({ storeData, storeName, storeId, onComplete }) {
  const [emotion, setEmotion]         = useState(3); // 0-5 index
  const [catRatings, setCatRatings]   = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [name, setName]               = useState("");
  const [phone, setPhone]             = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const bottomRef = useRef(null);

  const isGood    = emotion >= 3;
  const tags      = isGood ? POSITIVE_TAGS : NEGATIVE_TAGS;
  const accentColor = EMOTION_COLORS[emotion];
  const heroBg    = EMOTION_BG[emotion];

  function toggleTag(tag) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const payload = {
        storeId, storeName,
        emotionScore: emotion + 1,
        categoryRatings: catRatings,
        feedbackText, tags: selectedTags,
        name: name || undefined,
        phone: phone || undefined,
      };
      await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      onComplete(payload);
    } catch {
      onComplete({ storeId, storeName, emotionScore: emotion + 1 });
    }
  }

  const completedCats = Object.keys(catRatings).length;
  const canSubmit = feedbackText.trim().length > 0 || completedCats >= 3 || selectedTags.length > 0;

  return (
    <div className="min-h-screen w-full" style={{ background: "#0d0d0f", transition: "background 0.8s ease" }}>
      {/* Floating ambient glow that changes with emotion */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20"
          style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`, transition: "background 1s ease", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-8 pb-24">

        {/* ── Sticky Header ── */}
        <div className="sticky top-0 z-20 py-4 mb-2"
          style={{ background: "rgba(13,13,15,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg overflow-hidden">
                <img src="/kreamz-logo.jpg" alt="Kreamz" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-white font-black text-sm leading-none">Share Feedback</p>
                <p className="text-white/40 text-xs mt-0.5">{storeName}</p>
              </div>
            </div>
            {/* Scroll progress */}
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (completedCats / 8) * 60 + (feedbackText ? 30 : 0) + (selectedTags.length > 0 ? 10 : 0))}%`, background: accentColor }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 1: Store Visit Banner ── */}
        <Section id="store" className="mb-12 mt-4">
          <div className="rounded-3xl p-6 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,rgba(233,30,140,0.15),rgba(194,24,91,0.08))", border: "1px solid rgba(233,30,140,0.2)" }}>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">📍</div>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-1">You are visiting</p>
                <h2 className="text-white font-black text-xl leading-tight">{storeName}</h2>
                {storeData?.city && <p className="text-white/50 text-sm mt-0.5">{storeData.city}</p>}
                {storeData?.address && <p className="text-white/35 text-xs mt-1 leading-relaxed">{storeData.address}</p>}
              </div>
            </div>
          </div>
        </Section>

        {/* ── SECTION 2: Emotion Hero ── */}
        <Section id="emotion" className="mb-14">
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="p-8 pb-6">
              <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-bold mb-2">Overall Feeling</p>
              <h2 className="text-white font-black text-2xl leading-tight">How was your<br/>experience today?</h2>
            </div>

            {/* Big emoji display */}
            <div className="px-8 pb-4 flex flex-col items-center gap-4">
              <div className="text-8xl transition-all duration-300 select-none"
                style={{ filter: `drop-shadow(0 0 24px ${accentColor}80)`, transform: emotion >= 4 ? "scale(1.08)" : "scale(1)" }}>
                {EMOJIS[emotion]}
              </div>
              <div className="font-black text-2xl transition-all duration-300" style={{ color: accentColor }}>
                {EMOJI_LABELS[emotion]}
              </div>
            </div>

            {/* Slider */}
            <div className="px-8 pb-8">
              <div className="relative">
                <input type="range" min={0} max={5} value={emotion}
                  onChange={e => { setEmotion(Number(e.target.value)); setSelectedTags([]); }}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${(emotion / 5) * 100}%, rgba(255,255,255,0.1) ${(emotion / 5) * 100}%, rgba(255,255,255,0.1) 100%)`,
                    accentColor,
                  }} />
                <div className="flex justify-between mt-2">
                  {EMOJIS.map((e, i) => (
                    <button key={i} onClick={() => { setEmotion(i); setSelectedTags([]); }}
                      className="text-lg transition-all duration-200 hover:scale-125"
                      style={{ opacity: emotion === i ? 1 : 0.3 }}>{e}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ── SECTION 3: Experience Breakdown ── */}
        <Section id="breakdown" className="mb-14">
          <div className="mb-5">
            <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-bold mb-1">Experience Breakdown</p>
            <h2 className="text-white font-black text-xl">Rate each aspect</h2>
            <p className="text-white/40 text-sm mt-1">Tap a number to rate · Optional</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIES.map(cat => (
              <RatingCard key={cat.id} cat={cat} value={catRatings[cat.id]}
                onChange={v => setCatRatings(prev => ({ ...prev, [cat.id]: v }))} />
            ))}
          </div>
        </Section>

        {/* ── SECTION 4: Quick Reactions ── */}
        <Section id="reactions" className="mb-14">
          <div className="mb-5">
            <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-bold mb-1">Quick Reactions</p>
            <h2 className="text-white font-black text-xl">
              {isGood ? "What did you love? 💕" : "What went wrong? 💭"}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {tags.map(tag => {
              const active = selectedTags.includes(tag);
              return (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95"
                  style={{
                    background: active ? accentColor : "rgba(255,255,255,0.06)",
                    color: active ? "#fff" : "rgba(255,255,255,0.55)",
                    border: `1px solid ${active ? accentColor : "rgba(255,255,255,0.1)"}`,
                    transform: active ? "scale(1.04)" : "scale(1)",
                    boxShadow: active ? `0 4px 20px ${accentColor}50` : "none",
                  }}>
                  {tag}
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── SECTION 5: Voice/Text Feedback ── */}
        <Section id="message" className="mb-14">
          <div className="mb-5">
            <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-bold mb-1">Your Message</p>
            <h2 className="text-white font-black text-xl">Tell us more</h2>
            <p className="text-white/40 text-sm mt-1">Optional · Anything on your mind</p>
          </div>
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {/* Chat-style header */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">💬</div>
              <div>
                <p className="text-white/70 text-sm font-semibold">Kreamz Support</p>
                <p className="text-white/30 text-xs">We read every message</p>
              </div>
            </div>
            {/* Message bubble */}
            <div className="p-5">
              <div className="rounded-2xl rounded-tl-sm mb-4 px-4 py-3 text-sm" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}>
                We'd love to hear about your experience at <strong className="text-white">{storeName}</strong>. What made it special, or how can we do better?
              </div>
              <textarea
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                className="w-full rounded-2xl rounded-tl-sm px-4 py-3 text-sm resize-none outline-none placeholder:text-white/25"
                style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${feedbackText ? accentColor + "60" : "rgba(255,255,255,0.08)"}`, color: "rgba(255,255,255,0.85)", transition: "border-color 0.3s" }}
              />
            </div>
          </div>
        </Section>

        {/* ── SECTION 6: Contact ── */}
        <Section id="contact" className="mb-14">
          <div className="mb-5">
            <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-bold mb-1">Almost Done</p>
            <h2 className="text-white font-black text-xl">Your details <span className="text-white/30 font-medium text-base">(optional)</span></h2>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { val: name,  set: setName,  ph: "Your name",         icon: "👤" },
              { val: phone, set: setPhone, ph: "Phone number",      icon: "📱" },
            ].map(({ val, set, ph, icon }) => (
              <div key={ph} className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${val ? accentColor + "40" : "rgba(255,255,255,0.08)"}`, transition: "border-color 0.3s" }}>
                <span className="text-lg">{icon}</span>
                <input type={ph.includes("Phone") ? "tel" : "text"} value={val}
                  onChange={e => set(e.target.value)} placeholder={ph}
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/25"
                  style={{ color: "rgba(255,255,255,0.85)" }} />
              </div>
            ))}
          </div>
        </Section>

        {/* ── SECTION 7: About Kreamz ── */}
        <Section id="about" className="mb-14">
          <div className="rounded-3xl p-6" style={{ background: "linear-gradient(135deg,rgba(233,30,140,0.1),rgba(194,24,91,0.05))", border: "1px solid rgba(233,30,140,0.15)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-xl overflow-hidden flex-shrink-0">
                <img src="/kreamz-logo.jpg" alt="Kreamz" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-white font-black text-base">About Kreamz</h3>
                <p className="text-white/40 text-xs">Cakes & More</p>
              </div>
            </div>
            <p className="text-white/55 text-sm leading-relaxed">
              Kreamz is West Bengal's premium artisan cake and dessert brand — crafting memories with every bite since day one. From handcrafted layer cakes to artisan beverages, we bring joy to every celebration. Your feedback helps us perfect every experience.
            </p>
            <div className="flex gap-4 mt-4">
              {["🎂 Premium Cakes","☕ Artisan Drinks","🎁 Custom Orders"].map(t => (
                <span key={t} className="text-xs text-white/40 font-medium">{t}</span>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Submit Button ── */}
        <Section id="submit">
          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-5 rounded-2xl font-black text-lg transition-all duration-300 active:scale-95 disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, #c2185b)`,
              color: "#fff",
              boxShadow: `0 16px 48px ${accentColor}50`,
              transform: submitting ? "scale(0.97)" : "scale(1)",
            }}>
            {submitting ? "Sending... ✨" : `Submit Feedback ${EMOJIS[emotion]}`}
          </button>
          <p className="text-white/25 text-xs text-center mt-4">100% anonymous · Takes 90 seconds</p>
        </Section>

      </div>

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 28px; height: 28px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 2px 12px rgba(0,0,0,0.4);
          cursor: pointer;
          transition: transform 0.1s;
        }
        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); }
      `}</style>
    </div>
  );
}
