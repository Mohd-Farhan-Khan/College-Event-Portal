const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    venue: String,
    bannerUrl: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
    maxParticipants: { type: Number, default: 0 },
    registrationsOpen: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Event", eventSchema);
