const express = require("express");
const tourController = require("../controllers/tourController");

// tour router
const router = express.Router();

// defining a middleware that can be reached when there is specific parameter under this route
// takes two arguments, (param, callback)
// callback takes four arguments, (req, res, next, val of the param)
router.param("id", tourController.checkId);

// defining the routes for tour router
router
  .route("/")
  .get(tourController.getAllTours)
  // middleware to validate the request body then create a tour
  .post(tourController.validateCreateTourBody, tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
