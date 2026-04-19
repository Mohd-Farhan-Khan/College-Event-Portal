import express from "express";
const router = express.Router();
import { createEvent, getEvents, getEvent, updateEvent, deleteEvent } from "../controllers/eventController.js";
import auth from "../middleware/authMiddleware.js";

router.post("/", auth(["college", "admin"]), createEvent);
router.get("/", getEvents);
router.get("/:id", getEvent);
router.put("/:id", auth(["college", "admin"]), updateEvent);
router.delete("/:id", auth(["college", "admin"]), deleteEvent);

export default router;
