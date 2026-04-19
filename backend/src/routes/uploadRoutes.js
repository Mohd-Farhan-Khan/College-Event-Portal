import express from "express";
import auth from "../middleware/authMiddleware.js";
import { uploadFile } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/", auth(["college", "admin"]), uploadFile);

export default router;
