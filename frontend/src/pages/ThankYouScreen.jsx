import { useEffect, useState } from "react";

export default function ThankYouScreen({ onRestart, storeName }) {
  const [show, setShow] = useState(false);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    setTimeout(() => setShow(true), 80);
    setConfetti(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 2 + Math.random() * 1.5,
        color: ["#e91e8c","#f48fb1","#ffd6e8","#ffffff","#ffc107","#26c6da"][i % 6],
        size: 7 + Math.random() * 7,
      }))
    );
  }, []);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ background: "linear-gradient(150deg, #e91e8c 0%, #c2185b 55%, #ad1457 100%)" }}
    >
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {confetti.map(p => (
          <div
            key={p.id}
            className="absolute rounded-sm"
            style={{
              left: `${p.left}%`,
              top: "-12px",
              width: p.size,
              height: p.size,
              background: p.color,
              animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        className="flex flex-col items-center gap-8 text-center max-w-sm w-full z-10"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? "scale(1) translateY(0)" : "scale(0.85) translateY(30px)",
          transition: "all 0.65s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Logo + check */}
        <div className="relative">
          <div
            className="w-32 h-32 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center overflow-hidden"
            style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}
          >
            <img src="/kreamz-logo.jpg" alt="Kreamz" className="w-full h-full object-contain p-2" />
          </div>
          <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-2xl shadow-xl border-4 border-white">
            ✓
          </div>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-5xl font-black text-white mb-3">Thank You 🙏</h1>
          <p className="text-white/80 text-lg font-medium">
            Your feedback has been received.
          </p>
          <p className="text-white/60 text-base mt-2">
            It helps <strong className="text-white">{storeName}</strong> serve you better!
          </p>
        </div>

        {/* Emojis */}
        <div className="flex gap-3">
          {["🍰","🧁","🎂","🍩","🍫"].map((e, i) => (
            <span
              key={i}
              className="text-3xl animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {e}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onRestart}
          className="w-full py-5 rounded-2xl bg-white font-black text-xl shadow-2xl transition-all active:scale-95 hover:scale-[1.02]"
          style={{ color: "#c2185b" }}
        >
          Visit Again 🎂
        </button>
      </div>

      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
