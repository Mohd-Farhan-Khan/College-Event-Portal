import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    // aliases for backward compatibility: `user` -> `student_id`, `event` -> `event_id`
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, alias: "user" },
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      alias: "event",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: { createdAt: "registeredAt", updatedAt: false },
  },
);

registrationSchema.index({ student_id: 1, event_id: 1 }, { unique: true });

export const Registration = mongoose.model("Registration", registrationSchema);
export default Registration;
