const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);
router.get("/me", auth(), authCtrl.me);

module.exports = router;
