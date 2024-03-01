const express = require("express");
const fs = require("fs");

const app = express();

// MIDDLEWARE
// middleware
app.use(express.json()); // middleware to parse the body of the request to json, which is important to get the data from the body of the request

app.use((req, res, next) => {
  console.log("hello from the middleware");
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const toursData = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, "utf-8")
);

// ROUTE HANDLERS
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

  const id = req.params.id * 1; // convert a string id to a number
  if (id > toursData.length - 1) {
    res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
    return;
  }

  const tour = toursData.find((el) => el.id === id);

  res.status(200).json({
    status: "success",
    data: {
      tour: tour,
    },
  });
};

const createTour = function (req, res) {
  const newId = toursData[toursData.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body); // Object.assign is used to merge two objects and create a new object

  toursData.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(toursData),
    (err) => {
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
    }
  );
};

const updateTour = function (req, res) {
  const id = req.params.id * 1; // convert a string id to a number
  if (id > toursData.length - 1) {
    res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
    return;
  }

  const tour = toursData.find((el) => el.id === id);
  const updatedTour = req.body;

  for (let key in tour) {
    if (updatedTour.hasOwnProperty(key)) {
      tour[key] = updatedTour[key];
    }
  }

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(toursData),
    (err) => {
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
    }
  );
};

const deleteTour = function (req, res) {
  const id = req.params.id * 1;
  if (id > toursData.length - 1) {
    res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
    return;
  }

  const updatedToursData = toursData.filter((el) => el.id !== id);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(updatedToursData),
    (err) => {
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
    }
  );
};

// ROUTES

// app.get("/api/v1/tours", getAllTours);
// app.get("/api/v1/tours/:id", getTour);
// app.post("/api/v1/tours", createTour);
// app.patch("/api/v1/tours/:id", updateTour);
// app.delete("/api/v1/tours/:id", deleteTour);

app.route("/api/v1/tours").get(getAllTours).post(createTour);
app
  .route("/api/v1/tours/:id")
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

// START THE SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}, http://127.0.0.1:${port}`);
});
