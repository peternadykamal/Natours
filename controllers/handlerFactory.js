const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const { catchAsync } = require("../utils/catch");

const convertPluralToSingular = (str) => {
  if (str.endsWith("ies")) {
    return `${str.slice(0, -3)}y`;
  }
  if (str.endsWith("es")) {
    return str.slice(0, -1);
  }
  return str.slice(0, -1);
};

const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    const modelName = Model.collection.collectionName;
    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      results: docs.length,
      data: {
        [modelName]: docs,
      },
    });
  });

const getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    let query = Model.findById(id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    const modelName = convertPluralToSingular(Model.collection.collectionName);
    if (!doc) {
      return next(new AppError(`No ${modelName} found with that ID`, 404));
    }

    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      data: {
        [modelName]: doc,
      },
    });
  });
const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id);

    const modelName = convertPluralToSingular(Model.collection.collectionName);
    if (!doc) {
      return next(new AppError(`No ${modelName} found with that ID`, 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const newDoc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    const modelName = convertPluralToSingular(Model.collection.collectionName);
    if (!newDoc) {
      return next(new AppError(`No ${modelName} found with that ID`, 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        [modelName]: newDoc,
      },
    });
  });

const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    const modelName = convertPluralToSingular(Model.collection.collectionName);
    res.status(201).json({
      status: "success",
      data: {
        [modelName]: newDoc,
      },
    });
  });

module.exports = {
  getAll,
  getOne,
  deleteOne,
  updateOne,
  createOne,
};
