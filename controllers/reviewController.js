const Review = require("../models/reviewModel");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const { catchAsync } = require("../utils/catch");

// getting all reviews
const getAllReviews = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Review.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const reviews = await features.query;

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews: reviews,
    },
  });
});

// creating new review
const createReview = catchAsync(async (req, res, next) => {
  // TODO: this implementation doesn't make sense, because why a user can create a review for another user
  req.body.tour = req.body.tour || req.params.tourId;
  req.body.user = req.body.user || req.user.id;

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      review: newReview,
    },
  });
});

module.exports = {
  getAllReviews,
  createReview,
};
