import { useState, useEffect } from "react";
import SplashScreen from "./pages/SplashScreen";
import WelcomeScreen from "./pages/WelcomeScreen";
import FeedbackFlow from "./pages/FeedbackFlow";
import ThankYouScreen from "./pages/ThankYouScreen";
import AdminDashboard from "./pages/AdminDashboard";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [screen, setScreen] = useState("splash");
  const [storeId, setStoreId] = useState("");
  const [storeData, setStoreData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
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
      return;
    }
    const timer = setTimeout(() => setScreen("welcome"), 2200);
    return () => clearTimeout(timer);
  }, []);

  // Resolve store data from backend list
  useEffect(() => {
    if (allStores.length > 0 && storeId) {
      const found = allStores.find(s => s.id === storeId);
      setStoreData(found || { id: storeId, name: storeId, city: "", address: "" });
    }
  }, [allStores, storeId]);

  const storeName = storeData?.name || storeId || "Kreamz Store";

  const handleStart    = () => setScreen("feedback");
  const handleComplete = (data) => { setFeedbackData(data); setScreen("thankyou"); };
  const handleRestart  = () => setScreen("welcome");

  if (screen === "admin") {
    return <AdminDashboard darkMode={darkMode} setDarkMode={setDarkMode} allStores={allStores} />;
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen font-sans transition-colors duration-300 dark:bg-gray-950">
        {screen === "splash"   && <SplashScreen />}
        {screen === "welcome"  && (
          <WelcomeScreen storeData={storeData} storeName={storeName} storeId={storeId}
            onStart={handleStart} darkMode={darkMode} setDarkMode={setDarkMode} />
        )}
        {screen === "feedback" && (
          <FeedbackFlow storeData={storeData} storeName={storeName} storeId={storeId}
            onComplete={handleComplete} darkMode={darkMode} setDarkMode={setDarkMode} />
        )}
        {screen === "thankyou" && (
          <ThankYouScreen onRestart={handleRestart} storeName={storeName} storeData={storeData} />
        )}
      </div>
    </div>
  );
}

export default App;
