const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth(["admin"]), userCtrl.getUsers);
router.get("/:id", auth(["admin"]), userCtrl.getUser);

module.exports = router;
