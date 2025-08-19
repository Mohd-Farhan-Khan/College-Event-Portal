import dotenv from "dotenv";
import mongoose from "mongoose";
import College from "../models/collegeModel.js";

dotenv.config();

async function main() {
  const [name, location = "", description = "", logo_url = ""] = process.argv.slice(2);
  if (!name) {
    console.error("Usage: npm run seed:college -- \"<name>\" \"<location>\" \"<description>\" \"<logo_url>\"");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const doc = await College.findOneAndUpdate(
    { name },
    { $setOnInsert: { name, location, description, logo_url } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("Seeded College:", { id: doc._id.toString(), name: doc.name });
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});