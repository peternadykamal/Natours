const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const { globalErrorHandler } = require("./controllers/errorController");

// the main purpose of the app.js is
// 1. to create an express app
// 2. to define the middleware
// 3. to define the main app routes

const app = express();

// MIDDLEWARE
app.use(express.json()); // middleware to parse the body of the request to json, which is important to get the data from the body of the request
app.use(express.static(`${__dirname}/public`)); // middleware to serve static files
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // middleware to log the request to the console
}

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// mounting the routers to the app on a specific route
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

// unhandled routes
app.all("*", (req, res, next) => {
  const err = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );

  // whenever next method is called with an argument, express will know that
  // there is an error and it will skip all the other middleware and go straight
  // to the error handling middleware and will assume this argument as an error object
  next(err);
});

// to implement the error handling middleware, you simply to need to use app.use
// then pass a callback function with 4 parms. doing so let express know that
// this is an error handling middleware
app.use(globalErrorHandler);

module.exports = app;
