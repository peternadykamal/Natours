const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");
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
const deleteTour = factory.deleteOne(Tour);

const updateTour = factory.updateOne(Tour);

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
// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi
const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  if (!lat || !lng)
    throw new AppError("Please provide latitude and longitude", 400);

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

const getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  if (!lat || !lng)
    throw new AppError("Please provide latitude and longitude", 400);

  // geoNear is a stage that must be the first stage in the pipeline
  // it requires at least one geospatial index
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point", // the type of the point
          coordinates: [lng * 1, lat * 1], // the coordinates of the point
        },
        distanceField: "distance", // the field that will be added to the output documents
        distanceMultiplier: unit === "mi" ? 0.000621371 : 0.001, // to convert the distance to miles
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      distances: distances,
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
  getToursWithin,
  getDistance,
};
