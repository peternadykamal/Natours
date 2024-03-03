const Tour = require("../models/tourModel");

const getAllTours = function (req, res) {
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    // results: toursData.length,
    // data: {
    //   tours: toursData,
    // },
  });
};

const getTour = function (req, res) {
  // using colon in the route means that it is a parameter and it can be accessed using req.params
  // we can also have optional parameters by using a question mark e.g. /api/v1/tours/:id/:x?
  // const id = req.params.id * 1;
  // const tour = toursData.find((el) => el.id === id);
  // res.status(200).json({
  //   status: "success",
  //   data: {
  //     tour: tour,
  //   },
  // });
};

const createTour = function (req, res) {
  res.status(201).json({
    // 201 means created
    status: "success",
    data: {
      // tour: newTour,
    },
  });
};

const updateTour = function (req, res) {
  res.status(200).json({
    status: "success",
    data: {
      tour: "<Updated tour here>",
    },
  });
};

const deleteTour = function (req, res) {
  res.status(204).json({
    // 204 means no content, used for successful delete
    status: "success",
    data: null,
  });
};

module.exports = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
};
