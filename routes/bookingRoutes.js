const express = require("express");
const bookingController = require("../controllers/bookingController");
const authController = require("../controllers/authController");

// mergeParams :Preserve the req.params values from the parent router. If the
// parent and the child have conflicting param names, the child’s value take
// precedence.
const router = express.Router();

router.use(authController.protect);

router
  .route("/checkout-session/:tourId")
  .get(bookingController.getCheckoutSession);

router.route("/success").get(bookingController.createBookingCheckout);

router.use(authController.restrictTo("admin", "lead-guide"));

router
  .route("/")
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route("/:id")
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
