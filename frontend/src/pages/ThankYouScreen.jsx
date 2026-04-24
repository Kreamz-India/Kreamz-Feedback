import { useEffect, useState } from "react";

export default function ThankYouScreen({ onRestart, storeName }) {
  const [show, setShow] = useState(false);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
    // Generate confetti pieces
    const pieces = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 2,
      color: ["#e91e8c", "#f48fb1", "#ffd6e8", "#ffffff", "#ffc107", "#26c6da"][i % 6],
      size: 6 + Math.random() * 8,
    }));
    setConfetti(pieces);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ background: "linear-gradient(150deg, #e91e8c 0%, #c2185b 55%, #ad1457 100%)" }}>
      
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {confetti.map(p => (
          <div key={p.id} className="absolute rounded-sm"
            style={{
              left: `${p.left}%`,
              top: "-10px",
              width: p.size,
              height: p.size,
              background: p.color,
              animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>

      <div
        className="flex flex-col items-center gap-7 text-center max-w-sm w-full z-10"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? "scale(1) translateY(0)" : "scale(0.8) translateY(30px)",
          transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Logo + check */}
        <div className="relative">
          <div className="w-36 h-36 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center overflow-hidden"
            style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
            <img src="/kreamz-logo.jpg" alt="Kreamz" className="w-full h-full object-contain p-2" />
          </div>
          <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-xl shadow-xl border-4 border-white">
            ✓
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-black text-white drop-shadow-lg mb-2">Thank You!</h1>
          <p className="text-white/80 text-lg font-medium">Your feedback has been received</p>
        </div>

        <div className="w-full rounded-2xl px-6 py-4"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.25)" }}>
          <p className="text-white text-sm leading-relaxed">
            💕 We appreciate your time. Your feedback helps <strong>Kreamz {storeName}</strong> bake happiness every single day.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-white/65 text-xs">Sweet treats await on your next visit! 🎂</p>
          <div className="flex gap-2">
            {["🍰","🧁","🎂","🍩","🍫"].map((e, i) => (
              <span key={i} className="text-2xl animate-bounce" style={{ animationDelay: `${i * 0.12}s` }}>{e}</span>
            ))}
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-4 rounded-2xl bg-white font-black text-lg shadow-2xl transition-all active:scale-95 hover:scale-[1.02]"
          style={{ color: "#c2185b" }}
        >
          Give Another Feedback
        </button>
      </div>

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
