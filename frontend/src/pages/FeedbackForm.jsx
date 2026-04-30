import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase.js";
import { STORES, getStoreById } from "../lib/stores.js";

const RATINGS = [
  { id: "taste", label: "Taste & Flavour", icon: "🎂" },
  { id: "presentation", label: "Presentation", icon: "✨" },
  { id: "service", label: "Service", icon: "💝" },
  { id: "value", label: "Value for Money", icon: "💰" },
];

const EMOJIS = [
  { v: 1, e: "😞", l: "Bad" },
  { v: 2, e: "😐", l: "Okay" },
  { v: 3, e: "🙂", l: "Good" },
  { v: 4, e: "😊", l: "Great" },
  { v: 5, e: "🤩", l: "Amazing" },
];

const INIT_RATINGS = { taste: 0, presentation: 0, service: 0, value: 0 };

const css = `
  .ff-bg { min-height:100vh; background:linear-gradient(135deg,#fff0f8 0%,#fff9f5 60%,#fdf0ff 100%); display:flex; flex-direction:column; align-items:center; padding:2rem 1rem 4rem; position:relative; overflow:hidden; }
  .ff-blob1 { position:fixed; width:420px; height:420px; background:radial-gradient(circle,#e91e8c,#ff69b4); border-radius:50%; filter:blur(90px); opacity:0.25; top:-140px; right:-140px; pointer-events:none; z-index:0; }
  .ff-blob2 { position:fixed; width:320px; height:320px; background:radial-gradient(circle,#c41674,#e91e8c); border-radius:50%; filter:blur(80px); opacity:0.2; bottom:-100px; left:-100px; pointer-events:none; z-index:0; }
  .ff-card { background:rgba(255,255,255,0.93); backdrop-filter:blur(20px); border-radius:28px; box-shadow:0 8px 48px rgba(233,30,140,0.13); width:100%; max-width:520px; overflow:hidden; position:relative; z-index:1; }
  .ff-header { background:linear-gradient(135deg,#e91e8c,#c41674); padding:1.4rem 2rem 1.2rem; text-align:center; }
  .ff-logo { width:42px; height:42px; border-radius:50%; border:2px solid rgba(255,255,255,0.6); object-fit:cover; vertical-align:middle; margin-right:8px; }
  .ff-brand { font-family:var(--font-d); font-size:1.6rem; font-weight:800; color:white; }
  .ff-tagline { color:rgba(255,255,255,0.75); font-size:0.78rem; letter-spacing:0.07em; text-transform:uppercase; margin-top:2px; }
  .ff-step { padding:1.75rem 2rem; }
  .ff-progress { height:4px; background:#f3d5e8; border-radius:99px; margin-bottom:1.6rem; overflow:hidden; }
  .ff-bar { height:100%; background:linear-gradient(90deg,#e91e8c,#ff69b4); border-radius:99px; transition:width 0.4s ease; }
  .ff-hero { font-size:3.5rem; text-align:center; margin-bottom:0.75rem; animation:pulse 2s ease infinite; }
  .ff-title { font-family:var(--font-d); font-size:1.5rem; font-weight:800; text-align:center; margin-bottom:0.4rem; color:var(--dark); line-height:1.2; }
  .ff-sub { color:var(--gray); text-align:center; font-size:0.9rem; margin-bottom:1.6rem; line-height:1.5; }
  .ff-store-tag { text-align:center; color:var(--pink); font-weight:600; font-size:0.85rem; background:#fde7f3; border-radius:99px; padding:0.3rem 1rem; margin-bottom:1.4rem; display:inline-block; width:100%; }
  .ff-qr-tag { text-align:center; color:#065f46; font-size:0.78rem; background:#d1fae5; border:1px solid #6ee7b7; border-radius:99px; padding:0.3rem 1rem; margin-bottom:0.75rem; }
  .ff-label { display:block; font-size:0.82rem; font-weight:600; color:var(--dark); margin-bottom:0.45rem; }
  .ff-field { margin-bottom:1.1rem; }
  .ff-input { width:100%; padding:0.78rem 1rem; border:1.5px solid var(--border); border-radius:12px; font-size:0.93rem; color:var(--dark); background:white; outline:none; transition:border-color 0.2s,box-shadow 0.2s; }
  .ff-input:focus { border-color:var(--pink); box-shadow:0 0 0 3px rgba(233,30,140,0.1); }
  .ff-textarea { resize:vertical; min-height:88px; }
  .ff-select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23e91e8c' d='M6 8L0 0h12z'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; padding-right:2rem; }
  .ff-rating-block { margin-bottom:1.2rem; padding-bottom:1.2rem; border-bottom:1px dashed var(--border); }
  .ff-rating-block:last-of-type { border-bottom:none; }
  .ff-rating-label { font-size:0.88rem; font-weight:600; margin-bottom:0.6rem; display:flex; align-items:center; gap:6px; }
  .ff-emoji-row { display:flex; gap:5px; justify-content:space-between; }
  .ff-emoji-btn { flex:1; display:flex; flex-direction:column; align-items:center; gap:2px; padding:0.45rem 0.2rem; border:1.5px solid var(--border); border-radius:11px; background:white; cursor:pointer; transition:all 0.18s; }
  .ff-emoji-btn:hover { border-color:#ff69b4; transform:translateY(-2px); }
  .ff-emoji-btn.sel { border-color:var(--pink); background:#fde7f3; box-shadow:0 2px 8px rgba(233,30,140,0.2); transform:translateY(-2px); }
  .ff-emoji { font-size:1.35rem; }
  .ff-el { font-size:0.58rem; color:var(--gray); text-align:center; }
  .ff-range-wrap { margin-top:1.2rem; }
  .ff-range { width:100%; height:6px; border-radius:99px; background:linear-gradient(to right,var(--pink) 0%,var(--pink) calc(var(--v,80%) * 1%),#f3d5e8 calc(var(--v,80%) * 1%),#f3d5e8 100%); appearance:none; outline:none; cursor:pointer; margin:0.5rem 0 0.2rem; }
  .ff-range::-webkit-slider-thumb { appearance:none; width:22px; height:22px; border-radius:50%; background:var(--pink); border:3px solid white; box-shadow:0 2px 8px rgba(233,30,140,0.4); cursor:pointer; }
  .ff-range-labels { display:flex; justify-content:space-between; font-size:0.7rem; color:var(--gray); }
  .ff-recommend-row { display:flex; gap:6px; flex-wrap:wrap; }
  .ff-rec-btn { flex:1; min-width:110px; padding:0.55rem 0.5rem; border:1.5px solid var(--border); border-radius:11px; background:white; font-size:0.78rem; font-weight:500; cursor:pointer; transition:all 0.18s; text-align:center; }
  .ff-rec-btn:hover { border-color:var(--pink); }
  .ff-rec-btn.sel { background:var(--pink); border-color:var(--pink); color:white; }
  .ff-section-divider { font-size:0.78rem; font-weight:700; color:var(--pink); text-transform:uppercase; letter-spacing:0.06em; margin:1.25rem 0 0.75rem; padding-top:1rem; border-top:1px dashed var(--border); }
  .ff-row2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .ff-btn { display:flex; align-items:center; justify-content:center; gap:6px; width:100%; padding:0.88rem 1.5rem; background:linear-gradient(135deg,var(--pink),var(--pink-dark)); color:white; border:none; border-radius:14px; font-size:0.97rem; font-weight:700; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 16px rgba(233,30,140,0.32); margin-top:0.75rem; }
  .ff-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 6px 24px rgba(233,30,140,0.42); }
  .ff-btn:disabled { opacity:0.45; cursor:not-allowed; transform:none; box-shadow:none; }
  .ff-btn-ghost { background:transparent; color:var(--gray); box-shadow:none; border:1.5px solid var(--border); }
  .ff-btn-ghost:hover:not(:disabled) { border-color:var(--pink); color:var(--pink); box-shadow:none; transform:none; }
  .ff-btn-row { display:flex; gap:10px; }
  .ff-btn-row .ff-btn { flex:1; margin-top:0; }
  .ff-error { color:#dc2626; font-size:0.82rem; text-align:center; background:#fff5f5; border-radius:8px; padding:0.5rem; margin-bottom:0.75rem; }
  .ff-spinner { width:18px; height:18px; border:2.5px solid rgba(255,255,255,0.35); border-top-color:white; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
  .ff-thanks { text-align:center; }
  .ff-thanks-icon { font-size:4rem; margin-bottom:0.75rem; animation:pulse 1.5s ease infinite; }
  .ff-thanks-badge { display:inline-flex; align-items:center; gap:6px; background:linear-gradient(135deg,#fde7f3,#fff0f8); border:1.5px solid var(--border); border-radius:99px; padding:0.45rem 1.25rem; font-weight:700; color:var(--pink); font-size:0.95rem; margin-top:1rem; }
  .ff-footer { margin-top:1.75rem; text-align:center; font-size:0.78rem; color:#9e86a2; position:relative; z-index:1; }
  @media(max-width:480px) { .ff-step{padding:1.4rem 1.2rem;} .ff-title{font-size:1.25rem;} .ff-el{display:none;} .ff-row2{grid-template-columns:1fr;} }
`;

