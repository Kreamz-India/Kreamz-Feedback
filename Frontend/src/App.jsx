import { Routes, Route } from "react-router-dom";
import FeedbackForm from "./pages/FeedbackForm.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<FeedbackForm />} />
      <Route path="/feedback" element={<FeedbackForm />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/login" element={<AdminDashboard />} />
      <Route path="*" element={<FeedbackForm />} />
    </Routes>
  );
}
