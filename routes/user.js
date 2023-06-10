const express = require("express");
const userController = require("../controllers/user");
const router = express.Router();
const isAuth = require("../middleware/is-auth");

//page with All transactions
router.get(
  "/main",
  isAuth,
  (req, res, next) => {
    if (!req.session.isAdmin) return next();
    res.redirect("/admin/allUsers");
  },
  userController.getUserInfo
);
router.post(
  "/user/post-add-transaction",
  isAuth,
  userController.postAddTransaction
);
//post requests
// router.post("/post-add-transaction", isAuth, userController.postAddTransaction);
// router.delete("/delete", isAuth, userController.postDeleteRequest);

module.exports = router;