export default function FeedbackForm() {
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [qrDetected, setQrDetected] = useState(false);
  const [ratings, setRatings] = useState(INIT_RATINGS);
  const [overall, setOverall] = useState(8);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [anniversary, setAnniversary] = useState("");
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const sid = params.get("store");
    if (sid) {
      const s = getStoreById(sid);
      if (s) { setStoreId(s.id); setStoreName(s.name); setQrDetected(true); setStep(1); }
    }
  }, [params]);

  const avgR = Object.values(ratings).filter(Boolean).length
    ? (Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).filter(Boolean).length).toFixed(1)
    : "–";

  const canNext1 = storeId !== "";
  const canNext2 = Object.values(ratings).every(v => v > 0);

  async function submit() {
    if (submitting) return;
    setSubmitting(true); setError("");
    try {
      await addDoc(collection(db, "feedbacks"), {
        storeId, store: storeName,
        ratings, overall, recommend,
        name: name.trim() || "Anonymous",
        phone: phone.trim(), email: email.trim(),
        birthday: birthday || null, anniversary: anniversary || null,
        comment: comment.trim(),
        avgRating: parseFloat(avgR) || 0,
        createdAt: serverTimestamp(), source: "kreamz-qr",
      });
      setStep(3);
    } catch (e) {
      console.error(e);
      setError("Could not save. Please check your connection and try again.");
    } finally { setSubmitting(false); }
  }

  function reset() {
    setStep(0); setStoreId(""); setStoreName(""); setQrDetected(false);
    setRatings(INIT_RATINGS); setOverall(8); setName(""); setPhone("");
    setEmail(""); setBirthday(""); setAnniversary(""); setComment("");
    setRecommend(null); setError("");
    window.history.replaceState({}, "", "/");
  }

  return (
    <>
      <style>{css}</style>
      <div className="ff-bg">
        <div className="ff-blob1" /><div className="ff-blob2" />
        <div className="ff-card">
          {/* Header */}
          <header className="ff-header">
            <img src="/kreamz-logo.jpg" alt="Kreamz" className="ff-logo" onError={e => e.target.style.display="none"} />
            <span className="ff-brand">Kreamz</span>
            <div className="ff-tagline">Cakes &amp; More • Share Your Experience</div>
          </header>

          {/* STEP 0 — Store Selection */}
          {step === 0 && (
            <div className="ff-step fadeUp">
              <div className="ff-hero">🎂</div>
              <h1 className="ff-title">How was your experience?</h1>
              <p className="ff-sub">Select your store and tell us how we did. It takes 2 minutes!</p>
              <div className="ff-field">
                <label className="ff-label">Select your Kreamz outlet</label>
                <select className="ff-input ff-select" value={storeId}
                  onChange={e => { setStoreId(e.target.value); const s = STORES.find(x => x.id === e.target.value); setStoreName(s ? s.name : ""); }}>
                  <option value="">— Choose your store —</option>
                  {STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <button className="ff-btn" disabled={!canNext1} onClick={() => setStep(1)}>Start Feedback →</button>
            </div>
          )}

          {/* STEP 1 — Ratings */}
          {step === 1 && (
            <div className="ff-step fadeUp">
              <div className="ff-progress"><div className="ff-bar" style={{ width: "33%" }} /></div>
              <h2 className="ff-title">Rate your experience</h2>
              {qrDetected && <div className="ff-qr-tag">📷 Store detected from QR scan</div>}
              <div className="ff-store-tag">📍 {storeName}</div>

              {RATINGS.map(q => (
                <div key={q.id} className="ff-rating-block">
                  <div className="ff-rating-label"><span>{q.icon}</span>{q.label}</div>
                  <div className="ff-emoji-row">
                    {EMOJIS.map(e => (
                      <button key={e.v} className={`ff-emoji-btn${ratings[q.id] === e.v ? " sel" : ""}`}
                        onClick={() => setRatings(p => ({ ...p, [q.id]: e.v }))} title={e.l}>
                        <span className="ff-emoji">{e.e}</span>
                        <span className="ff-el">{e.l}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="ff-range-wrap">
                <label className="ff-label">Overall score: <strong style={{ color: "var(--pink)" }}>{overall}/10</strong></label>
                <input type="range" min="1" max="10" value={overall}
                  style={{ "--v": overall * 10 }}
                  onChange={e => setOverall(+e.target.value)} className="ff-range" />
                <div className="ff-range-labels"><span>1 — Poor</span><span>10 — Perfect</span></div>
              </div>

              <div className="ff-btn-row" style={{ marginTop: "1.25rem" }}>
                {!qrDetected && <button className="ff-btn ff-btn-ghost" onClick={() => setStep(0)}>← Back</button>}
                <button className="ff-btn" disabled={!canNext2} onClick={() => setStep(2)}>Next →</button>
              </div>
            </div>
          )}

          {/* STEP 2 — Details */}
          {step === 2 && (
            <div className="ff-step fadeUp">
              <div className="ff-progress"><div className="ff-bar" style={{ width: "66%" }} /></div>
              <h2 className="ff-title">A little about you</h2>
              <p className="ff-sub">Help us remember you for special occasions 🎉</p>

              <div className="ff-field">
                <label className="ff-label">Your name</label>
                <input className="ff-input" type="text" placeholder="e.g. Priya Sharma"
                  value={name} onChange={e => setName(e.target.value)} />
              </div>

              <div className="ff-row2">
                <div className="ff-field">
                  <label className="ff-label">Phone</label>
                  <input className="ff-input" type="tel" placeholder="+91 98765 43210"
                    value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="ff-field">
                  <label className="ff-label">Email</label>
                  <input className="ff-input" type="email" placeholder="you@email.com"
                    value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="ff-section-divider">🎂 Special Occasions (Optional)</div>

              <div className="ff-row2">
                <div className="ff-field">
                  <label className="ff-label">🎂 Birthday</label>
                  <input className="ff-input" type="date" value={birthday} onChange={e => setBirthday(e.target.value)} />
                </div>
                <div className="ff-field">
                  <label className="ff-label">💍 Anniversary</label>
                  <input className="ff-input" type="date" value={anniversary} onChange={e => setAnniversary(e.target.value)} />
                </div>
              </div>

              <div className="ff-field">
                <label className="ff-label">Your thoughts (optional)</label>
                <textarea className="ff-input ff-textarea" rows={3}
                  placeholder="Tell us about your cake, the flavour, the occasion..."
                  value={comment} onChange={e => setComment(e.target.value)} />
              </div>

              <div className="ff-field">
                <label className="ff-label">Would you recommend Kreamz?</label>
                <div className="ff-recommend-row">
                  {["Yes, definitely! 🥰", "Maybe 🤔", "No 😔"].map((opt, i) => (
                    <button key={opt} className={`ff-rec-btn${recommend === i ? " sel" : ""}`}
                      onClick={() => setRecommend(i)}>{opt}</button>
                  ))}
                </div>
              </div>

              {error && <p className="ff-error">{error}</p>}
              <div className="ff-btn-row">
                <button className="ff-btn ff-btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="ff-btn" onClick={submit} disabled={submitting}>
                  {submitting ? <span className="ff-spinner" /> : "Submit Feedback 🎉"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Thank You */}
          {step === 3 && (
            <div className="ff-step ff-thanks pop">
              <div className="ff-thanks-icon">🎊</div>
              <h2 className="ff-title">Thank you{name ? `, ${name}` : ""}!</h2>
              <p className="ff-sub">Your feedback means the world to us. We'll keep making your moments sweeter.</p>
              <div className="ff-thanks-badge">⭐ Avg Rating: {avgR} / 5</div>
              {(birthday || anniversary) && (
                <p style={{ marginTop: "1rem", fontSize: "0.82rem", color: "var(--gray)", textAlign: "center" }}>
                  🎂 We'll remember your special day and make it extra sweet!
                </p>
              )}
              <button className="ff-btn" style={{ marginTop: "1.5rem" }} onClick={reset}>Submit Another →</button>
            </div>
          )}
        </div>
        <footer className="ff-footer">Made with 💝 by Kreamz India • All {STORES.length} outlets</footer>
      </div>
    </>
  );
}
