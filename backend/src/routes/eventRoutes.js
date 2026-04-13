import express from "express";
const router = express.Router();
import { createEvent, getEvents, getEvent } from "../controllers/eventController.js";
import auth from "../middleware/authMiddleware.js";

router.post("/", auth(["college", "admin"]), createEvent);
router.get("/", getEvents);
router.get("/:id", getEvent);

export default router;
