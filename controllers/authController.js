const util = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { catchAsync, catchSync } = require("../utils/catch");
const AppError = require("../utils/appError");
const Email = require("../utils/email");

const signInToken = function (id) {
  // for the best encryption for the signature, the secret key must be at least 32 characters
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendResponseWithJWT = (
  user,
  statusCode,
  res,
  provideUserInBody = false
) => {
  const token = signInToken(user._id);

  let expiresIn = process.env.JWT_EXPIRES_IN;
  expiresIn =
    expiresIn.substring(0, expiresIn.length - 1) * 24 * 60 * 60 * 1000;

  const cookieOptions = {
    expires: new Date(Date.now() + expiresIn),
    httpOnly: true,
    ...(process.env.NODE_ENV === "production" ? { secure: true } : undefined),
  };

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token: token,
    ...(provideUserInBody ? { data: { user: user } } : undefined),
  });
};

const signup = catchAsync(async (req, res, next) => {
  // TODO: check if the user already exists but is inactive

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  // we need to delete the password and active status from the output
  newUser.password = undefined;
  newUser.active = undefined;

  // send welcome email to user
  const url = `${req.protocol}://${req.get("host")}/me`;
  await new Email(newUser, url).sendWelcome();

  sendResponseWithJWT(newUser, 201, res, true);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findUserAndValidatePassword(email, password);

  sendResponseWithJWT(user, 200, res, false);
});

const logout = catchSync((req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: "success" });
});

const protect = catchAsync(async (req, res, next) => {
  // 1) getting the token and check if it's there
  const { headers, cookies } = req;
  let token = "";

  // check if there is a token in either headers or cookies, send error if not
  const isAuthorizationMissing =
    (!headers.authorization || !headers.authorization.startsWith("Bearer")) &&
    !cookies.jwt;
  if (isAuthorizationMissing) {
    throw new AppError(
      "You are not logged in! Please log in to get access.",
      401
    );
  }

  // if the token is in the headers, exclude the "Bearer" and get the token
  if (headers.authorization) {
    token = headers.authorization.split(" ")[1];
  } else {
    // else then the token is in the cookies
    token = cookies.jwt;
  }

  // 2) verification token asynchronously
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // 3) check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    throw new AppError("The user belonging to this token no longer exist", 401);
  }

  // 4) check if user changed password after the token was issued
  if (currentUser.isPasswordChangeAfterJWTIssued(decoded.iat)) {
    throw new AppError(
      "User recently changed password! Please log in again.",
      401
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// the difference between isLoggedIn and protect is that protect works as a security wall
// only authenticated users can pass through it, while isLoggedIn provide user info in req.locals
// if user is logged in
const isLoggedIn = async (req, res, next) => {
  if (!req.cookies.jwt) {
    return next();
  }

  try {
    // 1 verify token
    const decoded = await util.promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    // 2) check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) return next();

    // 3) check if user changed password after the token was issued
    if (currentUser.isPasswordChangeAfterJWTIssued(decoded.iat)) return next();

    // there is a logged in user
    res.locals.user = currentUser;
    next();
  } catch (error) {
    return next();
  }
};

const restrictTo = (...roles) =>
  catchSync((req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(
        "You do not have permission to perform this action",
        403
      );
    }

    next();
  });

const forgotPassword = catchAsync(async (req, res, next) => {
  // 0) check if email is provided in body
  if (!req.body.email)
    throw new AppError("you need to provide your email address", 400);

  // 1) get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    throw new AppError("There is no user with this email address", 404);

  // 2) generate the random
  const resetToken = await user.createPasswordResetToken();

  // 3) send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    // there might happen an error while sending the email,
    // in this case we need delete password reset token and password reset expires from database
    await new Email(user, resetURL).sendPasswordReset();
  } catch (err) {
    await user.deletePasswordResetToken();
    throw new AppError(
      "There was an error sending the email. Try again later",
      500
    );
  }

  res.status(200).json({
    status: "success",
    message: "Token sent to email",
  });
});
const resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) if token has not expired; and there is user, set the new password
  if (!user) throw new AppError("Token is invalid or has expired", 400);
  await user.resetPassword(req.body.password, req.body.passwordConfirm);

  // 4) log the user in
  sendResponseWithJWT(user, 200, res, false);
});

const updatePassword = catchAsync(async (req, res, next) => {
  // 1) get user from collection
  const user = await User.findUserAndValidatePassword(
    req.user.email,
    req.body.password
  );

  // 2) if so, update password
  await user.resetPassword(req.body.newPassword, req.body.newPasswordConfirm);

  // 3) log user in, send JWT
  sendResponseWithJWT(user, 200, res, false);
});

module.exports = {
  signup,
  login,
  logout,
  protect,
  isLoggedIn,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};
