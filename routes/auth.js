const express = require("express");

const authController = require("../controllers/auth");

const router = express.Router();

const { check } = require("express-validator");

const isNotLoggedIn = require("../middleware/is-not-logged");

const isAuth = require("../middleware/is-auth");

router.get("/login", isNotLoggedIn, authController.getLogin);

router.post(
  "/login",
  check("email").isEmail(),
  isNotLoggedIn,
  authController.postLogin
);

router.get(
  "/auth-info-change",
  isNotLoggedIn,
  authController.getAuthInfoChange
);

router.post(
  "/auth-info-change",
  check("newemail").isEmail(),
  check("email").isEmail(),
  isNotLoggedIn,
  authController.postAuthInfoChange
);

router.get("/admin-login", isNotLoggedIn, authController.getAdminLogin);
// router.post("/new-password", authController.postNewPassword);
// router.get("/reset", isNotLoggedIn, authController.getResetPassword);

// router.post("/reset", isNotLoggedIn, authController.postResetPassword);

router.post(
  "/admin-login",
  check("email").isEmail(),
  isNotLoggedIn,
  authController.postAdminLogin
);

// router.get("/reset/:token", isNotLoggedIn, authController.getNewPassword);

// router.post("/new-password", isNotLoggedIn, authController.postNewPassword);

router.post("/logout", isAuth, authController.postLogout);

module.exports = router;
