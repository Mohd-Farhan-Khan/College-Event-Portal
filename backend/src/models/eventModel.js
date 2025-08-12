import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    date: { type: Date, required: true },
    venue: { type: String },
    // alias allows using `posterUrl` while storing as `poster_url`
    poster_url: { type: String, alias: "posterUrl" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // alias for backward compatibility with `college`
    college_id: { type: mongoose.Schema.Types.ObjectId, ref: "College", alias: "college" },
  },
  { timestamps: true },
);

// Back-compat for legacy `bannerUrl` field name
eventSchema.virtual("bannerUrl")
  .get(function () {
    return this.poster_url;
  })
  .set(function (v) {
    this.poster_url = v;
  });

export const Event = mongoose.model("Event", eventSchema);
export default Event;
