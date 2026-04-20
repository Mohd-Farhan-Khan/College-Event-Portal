import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
// Ensure Mongoose models are registered early
import "./models/index.js";

const PORT = process.env.PORT || 8000;

(async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
})();
