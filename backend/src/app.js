const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const resultRoutes = require("./routes/resultRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ status: "API running" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/results", resultRoutes);

app.use("*", (req, res) => res.status(404).json({ message: "Not Found" }));
app.use(errorHandler);

module.exports = app;
