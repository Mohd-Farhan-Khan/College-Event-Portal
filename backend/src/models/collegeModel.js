import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String },
    description: { type: String },
    logo_url: { type: String },
  },
  { timestamps: true },
);

export const College = mongoose.model("College", collegeSchema);
export default College;
