const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: String,
    city: String,
    state: String,
    website: String,
    logoUrl: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("College", collegeSchema);
