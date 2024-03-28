const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catch");

const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id);

    const modelName = Model.collection.collectionName;
    if (!doc) {
      return next(
        new AppError(`no document found in ${modelName} with that ID`, 404)
      );
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

module.exports = {
  deleteOne,
};
