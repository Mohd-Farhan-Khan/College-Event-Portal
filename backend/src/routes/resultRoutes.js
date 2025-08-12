import express from "express";
const router = express.Router({ mergeParams: true });
import resultCtrl, { publishResult, getResults } from "../controllers/resultController.js";
import auth from "../middleware/authMiddleware.js";

router.post("/:eventId", auth(["college", "admin"]), publishResult);
router.get("/", getResults);

export default router;
