const express = require("express");
const tourController = require("../controllers/tourController");

// tour router
const router = express.Router();

// defining the routes for tour router
router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
