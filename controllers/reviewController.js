const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");

const getAllReviews = (req, res, next) => {
  // if there is a tour id in the params, then we will filter the reviews by that tour id
  req.query = {
    ...req.query,
    tour: req.params.tourId,
  };
  const generalGetAllFn = factory.getAll(Review);
  generalGetAllFn(req, res, next);
};

const getReview = factory.getOne(Review);

const createReview = (req, res, next) => {
  req.body.tour = req.body.tour || req.params.tourId;
  req.body.user = req.user.id;

  const generalGetAllFn = factory.createOne(Review);
  generalGetAllFn(req, res, next);
};
const updateReview = factory.updateOne(Review);
const deleteReview = factory.deleteOne(Review);

module.exports = {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
};
