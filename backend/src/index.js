import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import feedbackRoutes from "./routes/feedback.js";
import storeRoutes from "./routes/stores.js";

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:5173",
    /\.vercel\.app$/,
    /kreamz/i,
  ],
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);

app.get("/", (req, res) => res.json({
  status: "ok",
  service: "Kreamz Feedback API",
  version: "2.0.0",
  timestamp: new Date().toISOString(),
}));
app.get("/health", (req, res) => res.json({ status: "healthy" }));

app.use("/feedback", feedbackRoutes);
app.use("/stores", storeRoutes);

app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) { console.error("❌ MONGODB_URI not set"); process.exit(1); }
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`🚀 Kreamz API running on http://localhost:${PORT}`);
      console.log(`📲 Stores API: http://localhost:${PORT}/stores`);
      console.log(`📲 QR API:     http://localhost:${PORT}/stores/qr`);
    });
  } catch (err) {
    console.error("❌ Failed to connect:", err.message);
    process.exit(1);
  }
}

start();
