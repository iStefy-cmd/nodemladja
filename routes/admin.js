const express = require("express");
const adminController = require("../controllers/admin");
const router = express.Router();
const isAdmin = require("../middleware/is-admin");

//page with All transactions
router.get("/transactions", isAdmin, adminController.getAllTransactions);
//post requests
router.post(
  "/post-add-transaction",
  isAdmin,
  adminController.postAddTransaction
);
router.delete("/delete", isAdmin, adminController.postDeleteRequest);

//page with all users
router.get("/allUsers", isAdmin, adminController.getMainPage);
//personal user info page
router.get("/user/:userName", isAdmin, adminController.getUserInfo);
router.post(
  "/delete-profile/:id",

  isAdmin,

  adminController.postDeleteProfile
);
router.post(
  "/approveTransaction",

  isAdmin,
  adminController.postApproveTransaction
);
router.post(
  "/rejectTransaction",

  isAdmin,
  adminController.postRejectTransaction
);
module.exports = router;
