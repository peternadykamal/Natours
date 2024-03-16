const Tour = require("../models/tourModel");

const aliasTopTours = function (req, res, next) {
  req.query.limit = 5;
  req.query.sort = "-ratingAverage,price";
  req.query.fields = "name,price,ratingAverage,summary,difficulty";

  next();
};

const getAllTours = async function (req, res) {
  try {
    let queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];

    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (matchedStr) => `$${matchedStr}`
    );

    queryObj = JSON.parse(queryStr);

    let query = Tour.find(queryObj);

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //projecting aka field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    if (req.query.page) {
      const numTours = await Tour.countDocuments(query);
      if (numTours <= skip) throw new Error("page doesn't exist");
    }
    query = query.skip(skip).limit(limit);

    const tours = await query;

    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours: tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

const getTour = async function (req, res) {
  try {
    const { id } = req.params;
    const tour = await Tour.findById(id);
    // const tour = await Tour.findOne({ _id: id });

    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

const createTour = async function (req, res) {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

const updateTour = async function (req, res) {
  try {
    const { id } = req.params;
    const newTour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

const deleteTour = async function (req, res) {
  try {
    const { id } = req.params;
    await Tour.findByIdAndDelete(id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

module.exports = {
  aliasTopTours,
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
};
