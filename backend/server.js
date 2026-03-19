require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const Groq = require("groq-sdk");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Groq Client ──────────────────────────────────────────────────
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

// ─── MongoDB Connection ───────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ─── Middleware ───────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10kb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// ─── System Prompt ────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are FitAI, an expert personal fitness coach and sports nutritionist with 15 years of experience. You help users with:
- Personalized workout programs (strength, cardio, HIIT, yoga)
- Nutrition plans and meal timing
- Recovery strategies and injury prevention
- Motivation and habit building

Guidelines:
- Be warm, encouraging, and specific
- Give concrete advice: exact exercises, sets, reps, weights, macros
- Keep responses focused and actionable (3-5 paragraphs max)
- Do not use markdown headers or bullet point symbols; write in clear plain paragraphs only`;

// ─── Auth & Log Routes ────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/logs", require("./routes/logs"));
app.use("/api/chat-history", require("./routes/chatHistory"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/goals", require("./routes/goals"));

// ─── Health Check ─────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "FitAI API running",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// ─── AI Chat ──────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array is required." });
  }
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.slice(-10).map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      ],
      max_tokens: 700,
      temperature: 0.7,
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error("Groq Error:", err.message);
    res.status(500).json({ error: "AI service temporarily unavailable." });
  }
});

// ─── Workout Plan ─────────────────────────────────────────────────
app.post("/api/workout-plan", async (req, res) => {
  const { goal, level, days, equipment } = req.body;
  if (!goal || !level || !days) {
    return res.status(400).json({ error: "goal, level, and days are required." });
  }
  try {
    const prompt = `Create a ${days}-day per week workout plan for someone with the goal of "${goal}", fitness level "${level}", and access to: ${equipment || "full gym equipment"}.

Format each training day exactly like this:
DAY [number]: [Day Name]
Focus: [muscle group or type]
Exercises: [list 4-5 exercises with sets x reps]
Duration: [estimated time in minutes]
Notes: [one useful tip]

Add a rest day recommendation at the end. Be specific, professional, and encouraging.`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.6,
    });
    res.json({ plan: completion.choices[0].message.content });
  } catch (err) {
    console.error("Groq Error:", err.message);
    res.status(500).json({ error: "Failed to generate workout plan." });
  }
});

// ─── Nutrition Calculator ─────────────────────────────────────────
app.post("/api/nutrition", async (req, res) => {
  const { weight, height, age, gender, activityLevel, goal } = req.body;
  if (!weight || !height || !age || !gender || !activityLevel || !goal) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    const prompt = `Calculate personalized nutrition targets for this person:
Weight: ${weight}kg, Height: ${height}cm, Age: ${age}, Gender: ${gender}
Activity Level: ${activityLevel}, Goal: ${goal}

Provide in clear paragraphs (no bullet symbols):
1. BMR with calculation shown
2. TDEE based on activity level
3. Recommended daily calories for their goal
4. Daily protein in grams and why
5. Daily carbohydrates in grams
6. Daily fats in grams
7. A practical meal timing strategy in 2-3 sentences`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 700,
      temperature: 0.3,
    });
    res.json({ nutrition: completion.choices[0].message.content });
  } catch (err) {
    console.error("Groq Error:", err.message);
    res.status(500).json({ error: "Failed to calculate nutrition." });
  }
});

// ─── Start Server ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ FitAI backend running on http://localhost:${PORT}`);
  console.log(`   Groq Key:   ${process.env.GROQ_API_KEY ? "✅ loaded" : "❌ MISSING"}`);
  console.log(`   MongoDB:    ${process.env.MONGODB_URI ? "✅ URI loaded" : "❌ MISSING"}`);
  console.log(`   JWT Secret: ${process.env.JWT_SECRET ? "✅ loaded" : "❌ MISSING"}\n`);
});

module.exports = app;
