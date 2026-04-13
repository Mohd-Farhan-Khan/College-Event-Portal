import express from "express";
const router = express.Router();
import { register, login, me } from "../controllers/authController.js";
import auth from "../middleware/authMiddleware.js";

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth(), me);

export default router;
