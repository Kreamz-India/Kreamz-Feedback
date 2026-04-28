import { Routes, Route, Navigate } from "react-router-dom";
import FeedbackFlow from "./pages/FeedbackFlow";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      {/* Customer-facing feedback form */}
      <Route path="/" element={<FeedbackFlow />} />
      <Route path="/feedback" element={<FeedbackFlow />} />

      {/* Admin section */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
