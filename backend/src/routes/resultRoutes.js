import express from "express";
const router = express.Router({ mergeParams: true });
import { publishResult, getResults, generateResultCertificate, downloadResultCertificate } from "../controllers/resultController.js";
import auth from "../middleware/authMiddleware.js";

router.post("/", auth(["college", "admin"]), publishResult);
router.post("/:eventId", auth(["college", "admin"]), publishResult);
router.post("/:id/certificate", auth(["college", "admin"]), generateResultCertificate);
router.get("/:id/certificate", auth(["student", "college", "admin"]), downloadResultCertificate);
router.get("/", getResults);

export default router;
