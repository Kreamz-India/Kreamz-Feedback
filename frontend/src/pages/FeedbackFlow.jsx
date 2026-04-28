import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { STORES, getStoreById } from "../lib/stores";
import "./FeedbackFlow.css";

const EMOJI_SCALE = [
  { value: 1, emoji: "😞", label: "Very Bad" },
  { value: 2, emoji: "😐", label: "Not Good" },
  { value: 3, emoji: "🙂", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "🤩", label: "Excellent!" },
];

const QUESTIONS = [
  { id: "taste", label: "How did the cake taste?", icon: "🎂" },
  { id: "presentation", label: "How was the presentation?", icon: "✨" },
  { id: "service", label: "How was the service?", icon: "💝" },
  { id: "value", label: "Value for money?", icon: "💰" },
];

const INITIAL_RATINGS = { taste: 0, presentation: 0, service: 0, value: 0 };

export default function FeedbackFlow() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [ratings, setRatings] = useState(INITIAL_RATINGS);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [overall, setOverall] = useState(8);
  const [qrDetected, setQrDetected] = useState(false);

  // Auto-detect store from QR scan URL
  useEffect(() => {
    const paramStoreId = searchParams.get("store");
    if (paramStoreId) {
      const found = getStoreById(paramStoreId);
      if (found) {
        setStoreId(found.id);
        setStoreName(found.name + " — " + found.city);
        setQrDetected(true);
        setStep(1);
      }
    }
  }, [searchParams]);

  const avgRating =
    Object.values(ratings).filter(Boolean).length > 0
      ? (Object.values(ratings).reduce((a, b) => a + b, 0) /
          Object.values(ratings).filter(Boolean).length).toFixed(1)
      : "–";

  const canProceedStep1 = storeId !== "";
  const canProceedStep2 = Object.values(ratings).every((v) => v > 0);

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const storeObj = getStoreById(storeId);
      await addDoc(collection(db, "feedbacks"), {
        storeId,
        store: storeName || storeId,
        storeCity: storeObj ? storeObj.city : "",
        storeArea: storeObj ? storeObj.area : "",
        ratings,
        overall,
        recommend,
        name: name.trim() || "Anonymous",
        phone: phone.trim(),
        comment: comment.trim(),
        avgRating: parseFloat(avgRating),
        createdAt: serverTimestamp(),
        source: "qr-scan",
      });
      setStep(3);
    } catch (err) {
      console.error(err);
      setError("Couldn't save your feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setStep(0);
    setStoreId("");
    setStoreName("");
    setRatings(INITIAL_RATINGS);
    setName("");
    setPhone("");
    setComment("");
    setRecommend(null);
    setOverall(8);
    setError("");
    setQrDetected(false);
    window.history.replaceState({}, "", window.location.pathname);
  }

  return (
    <div className="ff-bg">
      <div className="ff-blob ff-blob1" />
      <div className="ff-blob ff-blob2" />
      <div className="ff-card">
        <header className="ff-header">
          <div className="ff-logo-wrap">
            <img src="/kreamz-logo.jpg" alt="Kreamz" className="ff-logo" onError={(e) => { e.target.style.display = "none"; }} />
            <span className="ff-logo-text">Kreamz</span>
          </div>
          <p className="ff-tagline">Cakes &amp; More</p>
        </header>

        {step === 0 && (
          <div className="ff-step animate-fadeInUp">
            <div className="ff-hero-icon">🎂</div>
            <h1 className="ff-title">How was your experience?</h1>
            <p className="ff-subtitle">Your feedback helps us bake better memories. It only takes a minute!</p>
            <div className="ff-field">
              <label className="ff-label">Select your store</label>
              <select
                className="ff-input"
                value={storeId}
                onChange={(e) => {
                  const id = e.target.value;
                  setStoreId(id);
                  const s = getStoreById(id);
                  setStoreName(s ? s.name + " — " + s.city : "");
                }}
              >
                <option value="">— Choose a store —</option>
                {STORES.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                ))}
              </select>
            </div>
            <button className="ff-btn" disabled={!canProceedStep1} onClick={() => setStep(1)}>
              Start Feedback →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="ff-step animate-fadeInUp">
            <div className="ff-progress"><div className="ff-progress-bar" style={{ width: "33%" }} /></div>
            <h2 className="ff-title">Rate your experience</h2>
            {qrDetected && <div className="ff-qr-badge">📷 Scanned QR — store auto-detected</div>}
            <p className="ff-store-tag">📍 {storeName}</p>
            {QUESTIONS.map((q) => (
              <div key={q.id} className="ff-rating-block">
                <div className="ff-rating-label"><span>{q.icon}</span> {q.label}</div>
                <div className="ff-emoji-row">
                  {EMOJI_SCALE.map((e) => (
                    <button
                      key={e.value}
                      className={"ff-emoji-btn" + (ratings[q.id] === e.value ? " active" : "")}
                      onClick={() => setRatings((prev) => ({ ...prev, [q.id]: e.value }))}
                      title={e.label}
                    >
                      <span className="ff-emoji">{e.emoji}</span>
                      <span className="ff-emoji-label">{e.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="ff-field" style={{ marginTop: "1.5rem" }}>
              <label className="ff-label">Overall score: <strong style={{ color: "var(--pink)" }}>{overall}/10</strong></label>
              <input type="range" min="1" max="10" value={overall} onChange={(e) => setOverall(Number(e.target.value))} className="ff-range" />
              <div className="ff-range-labels"><span>1 — Poor</span><span>10 — Perfect</span></div>
            </div>
            <div className="ff-btn-row">
              {!qrDetected && <button className="ff-btn ff-btn-ghost" onClick={() => setStep(0)}>← Back</button>}
              <button className="ff-btn" disabled={!canProceedStep2} onClick={() => setStep(2)}>Next →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="ff-step animate-fadeInUp">
            <div className="ff-progress"><div className="ff-progress-bar" style={{ width: "66%" }} /></div>
            <h2 className="ff-title">A few more details</h2>
            <p className="ff-subtitle">Optional, but helps us serve you better</p>
            <div className="ff-field">
              <label className="ff-label">Your name</label>
              <input className="ff-input" type="text" placeholder="e.g. Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="ff-field">
              <label className="ff-label">Phone number (optional)</label>
              <input className="ff-input" type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="ff-field">
              <label className="ff-label">Anything else to share?</label>
              <textarea className="ff-input ff-textarea" placeholder="Tell us about your cake, the flavour, the occasion..." value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
            </div>
            <div className="ff-field">
              <label className="ff-label">Would you recommend Kreamz?</label>
              <div className="ff-recommend-row">
                {["Yes, definitely! 🥰", "Maybe 🤔", "No 😔"].map((opt, i) => (
                  <button key={opt} className={"ff-rec-btn" + (recommend === i ? " active" : "")} onClick={() => setRecommend(i)}>{opt}</button>
                ))}
              </div>
            </div>
            {error && <p className="ff-error">{error}</p>}
            <div className="ff-btn-row">
              <button className="ff-btn ff-btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="ff-btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <span className="ff-spinner" /> : "Submit Feedback 🎉"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="ff-step ff-thanks animate-scaleIn">
            <div className="ff-thanks-icon">🎊</div>
            <h2 className="ff-title">Thank you, {name || "friend"}!</h2>
            <p className="ff-subtitle">Your feedback means the world to us. We'll keep making your moments sweeter.</p>
            <div className="ff-thanks-badge"><span>⭐</span> Avg Rating: {avgRating} / 5</div>
            <button className="ff-btn" style={{ marginTop: "1.5rem" }} onClick={resetForm}>Submit Another →</button>
          </div>
        )}
      </div>
      <footer className="ff-footer">Made with 💝 by Kreamz India</footer>
    </div>
  );
}
