const catchAsync = (callbackFun) => (req, res, next) => {
  callbackFun(req, res, next).catch(next);
};

const catchSync = (callbackFun) => (req, res, next) => {
  try {
    callbackFun(req, res, next);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  catchAsync,
  catchSync,
};
