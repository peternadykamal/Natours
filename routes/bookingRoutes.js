const express = require("express");
const bookingController = require("../controllers/bookingController");
const authController = require("../controllers/authController");

// mergeParams :Preserve the req.params values from the parent router. If the
// parent and the child have conflicting param names, the child’s value take
// precedence.
const router = express.Router();

router
  .route("/checkout-session/:tourId")
  .get(authController.protect, bookingController.getCheckoutSession);

// router
//   .route("/:id")
//   .get(reviewController.getReview)
//   .patch(
//     authController.restrictTo("user", "admin"),
//     reviewController.updateReview
//   )
//   .delete(
//     authController.restrictTo("user", "admin"),
//     reviewController.deleteReview
//   );

module.exports = router;
