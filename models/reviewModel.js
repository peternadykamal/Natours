const mongoose = require("mongoose");
const AppError = require("../utils/appError");

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

// Ensure each user can have only one review on a tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre("save", async function (next) {
  // Check if there is an existing review for this user on this tour
  const existingReview = await this.constructor.findOne({
    tour: this.tour,
    user: this.user,
  });

  if (existingReview) {
    const error = new AppError("You have already reviewed this tour", 400);
    next(error);
  }

  // even if the user provide a createdAt date, we will ignore it
  this.createdAt = Date.now();

  next();
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });

  next();
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
