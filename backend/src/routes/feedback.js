import express from "express";
import Feedback from "../models/Feedback.js";
import { detectSentiment, detectPriority } from "../utils/sentiment.js";
import { resolveStoreName, getAllStores } from "../utils/stores.js";
import { adminAuth } from "../middleware/auth.js";

const router = express.Router();

// ── POST /feedback ────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const {
      storeId, storeName, emotionScore, categoryRatings,
      feedbackText, tags, name, phone, oneTap,
    } = req.body;

    if (!storeId) return res.status(400).json({ error: "storeId is required" });
    if (!emotionScore || emotionScore < 1 || emotionScore > 6) {
      return res.status(400).json({ error: "emotionScore must be 1–6" });
    }

    const sentiment = detectSentiment(feedbackText || "", emotionScore, tags || []);
    const priority  = detectPriority(feedbackText || "", emotionScore, sentiment);

    const feedback = new Feedback({
      storeId:         storeId.toLowerCase().trim(),
      storeName:       storeName || resolveStoreName(storeId),
      emotionScore:    Number(emotionScore),
      categoryRatings: categoryRatings || {},
      feedbackText:    feedbackText?.trim() || "",
      tags:            tags || [],
      name:            name?.trim() || undefined,
      phone:           phone?.trim() || undefined,
      sentiment, priority,
      oneTap:          Boolean(oneTap),
      userAgent:       req.headers["user-agent"]?.substring(0, 200),
      ip:              req.ip,
    });

    await feedback.save();
    res.status(201).json({ success: true, id: feedback._id, sentiment, priority });
  } catch (err) {
    console.error("POST /feedback error:", err);
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

// ── GET /feedback ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { store, sentiment, priority, status, page = 1, limit = 100, search } = req.query;
    const query = {};
    if (store && store !== "all")         query.storeId   = store.toLowerCase();
    if (sentiment && sentiment !== "all") query.sentiment = sentiment;
    if (priority  && priority  !== "all") query.priority  = priority;
    if (status    && status    !== "all") query.status    = status;
    if (search) {
      query.$or = [
        { feedbackText: { $regex: search, $options: "i" } },
        { storeName:    { $regex: search, $options: "i" } },
        { name:         { $regex: search, $options: "i" } },
        { tags:         { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [feedbacks, total] = await Promise.all([
      Feedback.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Feedback.countDocuments(query),
    ]);
    res.json({ feedbacks, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error("GET /feedback error:", err);
    res.status(500).json({ error: "Failed to fetch feedbacks" });
  }
});

// ── GET /feedback/stats ───────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const { store } = req.query;
    const match = store && store !== "all" ? { storeId: store.toLowerCase() } : {};

    const [totals, byStore, bySentiment, byRating, dailyTrend, allKeywords] = await Promise.all([
      Feedback.aggregate([
        { $match: match },
        { $group: { _id: null, count: { $sum: 1 }, avgScore: { $avg: "$emotionScore" } } },
      ]),
      Feedback.aggregate([
        { $group: {
          _id: "$storeId",
          storeName: { $first: "$storeName" },
          count: { $sum: 1 },
          avgScore: { $avg: "$emotionScore" },
          negCount: { $sum: { $cond: [{ $eq: ["$sentiment", "negative"] }, 1, 0] } },
        }},
        { $sort: { count: -1 } },
      ]),
      Feedback.aggregate([
        { $match: match },
        { $group: { _id: "$sentiment", count: { $sum: 1 } } },
      ]),
      Feedback.aggregate([
        { $match: match },
        { $group: { _id: "$emotionScore", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      // Daily trend – last 30 days
      Feedback.aggregate([
        { $match: { ...match, createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } } },
        { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          avgScore: { $avg: "$emotionScore" },
        }},
        { $sort: { _id: 1 } },
      ]),
      // Top complaint keywords from tags
      Feedback.aggregate([
        { $match: { ...match, sentiment: "negative" } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const total   = totals[0]?.count || 0;
    const avgScore = totals[0]?.avgScore?.toFixed(2) || 0;

    const sentMap = Object.fromEntries(bySentiment.map(s => [s._id, s.count]));
    const posCount = sentMap.positive || 0;
    const negCount = sentMap.negative || 0;
    const neuCount = sentMap.neutral  || 0;

    // Worst performing stores (min 3 feedbacks, lowest avg)
    const worstStores = byStore
      .filter(s => s.count >= 3)
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 5);

    res.json({
      total, avgScore,
      sentiment: {
        positive: posCount,
        negative: negCount,
        neutral:  neuCount,
        positivePct: total ? ((posCount / total) * 100).toFixed(1) : 0,
        negativePct: total ? ((negCount / total) * 100).toFixed(1) : 0,
        neutralPct:  total ? ((neuCount  / total) * 100).toFixed(1) : 0,
      },
      byStore,
      byRating,
      dailyTrend,
      worstStores,
      topComplaintKeywords: allKeywords.map(k => ({ keyword: k._id, count: k.count })),
    });
  } catch (err) {
    console.error("GET /feedback/stats error:", err);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// ── PATCH /feedback/:id ── (admin protected) ──────────────────
router.patch("/:id", adminAuth, async (req, res) => {
  try {
    const { status, notes, assignedTo } = req.body;
    const updates = {};
    if (status     !== undefined) updates.status     = status;
    if (notes      !== undefined) updates.notes      = notes;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id, { $set: updates }, { new: true }
    );
    if (!feedback) return res.status(404).json({ error: "Feedback not found" });
    res.json({ success: true, feedback });
  } catch (err) {
    console.error("PATCH /feedback/:id error:", err);
    res.status(500).json({ error: "Failed to update feedback" });
  }
});

// ── DELETE /feedback/:id ── (admin protected) ─────────────────
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ error: "Feedback not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /feedback/:id error:", err);
    res.status(500).json({ error: "Failed to delete feedback" });
  }
});

export default router;
