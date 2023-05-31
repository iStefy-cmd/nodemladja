const express = require("express");
const authController = require("../controllers/auth");
const router = express.Router();

const isNotLoggedIn = require("../middleware/is-not-logged");
const isAuth = require("../middleware/is-auth");
router.get(
  "/login",

  isNotLoggedIn,
  authController.getLogin
);
router.post(
  "/login",

  isNotLoggedIn,
  authController.postLogin
);
router.get(
  "/register",
  isNotLoggedIn,

  authController.getRegister
);
router.post(
  "/register",
  isNotLoggedIn,

  authController.postRegister
);

router.get(
  "/admin-login",
  isNotLoggedIn,

  authController.getAdminLogin
);
router.post("/admin-login", isNotLoggedIn, authController.postAdminLogin);

router.post("/logout", isAuth, authController.postLogout);
module.exports = router;
