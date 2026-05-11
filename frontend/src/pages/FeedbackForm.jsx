import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase.js";
import { STORES, AFE_ZONES, getStoreById } from "../lib/stores.js";

const RATINGS = [
  { id: "taste",        label: "Taste & Flavour",  icon: "🎂" },
  { id: "presentation", label: "Presentation",      icon: "✨" },
  { id: "service",      label: "Service",           icon: "💝" },
  { id: "value",        label: "Value for Money",   icon: "💰" },
];
const EMOJIS = [
  { v: 1, e: "😞", l: "Bad"     },
  { v: 2, e: "😐", l: "Okay"    },
  { v: 3, e: "🙂", l: "Good"    },
  { v: 4, e: "😊", l: "Great"   },
  { v: 5, e: "🤩", l: "Amazing" },
];
const WHO_OPTIONS = ["Customer", "Internal Team", "Franchise Owner", "Store Member"];
const INIT_RATINGS = { taste: 0, presentation: 0, service: 0, value: 0 };

// ── Inline CSS ───────────────────────────────────────────────────────────────
const css = `
  .ff-bg{min-height:100vh;background:linear-gradient(135deg,#fff0f8 0%,#fff9f5 60%,#fdf0ff 100%);display:flex;flex-direction:column;align-items:center;padding:2rem 1rem 4rem;position:relative;overflow:hidden}
  .ff-blob1{position:fixed;width:420px;height:420px;background:radial-gradient(circle,#e91e8c,#ff69b4);border-radius:50%;filter:blur(90px);opacity:.22;top:-140px;right:-140px;pointer-events:none;z-index:0}
  .ff-blob2{position:fixed;width:320px;height:320px;background:radial-gradient(circle,#c41674,#e91e8c);border-radius:50%;filter:blur(80px);opacity:.18;bottom:-100px;left:-100px;pointer-events:none;z-index:0}
  .ff-card{background:rgba(255,255,255,.94);backdrop-filter:blur(20px);border-radius:28px;box-shadow:0 8px 48px rgba(233,30,140,.13);width:100%;max-width:540px;overflow:hidden;position:relative;z-index:1}
  .ff-header{background:linear-gradient(135deg,#e91e8c,#c41674);padding:1.4rem 2rem 1.2rem;text-align:center}
  .ff-logo{width:42px;height:42px;border-radius:50%;border:2px solid rgba(255,255,255,.6);object-fit:cover;vertical-align:middle;margin-right:8px}
  .ff-brand{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:800;color:white}
  .ff-tagline{color:rgba(255,255,255,.75);font-size:.78rem;letter-spacing:.07em;text-transform:uppercase;margin-top:2px}
  .ff-step{padding:1.75rem 2rem}
  .ff-prog{height:4px;background:#f3d5e8;border-radius:99px;margin-bottom:1.6rem;overflow:hidden}
  .ff-bar{height:100%;background:linear-gradient(90deg,#e91e8c,#ff69b4);border-radius:99px;transition:width .4s ease}
  .ff-hero{font-size:3.2rem;text-align:center;margin-bottom:.6rem;animation:pulse 2s ease infinite}
  .ff-title{font-family:'Playfair Display',serif;font-size:1.45rem;font-weight:800;text-align:center;margin-bottom:.35rem;color:#1a0a14;line-height:1.2}
  .ff-sub{color:#6b7280;text-align:center;font-size:.88rem;margin-bottom:1.5rem;line-height:1.5}
  .ff-store-tag{text-align:center;color:#e91e8c;font-weight:600;font-size:.85rem;background:#fde7f3;border-radius:99px;padding:.3rem 1rem;margin-bottom:1.2rem;display:block;width:100%}
  .ff-qr-badge{text-align:center;color:#065f46;font-size:.76rem;background:#d1fae5;border:1px solid #6ee7b7;border-radius:99px;padding:.28rem .9rem;margin-bottom:.6rem;display:block}
  .ff-label{display:block;font-size:.82rem;font-weight:600;color:#1a0a14;margin-bottom:.42rem}
  .ff-req{color:#e91e8c;margin-left:2px}
  .ff-field{margin-bottom:1.05rem}
  .ff-input{width:100%;padding:.76rem 1rem;border:1.5px solid #f3d5e8;border-radius:12px;font-size:.93rem;color:#1a0a14;background:white;outline:none;transition:border-color .2s,box-shadow .2s;box-sizing:border-box}
  .ff-input:focus{border-color:#e91e8c;box-shadow:0 0 0 3px rgba(233,30,140,.1)}
  .ff-input.err{border-color:#dc2626;box-shadow:0 0 0 3px rgba(220,38,38,.08)}
  .ff-textarea{resize:vertical;min-height:80px}
  .ff-sel{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23e91e8c' d='M6 8L0 0h12z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:2rem}
  .ff-err-msg{color:#dc2626;font-size:.75rem;margin-top:.25rem}
  .ff-rating-block{margin-bottom:1.1rem;padding-bottom:1.1rem;border-bottom:1px dashed #f3d5e8}
  .ff-rating-block:last-of-type{border-bottom:none}
  .ff-rating-label{font-size:.87rem;font-weight:600;margin-bottom:.55rem;display:flex;align-items:center;gap:6px}
  .ff-emoji-row{display:flex;gap:4px;justify-content:space-between}
  .ff-emoji-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:.42rem .15rem;border:1.5px solid #f3d5e8;border-radius:11px;background:white;cursor:pointer;transition:all .18s}
  .ff-emoji-btn:hover{border-color:#ff69b4;transform:translateY(-2px)}
  .ff-emoji-btn.sel{border-color:#e91e8c;background:#fde7f3;box-shadow:0 2px 8px rgba(233,30,140,.2);transform:translateY(-2px)}
  .ff-emoji{font-size:1.3rem}
  .ff-el{font-size:.56rem;color:#6b7280;text-align:center}
  .ff-range-wrap{margin-top:1.1rem}
  .ff-range{width:100%;height:6px;border-radius:99px;appearance:none;outline:none;cursor:pointer;margin:.45rem 0 .2rem;background:linear-gradient(to right,#e91e8c calc(var(--v,80%)*1%),#f3d5e8 calc(var(--v,80%)*1%))}
  .ff-range::-webkit-slider-thumb{appearance:none;width:22px;height:22px;border-radius:50%;background:#e91e8c;border:3px solid white;box-shadow:0 2px 8px rgba(233,30,140,.4);cursor:pointer}
  .ff-range-labels{display:flex;justify-content:space-between;font-size:.68rem;color:#6b7280}
  .ff-divider{font-size:.76rem;font-weight:700;color:#e91e8c;text-transform:uppercase;letter-spacing:.06em;margin:1.2rem 0 .7rem;padding-top:.9rem;border-top:1px dashed #f3d5e8}
  .ff-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .ff-who-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .ff-who-btn{padding:.65rem .5rem;border:1.5px solid #f3d5e8;border-radius:12px;background:white;font-size:.85rem;font-weight:500;cursor:pointer;transition:all .18s;text-align:center;color:#1a0a14}
  .ff-who-btn:hover{border-color:#e91e8c}
  .ff-who-btn.sel{background:#e91e8c;border-color:#e91e8c;color:white;font-weight:700}
  .ff-rec-row{display:flex;gap:6px;flex-wrap:wrap}
  .ff-rec-btn{flex:1;min-width:105px;padding:.52rem .45rem;border:1.5px solid #f3d5e8;border-radius:11px;background:white;font-size:.76rem;font-weight:500;cursor:pointer;transition:all .18s;text-align:center}
  .ff-rec-btn:hover{border-color:#e91e8c}
  .ff-rec-btn.sel{background:#e91e8c;border-color:#e91e8c;color:white}
  .ff-btn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:.86rem 1.4rem;background:linear-gradient(135deg,#e91e8c,#c41674);color:white;border:none;border-radius:14px;font-size:.96rem;font-weight:700;cursor:pointer;transition:all .2s;box-shadow:0 4px 16px rgba(233,30,140,.3);margin-top:.7rem}
  .ff-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 24px rgba(233,30,140,.42)}
  .ff-btn:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}
  .ff-ghost{background:transparent;color:#6b7280;box-shadow:none;border:1.5px solid #f3d5e8}
  .ff-ghost:hover:not(:disabled){border-color:#e91e8c;color:#e91e8c;box-shadow:none;transform:none}
  .ff-btn-row{display:flex;gap:10px}
  .ff-btn-row .ff-btn{flex:1;margin-top:0}
  .ff-err-box{color:#dc2626;font-size:.82rem;text-align:center;background:#fff5f5;border-radius:8px;padding:.5rem;margin-bottom:.7rem}
  .ff-spinner{width:18px;height:18px;border:2.5px solid rgba(255,255,255,.35);border-top-color:white;border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
  .ff-thanks{text-align:center}
  .ff-thanks-icon{font-size:4rem;margin-bottom:.7rem;animation:pulse 1.5s ease infinite}
  .ff-thanks-badge{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#fde7f3,#fff0f8);border:1.5px solid #f3d5e8;border-radius:99px;padding:.42rem 1.2rem;font-weight:700;color:#e91e8c;font-size:.93rem;margin-top:.9rem}
  .ff-footer{margin-top:1.6rem;text-align:center;font-size:.76rem;color:#9e86a2;position:relative;z-index:1}
  @media(max-width:480px){.ff-step{padding:1.3rem 1.1rem}.ff-title{font-size:1.2rem}.ff-el{display:none}.ff-row2{grid-template-columns:1fr}.ff-who-grid{grid-template-columns:1fr 1fr}}
`;

