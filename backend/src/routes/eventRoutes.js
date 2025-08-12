const express = require("express");
const router = express.Router();
const eventCtrl = require("../controllers/eventController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth(["college", "admin"]), eventCtrl.createEvent);
router.get("/", eventCtrl.getEvents);
router.get("/:id", eventCtrl.getEvent);

module.exports = router;
