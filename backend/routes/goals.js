const express = require("express");
const Goal = require("../models/Goal");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

// ── GET /api/goals ────────────────────────────────────────────────
// Get user's goals — creates default if none exist yet
router.get("/", async (req, res) => {
  try {
    let goals = await Goal.findOne({ user: req.user._id });
    if (!goals) {
      // First time — create defaults
      goals = await Goal.create({ user: req.user._id });
    }
    res.json({ goals });
  } catch (err) {
    console.error("Goals fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch goals." });
  }
});

// ── PUT /api/goals ────────────────────────────────────────────────
// Save / update user's goals (upsert)
router.put("/", async (req, res) => {
  const { monthlySessions, monthlyMinutes, monthlyCalories, weeklySessions, customNote } = req.body;

  // Basic validation
  if (
    monthlySessions < 1 || monthlySessions > 200 ||
    monthlyMinutes  < 10 || monthlyMinutes > 50000 ||
    monthlyCalories < 100 || monthlyCalories > 500000 ||
    weeklySessions  < 1 || weeklySessions > 30
  ) {
    return res.status(400).json({ error: "One or more values are out of allowed range." });
  }

  try {
    const goals = await Goal.findOneAndUpdate(
      { user: req.user._id },
      { monthlySessions, monthlyMinutes, monthlyCalories, weeklySessions, customNote },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ goals, message: "Goals saved successfully!" });
  } catch (err) {
    console.error("Goals save error:", err.message);
    res.status(500).json({ error: "Failed to save goals." });
  }
});

module.exports = router;
