import express from "express";
import cors from "cors";
// import morgan from "morgan";
// import errorHandler from "./middleware/errorHandler.js";

// import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import eventRoutes from "./routes/eventRoutes.js";
// import registrationRoutes from "./routes/registrationRoutes.js";
// import resultRoutes from "./routes/resultRoutes.js";

const app = express();

// Basic configurations
app.use(express.json({ limit: "16kb" })); // To parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // To accept URL encoded data
app.use(express.static("public"));

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true, // Allow credentials if needed
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// import the routes
import healthCheckRouter from "./routes/healthRoutes.js";

app.use("/api/healthcheck", healthCheckRouter);

app.get("/", (req, res) => {
    res.send("Welcome to UniVerse");
});

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/events", eventRoutes);
// app.use("/api/registrations", registrationRoutes);
// app.use("/api/results", resultRoutes);

// app.use("*", (req, res) => res.status(404).json({ message: "Not Found" }));
// app.use(errorHandler);

export default app;
