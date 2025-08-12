import express from "express";
const router = express.Router();
import userCtrl, { getUsers, getUser } from "../controllers/userController.js";
import auth from "../middleware/authMiddleware.js";

router.get("/", auth(["admin"]), getUsers);
router.get("/:id", auth(["admin"]), getUser);

export default router;