export default function FeedbackForm() {
  const [params] = useSearchParams();

  // Store — detected from QR or shown inline
  const [storeId,   setStoreId]   = useState("");
  const [storeName, setStoreName] = useState("");
  const [location,  setLocation]  = useState("");  // AFE zone
  const [qrDetected, setQrDetected] = useState(false);

  // Step: 1 = ratings, 2 = details, 3 = thanks
  const [step, setStep] = useState(1);

  // Ratings
  const [ratings, setRatings] = useState(INIT_RATINGS);
  const [overall, setOverall] = useState(8);

  // Details
  const [whoAreYou,   setWhoAreYou]   = useState("");
  const [name,        setName]        = useState("");
  const [phone,       setPhone]       = useState("");
  const [email,       setEmail]       = useState("");
  const [birthday,    setBirthday]    = useState("");
  const [anniversary, setAnniversary] = useState("");
  const [improve,     setImprove]     = useState("");
  const [recommend,   setRecommend]   = useState(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState({});
  const [submitErr,  setSubmitErr]  = useState("");

  // ── Detect store from QR param ────────────────────────────────────────────
  useEffect(() => {
    const sid = params.get("store");
    if (sid) {
      const s = getStoreById(sid);
      if (s) {
        setStoreId(s.id);
        setStoreName(s.name);
        setLocation(s.afe || "");
        setQrDetected(true);
      }
    }
  }, [params]);

  // ── Computed ──────────────────────────────────────────────────────────────
  const avgR = Object.values(ratings).filter(Boolean).length
    ? (Object.values(ratings).reduce((a, b) => a + b, 0) /
       Object.values(ratings).filter(Boolean).length).toFixed(1)
    : "–";

  const ratingsComplete = Object.values(ratings).every(v => v > 0);

  // ── Step 1 → 2 validation ─────────────────────────────────────────────────
  function goToDetails() {
    const e = {};
    if (!storeId)        e.store    = "Please select your outlet";
    if (!location)       e.location = "Please select a location";
    if (!ratingsComplete) e.ratings = "Please rate all categories";
    setErrors(e);
    if (Object.keys(e).length === 0) setStep(2);
  }

  // ── Step 2 → submit validation ────────────────────────────────────────────
  function validateDetails() {
    const e = {};
    if (!whoAreYou) e.whoAreYou = "Please select who you are";
    if (!improve.trim()) e.improve = "This field is required — please share what we can improve";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function submit() {
    if (submitting) return;
    if (!validateDetails()) return;
    setSubmitting(true);
    setSubmitErr("");
    try {
      await addDoc(collection(db, "feedbacks"), {
        storeId,
        store:       storeName,
        location:    location,
        whoAreYou,
        ratings,
        overall,
        recommend,
        name:        name.trim() || "Anonymous",
        phone:       phone.trim(),
        email:       email.trim(),
        birthday:    birthday    || null,
        anniversary: anniversary || null,
        improve:     improve.trim(),
        avgRating:   parseFloat(avgR) || 0,
        createdAt:   serverTimestamp(),
        source:      "kreamz-qr",
      });
      setStep(3);
    } catch (e) {
      console.error(e);
      setSubmitErr("Could not save your feedback. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStep(1);
    if (!qrDetected) { setStoreId(""); setStoreName(""); setLocation(""); }
    setRatings(INIT_RATINGS); setOverall(8);
    setWhoAreYou(""); setName(""); setPhone(""); setEmail("");
    setBirthday(""); setAnniversary(""); setImprove(""); setRecommend(null);
    setErrors({}); setSubmitErr("");
    if (!qrDetected) window.history.replaceState({}, "", "/");
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="ff-bg">
        <div className="ff-blob1" /><div className="ff-blob2" />

        <div className="ff-card">
          {/* Header */}
          <header className="ff-header">
            <img src="/kreamz-logo.jpg" alt="Kreamz" className="ff-logo"
              onError={e => e.target.style.display = "none"} />
            <span className="ff-brand">Kreamz</span>
            <div className="ff-tagline">Cakes &amp; More • Share Your Experience</div>
          </header>

          {/* ── STEP 1 — Ratings ── */}
          {step === 1 && (
            <div className="ff-step">
              <div className="ff-prog"><div className="ff-bar" style={{ width: "50%" }} /></div>
              <div className="ff-hero">🎂</div>
              <h1 className="ff-title">How was your experience?</h1>
              <p className="ff-sub">Tell us how we did — it takes 2 minutes!</p>

              {qrDetected && <span className="ff-qr-badge">📷 Store auto-detected from QR</span>}

              {/* Store — shown if not QR detected */}
              {!qrDetected && (
                <div className="ff-field">
                  <label className="ff-label">Outlet Name <span className="ff-req">*</span></label>
                  <select
                    className={`ff-input ff-sel${errors.store ? " err" : ""}`}
                    value={storeId}
                    onChange={e => {
                      setStoreId(e.target.value);
                      const s = STORES.find(x => x.id === e.target.value);
                      setStoreName(s ? s.name : "");
                      setLocation(s ? s.afe : "");
                      setErrors(p => ({ ...p, store: "", location: "" }));
                    }}
                  >
                    <option value="">— Choose your outlet —</option>
                    {STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {errors.store && <div className="ff-err-msg">{errors.store}</div>}
                </div>
              )}

              {qrDetected && <span className="ff-store-tag">📍 {storeName}</span>}

              {/* Location */}
              <div className="ff-field">
                <label className="ff-label">Location / Zone <span className="ff-req">*</span></label>
                <select
                  className={`ff-input ff-sel${errors.location ? " err" : ""}`}
                  value={location}
                  onChange={e => { setLocation(e.target.value); setErrors(p => ({ ...p, location: "" })); }}
                >
                  <option value="">— Select your zone —</option>
                  {AFE_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
                {errors.location && <div className="ff-err-msg">{errors.location}</div>}
              </div>

              {/* Emoji ratings */}
              {errors.ratings && <div className="ff-err-msg" style={{ marginBottom: 8 }}>{errors.ratings}</div>}
              {RATINGS.map(q => (
                <div key={q.id} className="ff-rating-block">
                  <div className="ff-rating-label"><span>{q.icon}</span>{q.label}</div>
                  <div className="ff-emoji-row">
                    {EMOJIS.map(em => (
                      <button key={em.v}
                        className={`ff-emoji-btn${ratings[q.id] === em.v ? " sel" : ""}`}
                        onClick={() => { setRatings(p => ({ ...p, [q.id]: em.v })); setErrors(p => ({ ...p, ratings: "" })); }}
                        title={em.l}>
                        <span className="ff-emoji">{em.e}</span>
                        <span className="ff-el">{em.l}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Overall slider */}
              <div className="ff-range-wrap">
                <label className="ff-label">
                  Overall Score: <strong style={{ color: "#e91e8c" }}>{overall}/10</strong>
                </label>
                <input type="range" min="1" max="10" value={overall}
                  style={{ "--v": overall * 10 }}
                  onChange={e => setOverall(+e.target.value)}
                  className="ff-range" />
                <div className="ff-range-labels"><span>1 — Poor</span><span>10 — Perfect</span></div>
              </div>

              <button className="ff-btn" style={{ marginTop: "1.25rem" }} onClick={goToDetails}>
                Next →
              </button>
            </div>
          )}

          {/* ── STEP 2 — Details ── */}
          {step === 2 && (
            <div className="ff-step">
              <div className="ff-prog"><div className="ff-bar" style={{ width: "100%" }} /></div>
              <h2 className="ff-title">A little about you</h2>
              <p className="ff-sub">Help us serve you better 🎉</p>

              {/* Who are you — REQUIRED */}
              <div className="ff-field">
                <label className="ff-label">Are You? <span className="ff-req">*</span></label>
                <div className="ff-who-grid">
                  {WHO_OPTIONS.map(opt => (
                    <button key={opt}
                      className={`ff-who-btn${whoAreYou === opt ? " sel" : ""}`}
                      onClick={() => { setWhoAreYou(opt); setErrors(p => ({ ...p, whoAreYou: "" })); }}>
                      {opt === "Customer"       && "🛍️ "}
                      {opt === "Internal Team"  && "👷 "}
                      {opt === "Franchise Owner"&& "🏪 "}
                      {opt === "Store Member"   && "👤 "}
                      {opt}
                    </button>
                  ))}
                </div>
                {errors.whoAreYou && <div className="ff-err-msg">{errors.whoAreYou}</div>}
              </div>

              {/* Name + Phone */}
              <div className="ff-row2">
                <div className="ff-field">
                  <label className="ff-label">Your Name</label>
                  <input className="ff-input" type="text" placeholder="e.g. Priya Sharma"
                    value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="ff-field">
                  <label className="ff-label">Phone</label>
                  <input className="ff-input" type="tel" placeholder="+91 98765 43210"
                    value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>

              {/* Email — optional */}
              <div className="ff-field">
                <label className="ff-label">Email <span style={{ color: "#6b7280", fontWeight: 400 }}>(optional)</span></label>
                <input className="ff-input" type="email" placeholder="you@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              {/* What to improve — REQUIRED */}
              <div className="ff-field">
                <label className="ff-label">What Can We Improve? <span className="ff-req">*</span></label>
                <textarea
                  className={`ff-input ff-textarea${errors.improve ? " err" : ""}`}
                  rows={3}
                  placeholder="Share anything we can do better — taste, packaging, service, speed..."
                  value={improve}
                  onChange={e => { setImprove(e.target.value); setErrors(p => ({ ...p, improve: "" })); }}
                />
                {errors.improve && <div className="ff-err-msg">{errors.improve}</div>}
              </div>

              {/* Special dates */}
              <div className="ff-divider">🎂 Special Occasions (Optional)</div>
              <div className="ff-row2">
                <div className="ff-field">
                  <label className="ff-label">🎂 Birthday</label>
                  <input className="ff-input" type="date" value={birthday}
                    onChange={e => setBirthday(e.target.value)} />
                </div>
                <div className="ff-field">
                  <label className="ff-label">💍 Anniversary</label>
                  <input className="ff-input" type="date" value={anniversary}
                    onChange={e => setAnniversary(e.target.value)} />
                </div>
              </div>

              {/* Recommend */}
              <div className="ff-field">
                <label className="ff-label">Would you recommend Kreamz?</label>
                <div className="ff-rec-row">
                  {["Yes, definitely! 🥰", "Maybe 🤔", "No 😔"].map((opt, i) => (
                    <button key={opt}
                      className={`ff-rec-btn${recommend === i ? " sel" : ""}`}
                      onClick={() => setRecommend(i)}>{opt}
                    </button>
                  ))}
                </div>
              </div>

              {submitErr && <div className="ff-err-box">{submitErr}</div>}

              <div className="ff-btn-row">
                <button className="ff-btn ff-ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="ff-btn" onClick={submit} disabled={submitting}>
                  {submitting ? <span className="ff-spinner" /> : "Submit Feedback 🎉"}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3 — Thank You ── */}
          {step === 3 && (
            <div className="ff-step ff-thanks">
              <div className="ff-thanks-icon">🎊</div>
              <h2 className="ff-title">Thank you{name ? `, ${name}` : ""}!</h2>
              <p className="ff-sub">Your feedback means the world to us. We'll keep making your moments sweeter.</p>
              <div className="ff-thanks-badge">⭐ Avg Rating: {avgR} / 5</div>
              {(birthday || anniversary) && (
                <p style={{ marginTop: "1rem", fontSize: ".8rem", color: "#6b7280", textAlign: "center" }}>
                  🎂 We'll remember your special day and make it extra sweet!
                </p>
              )}
              <button className="ff-btn" style={{ marginTop: "1.5rem" }} onClick={reset}>
                Submit Another →
              </button>
            </div>
          )}
        </div>

        <footer className="ff-footer">
          Made with 💝 by Kreamz India &bull; {STORES.length} outlets across India
        </footer>
      </div>
    </>
  );
}
