const mongoose = require("mongoose");
const slugify = require("slugify");
const { getDocForValidation } = require("../utils/getDocsForValidation");
// const validator = require("validator");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxLength: [40, "A tour name must have less or equal than 40 characters"],
      minLength: [10, "A tour name must have more or equal than 10 characters"],
      // validate: [validator.isAlpha, "Tour name must only contain characters"],
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
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either easy, medium, difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "rating must be above 1.0"],
      max: [5, "rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        // val: is the value that we want to validate
        // the validation function must return true or false
        validator: async function (val) {
          const doc = await getDocForValidation(this);
          return val < doc.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
        // ({VALUE}): is a mongoose feature that will be replaced with the value
        // that was passed in the validator function
      },
    },
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
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// virtual populate:
// if there is a one-to-many relationship between two models, where we are using
// parent referencing (known as parent referencing, for instance, having the
// tour's ID stored in the review model), we can use virtual populate to
// populate the child model at the parent model without actually storing the
// child model id in the parent model
// we need to identify the foreignField and localField
// foreignField: is the field in the child model that references the parent model
// localField: is the field that gets used in the child model to reference the parent model (tour object id)

tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
}); // don't forget to populate the reviews in the query (or in the pre middleware)

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

// aggregation middleware is triggered during aggregation pipeline stages

tourSchema.pre("aggregate", function (next) {
  // this object refers to the current aggregate object
  // this.pipeline() will show the array of the stages in the aggregate pipeline
  // which we can add new stages to it

  if (!(this.pipeline().length > 0 && "$geoNear" in this.pipeline()[0])) {
    // because geoNear must be the first stage in the pipeline
    // we can't add any stage before it, so we can't add the $match stage
    this.pipeline().unshift({
      $match: { secretTour: { $ne: true } },
    });
  }
  next();
});

// we use this middleware to populate guides data before any find method
tourSchema.pre(/^find/, function (next) {
  // if we decided to have tours reference in guides model,
  // a stack overflow error will occur because guides will reference tours
  // and tours will reference guides, which cause a recursive loop
  // to prevent this, we can add a property to the options object
  // to check if the populate method is called before

  if (this.options._recursed) {
    return next();
  }

  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
    options: { _recursed: true },
  });
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
