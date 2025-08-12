const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    position: { type: Number, required: true },
    certificateUrl: String,
  },
  { timestamps: true },
);

resultSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Result", resultSchema);
