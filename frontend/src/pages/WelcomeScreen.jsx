import { useEffect, useState } from "react";

export default function WelcomeScreen({ storeData, storeName, storeId, onStart, darkMode, setDarkMode }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  return (
    <div className="min-h-screen w-full flex flex-col"
      style={{ background: "linear-gradient(150deg, #e91e8c 0%, #c2185b 55%, #ad1457 100%)" }}>
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 -left-32 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, white 0%, transparent 60%)" }} />
        {/* Floating dots */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute rounded-full opacity-20"
            style={{
              width: 8 + (i % 3) * 6,
              height: 8 + (i % 3) * 6,
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 20}%`,
              background: "white",
              animation: `floatDot ${3 + i * 0.5}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.4}s`,
            }} />
        ))}
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
            <img src="/kreamz-logo.jpg" alt="Kreamz" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-white font-black text-base tracking-tight">Kreamz</span>
            <span className="text-white/60 text-xs block -mt-0.5 tracking-wider">CAKES & MORE</span>
          </div>
        </div>
        <button onClick={() => setDarkMode(!darkMode)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
          {darkMode ? "☀️" : "🌙"}
        </button>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-10 gap-7 max-w-2xl mx-auto w-full"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(32px)",
          transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}>
        {/* Logo */}
        <div className="relative">
          <div className="w-40 h-40 md:w-48 md:h-48 bg-white rounded-[2rem] overflow-hidden shadow-2xl flex items-center justify-center transition-transform duration-300"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.25)", transform: hovered ? "scale(1.04) rotate(-1deg)" : "scale(1)" }}>
            <img src="/kreamz-logo.jpg" alt="Kreamz Cakes & More" className="w-full h-full object-contain p-2" />
          </div>
          <div className="absolute -top-3 -right-3 bg-yellow-400 text-xs font-black px-3 py-1.5 rounded-full shadow-lg text-gray-800 tracking-wide">
            ✨ SHARE
          </div>
        </div>

        {/* Headline */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg tracking-tight leading-tight">
            How was your<br/>
            <span style={{ color: "#ffd6e8" }}>Kreamz experience?</span>
          </h1>
          <p className="text-white/75 text-base mt-3 font-medium">Your feedback helps us serve you sweeter! 💕</p>
        </div>

        {/* Store card — personalised */}
        <div className="w-full max-w-sm rounded-2xl px-6 py-5"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.25)" }}>
          <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-1">📍 You are visiting</p>
          <p className="text-white font-black text-xl leading-tight">{storeName}</p>
          {storeData?.city && <p className="text-white/65 text-sm mt-0.5">{storeData.city}</p>}
          {storeData?.address && (
            <p className="text-white/45 text-xs mt-2 leading-relaxed border-t border-white/15 pt-2">
              {storeData.address}
            </p>
          )}
        </div>

        {/* CTAs */}
        <div className="w-full max-w-sm flex flex-col gap-3">
          <button onClick={onStart}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-full py-4 rounded-2xl bg-white font-black text-lg shadow-2xl transition-all duration-200 active:scale-95"
            style={{ color: "#c2185b", boxShadow: "0 16px 48px rgba(0,0,0,0.2)", transform: hovered ? "scale(1.02)" : "scale(1)" }}>
            Share My Experience ✍️
          </button>
          <p className="text-white/45 text-xs text-center">Takes less than 90 seconds · 100% anonymous</p>
        </div>
      </div>

      <style>{`
        @keyframes floatDot {
          from { transform: translateY(0px) rotate(0deg); }
          to   { transform: translateY(-16px) rotate(10deg); }
        }
      `}</style>
    </div>
  );
}
