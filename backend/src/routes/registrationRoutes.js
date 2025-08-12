const express = require("express");
const router = express.Router({ mergeParams: true });
const regCtrl = require("../controllers/registrationController");
const auth = require("../middleware/authMiddleware");

router.post("/:eventId", auth("student"), regCtrl.registerForEvent);
router.get("/", auth(["admin", "college"]), regCtrl.getRegistrations);

module.exports = router;
