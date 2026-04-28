import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--cream)",
      padding: "2rem",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎂</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", marginBottom: "0.5rem" }}>
        Page Not Found
      </h1>
      <p style={{ color: "var(--gray)", marginBottom: "1.5rem" }}>
        This page doesn't exist. Let's get you back.
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "0.9rem 2rem",
          background: "linear-gradient(135deg, #e91e8c, #c41674)",
          color: "white",
          border: "none",
          borderRadius: "14px",
          fontWeight: "700",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        Go to Feedback Form
      </button>
    </div>
  );
}
