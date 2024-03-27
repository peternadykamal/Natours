const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can't be empty"],
      trim: true,
      maxLength: 40,
    },
    rating: {
      type: Number,
      required: [true, "A review must have a rating"],
      min: [1, "rating must be above 1.0"],
      max: [5, "rating must be below 5.0"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      required: [true, "A review must belong to a tour"],
      ref: "Tour",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, "A review must belong to a user"],
      ref: "User",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "tour",
    select: "-__v",
  }).populate({
    path: "user",
    select: "-__v -passwordChangedAt",
  });

  next();
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
