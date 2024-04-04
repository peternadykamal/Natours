const mongoose = require("mongoose");
// const AppError = require("../utils/appError");
// const Tour = require("./tourModel");

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour",
    required: [true, "Booking must belong to a Tour!"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Booking must belong to a User!"],
  },
  price: {
    type: Number,
    required: [true, "Booking must have a Price"],
  },
  createdAt: {
    type: Date,
    immutable: true,
  },
  paid: {
    // if the user paid the booking or not
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre("save", async function (next) {
  // even if the user provide a createdAt date, we will ignore it
  this.createdAt = Date.now();
  next();
});

bookingSchema.pre(/^find/, function (next) {
  this.populate("user").populate({
    path: "tour",
    select:
      "name difficulty duration summary startLocation startDates locations maxGroupSize price ratingsAverage ratingsQuantity slug imageCover",
  });
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
