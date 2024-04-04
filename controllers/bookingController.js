const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { catchAsync } = require("../utils/catch");
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const AppError = require("../utils/appError");
// const User = require("../models/userModel");
// const factory = require("./handlerFactory");

const getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) create checkout session
  const domain = `${req.protocol}://${req.get("host")}`;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${domain}/api/v1/bookings/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${domain}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
    mode: "payment",
  });

  // 3) send session as response
  res.status(200).json({
    status: "success",
    checkoutUrl: session.url,
  });
});

const createBookingCheckout = catchAsync(async (req, res, next) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  const { client_reference_id: tourId, amount_total: price } = session;
  if (!tourId || !price) return next(new AppError("Invalid session", 400));

  await Booking.create({ tour: tourId, user: req.user.id, price: price / 100 });
  res.status(200).json({
    status: "success",
  });
});

module.exports = {
  getCheckoutSession,
  createBookingCheckout,
};
