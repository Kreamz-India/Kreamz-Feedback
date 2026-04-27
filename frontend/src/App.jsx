const isAdmin = window.location.pathname.includes("admin");
import { useState, useEffect } from "react";
import FeedbackFlow from "./pages/FeedbackFlow";
import ThankYouScreen from "./pages/ThankYouScreen";
import AdminDashboard from "./pages/AdminDashboard";

const API_BASE = "https://kreamz-backend.onrender.com";

function App() {
  const [screen, setScreen]     = useState("feedback");
  const [storeId, setStoreId]   = useState("");
  const [storeData, setStoreData] = useState(null);
  const [allStores, setAllStores] = useState([]);

  // Fetch stores from backend (Excel-driven)
  useEffect(() => {
    fetch(`${API_BASE}/stores`)
      .then(r => r.json())
      .then(d => setAllStores(d.stores || []))
      .catch(() => setAllStores([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("store") || "demo";
    setStoreId(sid);

    if (params.get("admin") === "true" || window.location.pathname === "/admin") {
      setScreen("admin");
    }
    // No splash/welcome — go straight to feedback
  }, []);

  // Resolve store data from backend list
  useEffect(() => {
    if (allStores.length > 0 && storeId) {
      const found = allStores.find(s => s.id === storeId);
      setStoreData(found || { id: storeId, name: storeId, city: "", address: "" });
    }
  }, [allStores, storeId]);

  const storeName = storeData?.name || storeId || "Kreamz Store";

  const handleComplete = () => setScreen("thankyou");
  const handleRestart  = () => setScreen("feedback");

  if (isAdmin) {
  return <AdminDashboard allStores={allStores} />;
}
  }

  return (
    <div className="min-h-screen font-sans">
      {screen === "feedback" && (
        <FeedbackFlow
          storeData={storeData}
          storeName={storeName}
          storeId={storeId}
          onComplete={handleComplete}
        />
      )}
      {screen === "thankyou" && (
        <ThankYouScreen onRestart={handleRestart} storeName={storeName} />
      )}
    </div>
  );
}

export default App;
