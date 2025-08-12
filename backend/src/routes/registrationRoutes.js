import express from "express";
const router = express.Router({ mergeParams: true });
import regCtrl, { registerForEvent, getRegistrations } from "../controllers/registrationController.js";
import auth from "../middleware/authMiddleware.js";

router.post("/:eventId", auth("student"), registerForEvent);
router.get("/", auth(["admin", "college"]), getRegistrations);

export default router;
