const { catchAsync } = require("../utils/catch");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const factory = require("./handlerFactory");

const notDefinedRoute = function (req, res) {
  res.status(500).json({
    status: "errer",
    message: "This route is not yet defined",
  });
};

const getAllUsers = factory.getAll(User);
const createUser = notDefinedRoute;
const getUser = factory.getOne(User);
const updateUser = factory.updateOne(User);
const deleteUser = factory.deleteOne(User);

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  const generalGetOneFn = factory.getOne(User);
  generalGetOneFn(req, res, next);
};

const updateMe = catchAsync(async (req, res, next) => {
  // 1) create error if user POSTS password data
  if (req.body.password || req.body.passwordConfirm) {
    throw new AppError(
      "this route is not for password updates. please use /updatePassword",
      400
    );
  }

  // 2) filter out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");

  // 2) update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  getAllUsers,
  createUser,
  getUser,
  getMe,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
};
