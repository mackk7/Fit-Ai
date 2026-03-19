const mongoose = require("mongoose");

const workoutLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Workout name is required"],
      trim: true,
      maxlength: [100, "Name too long"],
    },
    type: {
      type: String,
      enum: ["strength", "cardio", "hiit", "yoga", "custom"],
      default: "strength",
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    minutes: {
      type: Number,
      required: true,
      min: [1, "Duration must be at least 1 minute"],
      max: [600, "Duration cannot exceed 600 minutes"],
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    sets: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, "Notes too long"],
      default: "",
    },
  },
  { timestamps: true }
);

// Index for fast user-based queries sorted by date
workoutLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model("WorkoutLog", workoutLogSchema);
