const Tour = require("../models/tourModel");
const { catchAsync } = require("../utils/catch");
const factory = require("./handlerFactory");

const aliasTopTours = function (req, res, next) {
  req.query.limit = 5;
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";

  next();
};

const getAllTours = factory.getAll(Tour);
const getTour = factory.getOne(Tour, { path: "reviews" });
const createTour = factory.createOne(Tour);
const updateTour = factory.updateOne(Tour);
const deleteTour = factory.deleteOne(Tour);

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        // _id: null,
        // _id: "$ratingsAverage",
        _id: "$difficulty",
        num: { $sum: 1 },
        numRatings: { $sum: "$ratingQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
    // {
    //   $match: {
    //     _id: { $ne: "easy" },
    //   },
    // },
  ]);

  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    data: {
      stats: stats,
    },
  });
});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const start = new Date(year, 1, 1);
  const end = new Date(year + 1, 1, 1);

  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        toursNum: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $sort: {
        toursNum: -1,
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    data: {
      plan: plan,
    },
  });
});

module.exports = {
  aliasTopTours,
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
};
