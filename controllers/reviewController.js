const Review = require("../models/reviewModel");
const APIFeatures = require("../utils/apiFeatures");
const { catchAsync } = require("../utils/catch");
const factory = require("./handlerFactory");

const getAllReviews = catchAsync(async (req, res, next) => {
  // if there is a tour id in the params, then we will filter the reviews by that tour id
  req.query = {
    ...req.query,
    tour: req.params.tourId,
  };

  const features = new APIFeatures(Review.find(), req.query).filter().sort();

  const reviews = await features.query;

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews: reviews,
    },
  });
});

const createReview = catchAsync(async (req, res, next) => {
  req.body.tour = req.body.tour || req.params.tourId;
  req.body.user = req.user.id;

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      review: newReview,
    },
  });
});

const deleteReview = factory.deleteOne(Review);

module.exports = {
  getAllReviews,
  createReview,
  deleteReview,
};
