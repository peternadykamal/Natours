const express = require("express");
const fs = require("fs");

const app = express();

// middleware
app.use(express.json()); // middleware to parse the body of the request to json, which is important to get the data from the body of the request

const toursData = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, "utf-8")
);

// route handler
app.get("/api/v1/tours", (req, res) => {
  res.status(200).json({
    status: "success",
    results: toursData.length,
    data: {
      tours: toursData,
    },
  });
});

app.get("/api/v1/tours/:id", (req, res) => {
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
});

app.post("/api/v1/tours", (req, res) => {
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
});

app.patch("/api/v1/tours/:id", (req, res) => {
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
});

app.delete("/api/v1/tours/:id", (req, res) => {
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
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}, http://127.0.0.1:${port}`);
});
