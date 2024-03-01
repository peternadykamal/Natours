const fs = require("fs");

// __dirname is a special variable in node that gives the path to the current directory of
// current file.

const tourDataPath = `${__dirname}/../dev-data/data/tours-simple.json`;

const toursData = JSON.parse(fs.readFileSync(tourDataPath, "utf-8"));

const checkId = function (req, res, next, id) {
  if (id > toursData.length - 1) {
    res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
    return;
  }
  next();
};

const getAllTours = function (req, res) {
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: toursData.length,
    data: {
      tours: toursData,
    },
  });
};

const getTour = function (req, res) {
  // using colon in the route means that it is a parameter and it can be accessed using req.params
  // we can also have optional parameters by using a question mark e.g. /api/v1/tours/:id/:x?

  const id = req.params.id * 1;
  const tour = toursData.find((el) => el.id === id);

  res.status(200).json({
    status: "success",
    data: {
      tour: tour,
    },
  });
};

const validateCreateTourBody = function (req, res, next) {
  const condition =
    !req.body.hasOwnProperty("name") || !req.body.hasOwnProperty("price");

  if (condition) {
    res.status(400).json({
      status: "fail",
      message: "missing name or price in the request body",
    });
    return;
  }

  next();
};

const createTour = function (req, res) {
  const newId = toursData[toursData.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body); // Object.assign is used to merge two objects and create a new object

  toursData.push(newTour);
  fs.writeFile(tourDataPath, JSON.stringify(toursData), (err) => {
    if (err) {
      res.status(422).json({
        status: "fail",
        message: "couldn't create new tour",
      });
    }

    res.status(201).json({
      // 201 means created
      status: "success",
      data: {
        tour: newTour,
      },
    });
  });
};

const updateTour = function (req, res) {
  const id = req.params.id * 1;
  const tour = toursData.find((el) => el.id === id);
  const updatedTour = req.body;

  for (let key in tour) {
    if (updatedTour.hasOwnProperty(key)) {
      tour[key] = updatedTour[key];
    }
  }

  fs.writeFile(tourDataPath, JSON.stringify(toursData), (err) => {
    if (err) {
      res.status(422).json({
        status: "fail",
        message: "couldn't update new tour",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        tour: tour,
      },
    });
  });
};

const deleteTour = function (req, res) {
  const id = req.params.id * 1;
  const updatedToursData = toursData.filter((el) => el.id !== id);

  fs.writeFile(tourDataPath, JSON.stringify(updatedToursData), (err) => {
    if (err) {
      res.status(422).json({
        status: "fail",
        message: "couldn't update new tour",
      });
    }

    res.status(204).json({
      // 204 means no content, used for successful delete
      status: "success",
      data: null,
    });
  });
};

module.exports = {
  checkId,
  getAllTours,
  getTour,
  validateCreateTourBody,
  createTour,
  updateTour,
  deleteTour,
};
