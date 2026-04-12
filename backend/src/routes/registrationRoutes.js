import express from "express";
const router = express.Router({ mergeParams: true });
import regCtrl, { registerForEvent, getRegistrations, updateRegistrationStatus } from "../controllers/registrationController.js";
import auth from "../middleware/authMiddleware.js";

router.post("/", auth("student"), registerForEvent);
router.post("/:eventId", auth("student"), registerForEvent);
router.get("/", auth(["admin", "college", "student"]), getRegistrations);
router.patch("/:id", auth(["admin", "college"]), updateRegistrationStatus);

export default router;
