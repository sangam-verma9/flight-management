const express = require("express");

const { isAuthUser } = require("../middlewares/auth");
const { registeruser, loginuser, getuserdetails } = require("../controllers/userController");


const router = express.Router();
router.route("/register").post(registeruser);
router.route("/login").post(loginuser);
router.route("/me").get(isAuthUser, getuserdetails);

module.exports = router;