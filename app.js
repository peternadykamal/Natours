const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

// the main purpose of the app.js is
// 1. to create an express app
// 2. to define the middleware
// 3. to define the main app routes

const app = express();

// MIDDLEWARE
app.use(morgan("dev")); // middleware to log the request to the console
app.use(express.json()); // middleware to parse the body of the request to json, which is important to get the data from the body of the request
app.use(express.static(`${__dirname}/public`)); // middleware to serve static files

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// mounting the routers to the app on a specific route
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

module.exports = app;
