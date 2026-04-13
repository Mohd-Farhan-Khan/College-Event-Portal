import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/userModel.js";

dotenv.config();

async function main() {
  const [name, email, password] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.error('Usage: npm run seed:admin -- "<name>" "<email>" "<password>"');
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in environment variables");
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const trimmedName = name.trim();

  await mongoose.connect(process.env.MONGO_URI);

  let user = await User.findOne({ email: normalizedEmail });
  let action = "created";

  if (user) {
    user.name = trimmedName;
    user.password = password;
    user.role = "admin";
    action = "updated";
  } else {
    user = new User({
      name: trimmedName,
      email: normalizedEmail,
      password,
      role: "admin",
    });
  }

  await user.save();

  console.log(`Admin ${action}:`, {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  });

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
