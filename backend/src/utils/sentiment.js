// ============================================================
// KEYWORD-BASED SENTIMENT & PRIORITY DETECTION
// ============================================================

const POSITIVE_WORDS = [
  "amazing", "excellent", "wonderful", "fantastic", "great", "love", "loved",
  "perfect", "best", "delicious", "outstanding", "superb", "brilliant", "awesome",
  "friendly", "helpful", "clean", "fresh", "tasty", "yummy", "beautiful",
  "stunning", "gorgeous", "recommend", "happy", "satisfied", "impressed",
  "exceptional", "incredible", "fabulous", "pleasant", "enjoyable", "nice",
  "good", "lovely", "warm", "welcoming", "quick", "fast", "efficient", "polite"
];

const NEGATIVE_WORDS = [
  "bad", "terrible", "awful", "horrible", "worst", "poor", "disgusting",
  "dirty", "rude", "slow", "cold", "stale", "overpriced", "expensive",
  "disappointing", "disappointed", "unacceptable", "unprofessional", "wrong",
  "late", "wait", "waiting", "ignored", "waste", "never", "complaint",
  "issue", "problem", "broken", "unhygienic", "unclean", "cockroach", "bug",
  "hair", "flies", "smell", "smell", "tasteless", "bland", "soggy",
  "undercooked", "raw", "burnt", "hard", "stiff", "dry", "chewy"
];

const HIGH_PRIORITY_WORDS = [
  "sick", "ill", "food poisoning", "vomit", "vomiting", "diarrhea",
  "cockroach", "rat", "mouse", "pest", "foreign object", "glass", "plastic",
  "unsafe", "dangerous", "injury", "hurt", "fire", "emergency",
  "never coming back", "legal", "lawsuit", "health department", "report",
  "absolutely worst", "disgusting", "outrageous", "unacceptable", "refund",
  "horrible experience", "terrible experience"
];

/**
 * Detect sentiment from text + emotion score + tags
 */
export function detectSentiment(text = "", emotionScore = 3, tags = []) {
  const combined = `${text} ${tags.join(" ")}`.toLowerCase();

  // Score-based base
  if (emotionScore >= 5) return "positive";
  if (emotionScore <= 2) return "negative";

  // Keyword analysis
  let posScore = 0;
  let negScore = 0;

  POSITIVE_WORDS.forEach(w => { if (combined.includes(w)) posScore++; });
  NEGATIVE_WORDS.forEach(w => { if (combined.includes(w)) negScore++; });

  if (posScore > negScore) return "positive";
  if (negScore > posScore) return "negative";

  // Emotion score tiebreaker
  if (emotionScore >= 4) return "positive";
  if (emotionScore <= 2) return "negative";
  return "neutral";
}

/**
 * Assign priority based on content + emotion score
 */
export function detectPriority(text = "", emotionScore = 3, sentiment = "neutral") {
  const combined = text.toLowerCase();

  // High priority: urgent keywords or very low score
  for (const phrase of HIGH_PRIORITY_WORDS) {
    if (combined.includes(phrase)) return "high";
  }

  if (emotionScore === 1) return "high";
  if (sentiment === "negative" && emotionScore <= 2) return "high";

  // Medium priority: negative sentiment
  if (sentiment === "negative") return "medium";
  if (emotionScore === 2) return "medium";

  return "low";
}
