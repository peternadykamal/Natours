const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { uploadUserPhoto } = require("../controllers/uploadFilesController");

// user router
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// by using this middleware, all the routes below this middleware will be protected
router.use(authController.protect);

router.patch("/updatePassword", authController.updatePassword);

router
  .route("/me")
  .get(userController.getMe)
  .patch(uploadUserPhoto, userController.updateMe)
  .delete(userController.deleteMe);

router.use(authController.restrictTo("admin"));

router.route("/").get(userController.getAllUsers);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
