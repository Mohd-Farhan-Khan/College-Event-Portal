const express = require("express");
const router = express.Router({ mergeParams: true });
const resultCtrl = require("../controllers/resultController");
const auth = require("../middleware/authMiddleware");

router.post("/:eventId", auth(["college", "admin"]), resultCtrl.publishResult);
router.get("/", resultCtrl.getResults);

module.exports = router;
