const Tour = require("../models/tourModel");
const { catchAsync } = require("../utils/catch");

const getOverview = catchAsync(async (req, res) => {
  // 1) get tour data from collection
  const tours = await Tour.find();

  // 2) build template

  // 3) render that template using tour data

  res.status(200).render("overview", {
    title: "All Tours",
    tours: tours,
  });
});

const getTour = (req, res) => {
  res.status(200).render("tour", {
    title: "the forest hiker tour",
  });
};

module.exports = {
  getOverview,
  getTour,
};
