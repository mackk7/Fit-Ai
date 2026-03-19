const express = require("express");
const WorkoutLog = require("../models/WorkoutLog");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes below require authentication
router.use(protect);

// ── GET /api/logs ─────────────────────────────────────────────────
// Get all workout logs for the logged-in user
router.get("/", async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(100);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs." });
  }
});

// ── POST /api/logs ────────────────────────────────────────────────
// Add a new workout log entry
router.post("/", async (req, res) => {
  const { name, type, date, minutes, calories, sets, notes } = req.body;

  if (!name || !minutes || !calories) {
    return res.status(400).json({ error: "name, minutes, and calories are required." });
  }

  try {
    const log = await WorkoutLog.create({
      user: req.user._id,
      name, type, date, minutes, calories, sets, notes,
    });

    // Update user streak
    await updateStreak(req.user._id, date || new Date());

    res.status(201).json({ log });
  } catch (err) {
    console.error("Log create error:", err.message);
    res.status(500).json({ error: "Failed to save workout log." });
  }
});

// ── PATCH /api/logs/:id ───────────────────────────────────────────
// Update a workout log entry (only owner can update)
router.patch("/:id", async (req, res) => {
  try {
    const log = await WorkoutLog.findOne({ _id: req.params.id, user: req.user._id });
    if (!log) {
      return res.status(404).json({ error: "Log not found." });
    }

    const { name, type, date, minutes, calories, sets, notes } = req.body;
    if (name)     log.name = name;
    if (type)     log.type = type;
    if (date)     log.date = date;
    if (minutes)  log.minutes = minutes;
    if (calories) log.calories = calories;
    if (sets !== undefined) log.sets = sets;
    if (notes !== undefined) log.notes = notes;

    await log.save();
    res.json({ log });
  } catch (err) {
    res.status(500).json({ error: "Failed to update log." });
  }
});

// ── DELETE /api/logs/:id ──────────────────────────────────────────
// Delete a workout log entry (only owner can delete)
router.delete("/:id", async (req, res) => {
  try {
    const log = await WorkoutLog.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!log) {
      return res.status(404).json({ error: "Log not found." });
    }
    res.json({ message: "Log deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete log." });
  }
});

// ── GET /api/logs/stats ───────────────────────────────────────────
// Get summary stats for the logged-in user
router.get("/stats", async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ user: req.user._id });

    const totalSessions  = logs.length;
    const totalCalories  = logs.reduce((s, l) => s + l.calories, 0);
    const totalMinutes   = logs.reduce((s, l) => s + l.minutes, 0);
    const avgCalories    = totalSessions ? Math.round(totalCalories / totalSessions) : 0;

    // This week's logs
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyLogs = logs.filter(l => new Date(l.date) >= weekAgo);
    const weeklyCalories = weeklyLogs.reduce((s, l) => s + l.calories, 0);

    res.json({
      totalSessions,
      totalCalories,
      totalMinutes,
      avgCalories,
      weeklySessions: weeklyLogs.length,
      weeklyCalories,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats." });
  }
});

// ── Helper: update streak ─────────────────────────────────────────
async function updateStreak(userId, workoutDate) {
  try {
    const user = await User.findById(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDate = user.lastWorkoutDate ? new Date(user.lastWorkoutDate) : null;
    if (lastDate) lastDate.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (!lastDate || lastDate < yesterday) {
      // Streak broken or first workout
      user.streak = 1;
    } else if (lastDate.getTime() === yesterday.getTime()) {
      // Worked out yesterday — extend streak
      user.streak += 1;
    }
    // If lastDate === today, streak stays the same (already counted)

    user.lastWorkoutDate = workoutDate;
    await user.save();
  } catch (err) {
    console.error("Streak update error:", err.message);
  }
}

module.exports = router;
