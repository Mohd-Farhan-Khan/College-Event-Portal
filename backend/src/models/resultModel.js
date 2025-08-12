import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
  // aliases: `event` -> `event_id`, `user`/`student` -> `student_id`, `certificateUrl` -> `certificate_url`
  event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, alias: "user" },
    position: { type: Number, required: true },
  certificate_url: { type: String, alias: "certificateUrl" },
  },
  { timestamps: { createdAt: "issuedAt", updatedAt: false } },
);

resultSchema.index({ event_id: 1, student_id: 1 }, { unique: true });

export const Result = mongoose.model("Result", resultSchema);
export default Result;
