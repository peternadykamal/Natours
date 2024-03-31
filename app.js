const express = require("express");
const path = require("path");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const helmet = require("./utils/customHelmetFn");
const viewRouter = require("./routes/viewRoutes");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const AppError = require("./utils/appError");
const { globalErrorHandler } = require("./controllers/errorController");

const app = express();

app.set("view engine", "pug"); // setting the view engine to pug
app.set("views", path.join(__dirname, "views"));

// MIDDLEWARE

// middleware to parse the body of the request to json, which is important to get the data from the body of the request
app.use(
  express.json({
    // we limit the size of the body of the request to 10kb
    limit: "10kb",
  })
);

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data sanitization against XSS
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    // whitelist is an array of the query parameters that we allow to be duplicated
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

// middleware to serve static files
app.use(express.static(path.join(__dirname, "public")));

// middleware to log the request to the console
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// rate limiting middleware
app.use(
  "/api",
  rateLimit({
    // this will limit the number of requests from an IP address
    // to 100 requests per hour
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour",
  })
);

// adding security HTTP headers using helmet
app.use(helmet);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// mounting the routers to the app on a specific route
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

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
