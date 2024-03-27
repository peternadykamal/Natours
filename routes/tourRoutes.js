const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");

// tour router
const router = express.Router();

router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours)
  .get(tourController.getAllTours);

router.route("/tour-states").get(tourController.getTourStats);
router.route("/montly-plan/:year").get(tourController.getMonthlyPlan);

// defining the routes for tour router
router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.getAllTours
  )
  // middleware to validate the request body then create a tour
  .post(tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(authController.protect, tourController.deleteTour);

router
  .route("/:tourId/reviews")
  .post(
    authController.protect,
    authController.restrictTo("user"),
    reviewController.createReview
  );

module.exports = router;
