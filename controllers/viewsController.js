const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const Booking = require("../models/bookingModel");
const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catch");

const getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render("overview", {
    title: "All Tours",
    tours: tours,
  });
});

const getTour = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const tour = await Tour.findOne({ slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!tour) {
    throw new AppError("there is no tour with that name", 404);
  }

  res.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour: tour,
    stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
  });
});

const getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render("login", {
    title: "Log into your account",
  });
});

const getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account",
  });
};

const updateUserData = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { name, email },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render("account", {
    title: "Your account",
    user: updatedUser,
  });
});

const getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tours = bookings.map((booking) => booking.tour);

  res.status(200).render("overview", {
    title: "My Tours",
    tours: tours,
  });
});

module.exports = {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
  getMyTours,
};
