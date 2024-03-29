const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const Tour = require("../models/tourModel");

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

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = (
    await this.aggregate([
      {
        $match: { tour: tourId },
      },
      {
        $group: {
          _id: "$tour",
          nRating: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    ])
  )[0];
  console.log(stats);

  if (!stats) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });

    return;
  }

  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats.avgRating,
    ratingsQuantity: stats.nRating,
  });
};

reviewSchema.post("save", async function (docs, next) {
  await this.constructor.calcAverageRatings(this.tour);

  // this === docs: the current document that the action is being performed on
  // this.constructor === this.model(): the model that created the document

  next();
});

reviewSchema.post(/^findOneAnd/, async (docs, next) => {
  if (docs) await docs.constructor.calcAverageRatings(docs.tour);

  // this: current query object (if you are using normal function)
  // docs: the document that the action was performed on
  // docs.constructor === docs.model() == this.model: the model that created the document

  next();
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
