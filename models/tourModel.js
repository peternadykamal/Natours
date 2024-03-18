const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: Number,
    summery: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "A tour must have a description"],
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // this field won't be shown when we query the database
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// document middleware is triggerd during actions like "save", "validate",
// "remove", "updateOne", and "deleteOne"

// to include all document middleware actions to be triggered on one function
// we can use regular expression
// tourSchema.pre(/save|validate|remove|updateOne|deleteOne/, function )
// or tourSchema.post(/save|validate|remove|updateOne|deleteOne/, function )

// pre hooks: runs before the actual action is performed, which is useful for
// manipulating the data before saving it to the database

// post hooks: runs after the actual action is performed, which is useful for
// logging or cleaning up
// good article: https://blog.stackademic.com/understanding-mongoose-middleware-in-node-js-9b67f1e37b44
//             : https://mongoosejs.com/docs/middleware.html

tourSchema.pre("save", function (next) {
  // this object refers to the current document
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post("save", function (doc, next) {
//   // note that doc object and this object are the same
//   console.log(doc);
//   next();
// });

// query middleware is triggered during queries like "count", "countDocuments"
//, "deleteMany", "deleteOne", "estimatedDocumentCount", "find", "findOne"
//, "findOneAndDelete", "findOneAndReplace", "findOneAndUpdate", "remove"
//, "replaceOne", "update", "updateOne", "updateMany", and "validate"

// to include all query middleware actions that start with "find" to be triggered
// tourSchema.pre(/^find/, function )

tourSchema.pre(/^find/, function (next) {
  // this object refers to the current query object
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`query took ${Date.now() - this.start} milliseconds`);
  next();
});

// aggregation middleware is triggered during aggregation pipeline stages

tourSchema.pre("aggregate", function (next) {
  // this object refers to the current aggregate object
  // this.pipeline() will show the array of the stages in the aggregate pipeline
  // which we can add new stages to it
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
