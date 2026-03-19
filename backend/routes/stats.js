const express = require("express");
const WorkoutLog = require("../models/WorkoutLog");
const Goal = require("../models/Goal");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

// Helper — get or create user goals
async function getUserGoals(userId) {
  let goals = await Goal.findOne({ user: userId });
  if (!goals) goals = await Goal.create({ user: userId });
  return goals;
}

// Helper — get date string in YYYY-MM-DD using LOCAL date (no UTC shift)
function toDateStr(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Helper — today's date string
function todayStr() {
  return toDateStr(new Date());
}

// Helper — calculate streak from sorted unique day strings (newest first)
function calcStreak(uniqueDays) {
  if (!uniqueDays.length) return 0;

  const today = todayStr();
  const yesterday = toDateStr(new Date(Date.now() - 86400000));

  // streak only counts if worked out today or yesterday
  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;

  let streak = 0;
  let expected = uniqueDays[0] === today ? today : yesterday;

  for (const day of uniqueDays) {
    if (day === expected) {
      streak++;
      // move expected back one day
      const prev = new Date(expected + "T12:00:00");
      prev.setDate(prev.getDate() - 1);
      expected = toDateStr(prev);
    } else if (day < expected) {
      // gap found — stop
      break;
    }
  }
  return streak;
}

// ── GET /api/stats/dashboard ──────────────────────────────────────
router.get("/dashboard", async (req, res) => {
  try {
    const [logs, goals] = await Promise.all([
      WorkoutLog.find({ user: req.user._id }).sort({ date: -1 }),
      getUserGoals(req.user._id),
    ]);

    // ── Streak ────────────────────────────────────────────────────
    const uniqueDays = [...new Set(logs.map(l => toDateStr(l.date)))]
      .sort((a, b) => (a > b ? -1 : 1)); // newest first
    const streak = calcStreak(uniqueDays);

    // ── This week (Mon–today) ─────────────────────────────────────
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const daysFromMon = (dayOfWeek + 6) % 7;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysFromMon);
    weekStart.setHours(0, 0, 0, 0);

    const weekLogs = logs.filter(l => new Date(l.date) >= weekStart);
    const weeklyCalories = weekLogs.reduce((s, l) => s + l.calories, 0);

    // ── This month ────────────────────────────────────────────────
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthLogs      = logs.filter(l => new Date(l.date) >= monthStart);
    const monthlyMinutes = monthLogs.reduce((s, l) => s + l.minutes, 0);
    const monthlyCalories= monthLogs.reduce((s, l) => s + l.calories, 0);

    const monthlyProgress = goals.monthlySessions > 0
      ? Math.min(100, Math.round((monthLogs.length / goals.monthlySessions) * 100))
      : 0;

    // ── Weekly activity bars (last 7 days including today) ────────
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = toDateStr(d);
      const dayLogs = logs.filter(l => toDateStr(l.date) === dayStr);
      weeklyActivity.push({
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()],
        date: dayStr,
        minutes:  dayLogs.reduce((s, l) => s + l.minutes, 0),
        calories: dayLogs.reduce((s, l) => s + l.calories, 0),
        count: dayLogs.length,
      });
    }

    res.json({
      streak,
      weeklySessions:      weekLogs.length,
      weeklyCalories,
      weeklyTarget:        goals.weeklySessions,
      monthlyProgress,
      monthlyTarget:       goals.monthlySessions,
      monthlySessions:     monthLogs.length,
      monthlyMinutes,
      monthlyCalories,
      monthCaloriesTarget: goals.monthlyCalories,
      totalSessions:       logs.length,
      weeklyActivity,
      recentWorkouts: logs.slice(0, 3).map(l => ({
        _id: l._id, name: l.name, type: l.type,
        date: l.date, minutes: l.minutes, calories: l.calories,
      })),
      goal: req.user.goal || "General Fitness",
    });
  } catch (err) {
    console.error("Stats error:", err.message);
    res.status(500).json({ error: "Failed to fetch dashboard stats." });
  }
});

// ── GET /api/stats/progress ───────────────────────────────────────
router.get("/progress", async (req, res) => {
  try {
    const [logs, goals] = await Promise.all([
      WorkoutLog.find({ user: req.user._id }).sort({ date: -1 }),
      getUserGoals(req.user._id),
    ]);

    // Type split
    const typeCounts = { strength: 0, cardio: 0, hiit: 0, yoga: 0, custom: 0 };
    logs.forEach(l => { if (typeCounts[l.type] !== undefined) typeCounts[l.type]++; });
    const total = logs.length || 1;
    const typeSplit = Object.entries(typeCounts)
      .filter(([, v]) => v > 0)
      .map(([type, count]) => ({
        type, count,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    // 8-week calorie trend
    const weeklyTrend = [];
    for (let i = 7; i >= 0; i--) {
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      end.setHours(23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      const wLogs = logs.filter(l => {
        const d = new Date(l.date);
        return d >= start && d <= end;
      });
      weeklyTrend.push({
        week: `W${8 - i}`,
        calories: wLogs.reduce((s, l) => s + l.calories, 0),
        sessions: wLogs.length,
        minutes:  wLogs.reduce((s, l) => s + l.minutes, 0),
      });
    }

    // Monthly goals using user's targets
    const now = new Date();
    const monthStart    = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthLogs     = logs.filter(l => new Date(l.date) >= monthStart);
    const monthMinutes  = monthLogs.reduce((s, l) => s + l.minutes, 0);
    const monthCalories = monthLogs.reduce((s, l) => s + l.calories, 0);

    const monthlyGoals = [
      {
        label: "Workouts",
        value: monthLogs.length,
        target: goals.monthlySessions,
        unit: "sessions",
        pct: Math.min(100, Math.round((monthLogs.length / (goals.monthlySessions || 1)) * 100)),
      },
      {
        label: "Active Time",
        value: monthMinutes,
        target: goals.monthlyMinutes,
        unit: "min",
        pct: Math.min(100, Math.round((monthMinutes / (goals.monthlyMinutes || 1)) * 100)),
      },
      {
        label: "Calories",
        value: monthCalories,
        target: goals.monthlyCalories,
        unit: "kcal",
        pct: Math.min(100, Math.round((monthCalories / (goals.monthlyCalories || 1)) * 100)),
      },
    ];

    const allTimeMinutes  = logs.reduce((s, l) => s + l.minutes, 0);
    const allTimeCalories = logs.reduce((s, l) => s + l.calories, 0);

    res.json({
      typeSplit,
      weeklyTrend,
      monthlyGoals,
      goals: {
        monthlySessions: goals.monthlySessions,
        monthlyMinutes:  goals.monthlyMinutes,
        monthlyCalories: goals.monthlyCalories,
        weeklySessions:  goals.weeklySessions,
        customNote:      goals.customNote,
      },
      allTime: {
        sessions: logs.length,
        minutes:  allTimeMinutes,
        calories: allTimeCalories,
        hours:    Math.floor(allTimeMinutes / 60),
      },
      fitnessLevel: req.user.fitnessLevel || "beginner",
      goal: req.user.goal || "General Fitness",
    });
  } catch (err) {
    console.error("Progress stats error:", err.message);
    res.status(500).json({ error: "Failed to fetch progress data." });
  }
});

module.exports = router;
