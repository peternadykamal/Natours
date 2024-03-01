const express = require("express");
const userController = require("../controllers/userController");

// user router
const router = express.Router();

// defining the routes for user router
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
