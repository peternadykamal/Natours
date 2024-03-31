const Tour = require("../models/tourModel");
const { catchAsync } = require("../utils/catch");

const getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render("overview", {
    title: "All Tours",
    tours: tours,
  });
});

const getTour = catchAsync(async (req, res) => {
  const { slug } = req.params;
  const tour = await Tour.findOne({ slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  res.status(200).render("tour", {
    title: "the forest hiker tour",
    tour: tour,
  });
});

module.exports = {
  getOverview,
  getTour,
};
