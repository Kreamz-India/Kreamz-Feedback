import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

// Simple hardcoded admin password — replace with Firebase Auth for production
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "kreamz@admin2024";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("kreamz_admin_auth", "true");
      navigate("/admin");
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  }

  return (
    <div className="al-bg">
      <div className="al-card animate-scaleIn">
        <div className="al-icon">🍰</div>
        <h1 className="al-title">Admin Access</h1>
        <p className="al-subtitle">Kreamz Dashboard</p>

        <form onSubmit={handleLogin} className="al-form">
          <input
            className="al-input"
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="al-error">{error}</p>}
          <button className="al-btn" type="submit">
            Login →
          </button>
        </form>
      </div>
    </div>
  );
}
