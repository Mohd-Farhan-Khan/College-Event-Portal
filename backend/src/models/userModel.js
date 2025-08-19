import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // alias allows using `password` in code while persisting `passwordHash` in DB
    passwordHash: { type: String, required: [true, "Password is required"], minlength: 6, alias: "password" },
    role: {
      type: String,
      enum: ["student", "college", "admin"],
      default: "student",
    },
    // alias for backward compatibility with `college`
    college_id: { type: mongoose.Schema.Types.ObjectId, ref: "College", alias: "college" },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.passwordHash);
};

export const User = mongoose.model("User", userSchema);
export default User;
