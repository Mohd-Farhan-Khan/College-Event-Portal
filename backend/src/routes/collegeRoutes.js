import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  createCollege,
  deleteCollege,
  getCollege,
  getCollegeEvents,
  getCollegeOverview,
  getColleges,
  getCollegeUsers,
  updateCollege,
} from "../controllers/collegeController.js";

const router = express.Router();

router.get("/", getColleges);
router.post("/", auth(["admin"]), createCollege);
router.get("/:id", getCollege);
router.put("/:id", auth(["admin"]), updateCollege);
router.delete("/:id", auth(["admin"]), deleteCollege);
router.get("/:id/events", getCollegeEvents);
router.get("/:id/users", auth(["admin"]), getCollegeUsers);
router.get("/:id/overview", auth(["admin"]), getCollegeOverview);

export default router;
