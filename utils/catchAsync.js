const catchAsync = (callbackFun) => (req, res, next) => {
  callbackFun(req, res, next).catch(next);
};

module.exports = catchAsync;
