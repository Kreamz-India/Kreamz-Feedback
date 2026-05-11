import mongoose from "mongoose";

const categoryRatingsSchema = new mongoose.Schema({
  service_staff: { type: Number, min: 1, max: 5 },
  staff_warmth:  { type: Number, min: 1, max: 5 },
  cake_quality:  { type: Number, min: 1, max: 5 },
  beverages:     { type: Number, min: 1, max: 5 },
  ambience:      { type: Number, min: 1, max: 5 },
  cleanliness:   { type: Number, min: 1, max: 5 },
  packaging:     { type: Number, min: 1, max: 5 },
  value:         { type: Number, min: 1, max: 5 },
}, { _id: false });

const feedbackSchema = new mongoose.Schema({
  // Store identification
  storeId:   { type: String, required: true, index: true },
  storeName: { type: String, required: true },

  // Core feedback
  emotionScore:    { type: Number, required: true, min: 1, max: 6 }, // 1=Very Bad, 6=Amazing
  categoryRatings: { type: categoryRatingsSchema, default: {} },
  feedbackText:    { type: String, maxlength: 1000 },
  tags:            { type: [String], default: [] },

  // Auto-detected
  sentiment: {
    type: String,
    enum: ["positive", "neutral", "negative"],
    default: "neutral",
    index: true,
  },
  priority: {
    type: String,
    enum: ["high", "medium", "low"],
    default: "low",
    index: true,
  },

  // Contact (optional, anonymous by default)
  name:  { type: String },
  phone: { type: String },

  // Workflow
  status:     { type: String, enum: ["open", "in_progress", "resolved"], default: "open", index: true },
  assignedTo: { type: String },
  notes:      { type: String },

  // Metadata
  oneTap:    { type: Boolean, default: false },
  userAgent: { type: String },
  ip:        { type: String },
}, {
  timestamps: true,
});

// Compound index for store+date queries
feedbackSchema.index({ storeId: 1, createdAt: -1 });
feedbackSchema.index({ createdAt: -1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
