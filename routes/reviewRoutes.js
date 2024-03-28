const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

// mergeParams :Preserve the req.params values from the parent router. If the
// parent and the child have conflicting param names, the child’s value take
// precedence.
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(authController.restrictTo("user"), reviewController.createReview);

router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo("user", "admin"),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo("user", "admin"),
    reviewController.deleteReview
  );

module.exports = router;
