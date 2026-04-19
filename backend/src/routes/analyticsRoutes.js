import express from "express";
import auth from "../middleware/authMiddleware.js";
import { getAdminAnalytics, getCollegeAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/admin", auth(["admin"]), getAdminAnalytics);
router.get("/college", auth(["college", "admin"]), getCollegeAnalytics);

export default router;
