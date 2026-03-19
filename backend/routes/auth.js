const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Helper to sign JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── POST /api/auth/register ───────────────────────────────────────
router.post("/register", async (req, res) => {
  const { name, email, password, goal, fitnessLevel } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required." });
  }

  try {
    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const user = await User.create({ name, email, password, goal, fitnessLevel });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        goal: user.goal,
        fitnessLevel: user.fitnessLevel,
        streak: user.streak,
      },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(". ") });
    }
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // Explicitly select password since it's hidden by default
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        goal: user.goal,
        fitnessLevel: user.fitnessLevel,
        streak: user.streak,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      goal: req.user.goal,
      fitnessLevel: req.user.fitnessLevel,
      streak: req.user.streak,
    },
  });
});

// ── PATCH /api/auth/profile ───────────────────────────────────────
router.patch("/profile", protect, async (req, res) => {
  const { name, goal, fitnessLevel } = req.body;
  try {
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, goal, fitnessLevel },
      { new: true, runValidators: true }
    );
    res.json({
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        goal: updated.goal,
        fitnessLevel: updated.fitnessLevel,
        streak: updated.streak,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Profile update failed." });
  }
});

module.exports = router;
