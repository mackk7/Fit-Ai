const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one goals doc per user
    },
    // Monthly targets
    monthlySessions: { type: Number, default: 20, min: 1, max: 200 },
    monthlyMinutes:  { type: Number, default: 1200, min: 10, max: 50000 },
    monthlyCalories: { type: Number, default: 15000, min: 100, max: 500000 },

    // Weekly targets
    weeklySessions: { type: Number, default: 4, min: 1, max: 30 },

    // Custom goal note
    customNote: { type: String, default: "", maxlength: 200 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);
