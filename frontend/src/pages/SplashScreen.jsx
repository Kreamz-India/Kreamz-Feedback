import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: "linear-gradient(135deg, #e91e8c 0%, #d81b60 40%, #c2185b 100%)" }}>
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-20 animate-pulse"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-15 animate-pulse"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", animationDelay: "0.7s" }} />
        <div className="absolute top-1/3 right-10 w-32 h-32 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", animation: "float 4s ease-in-out infinite" }} />
      </div>

      <div
        className="flex flex-col items-center gap-8 z-10 transition-all duration-800"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.85) translateY(40px)",
          transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Logo */}
        <div className="relative">
          <div className="w-36 h-36 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center overflow-hidden"
            style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
            <img
              src="/kreamz-logo.jpg"
              alt="Kreamz Cakes & More"
              className="w-full h-full object-contain p-1"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce text-lg">
            ✨
          </div>
        </div>

        {/* Tagline */}
        <div className="text-center">
          <p className="text-white/80 text-sm font-medium tracking-[0.35em] uppercase mt-1">
            Feedback System
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-3 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.18}s`, opacity: 0.85 }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
      `}</style>
    </div>
  );
}
