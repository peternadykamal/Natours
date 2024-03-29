const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { getDocForValidation } = require("../utils/getDocsForValidation");
const AppError = require("../utils/appError");

// name, email, photo, password, passwordConfirm
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell use your name!"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, "invalid email: ({VALUE})"],
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "tour", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    maxLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: async function (val) {
        const doc = await getDocForValidation(this);
        return val === doc.password;
      },
      message: "Passwords are not the same",
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  // we need to update hash password only when it gets modified
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now();
  this.passwordConfirm = undefined;
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.statics.findUserAndValidatePassword = async function (
  email,
  password
) {
  // 1) check if email and password exists
  if (!email || !password)
    throw new AppError("Please provide email and password", 400);

  // 2) check if user exists && password is correct
  const user = await this.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password)))
    throw new AppError("Incorrect email or password", 401);

  return user;
};

userSchema.methods.isPasswordChangeAfterJWTIssued = function (JWTIssuedTime) {
  // jwt issued time : is the time when the token was created
  const changedTimeStamp = parseInt(
    this.passwordChangedAt.getTime() / 1000,
    10
  );
  return changedTimeStamp > JWTIssuedTime;
};

userSchema.methods.createPasswordResetToken = async function () {
  // first we need to create a random string
  const resetToken = crypto.randomBytes(32).toString("hex");

  // second we will hash this token, the reason for hashing that
  // this token will get stored in DB, if someone gets access to the DB
  // they will not be able to see the token in plain text

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires =
    Date.now() + process.env.PASSWORD_RESET_EXPIRES_IN_MINUTES * 60 * 1000;

  await this.save({ validateModifiedOnly: true });

  return resetToken;
};

userSchema.methods.deletePasswordResetToken = async function () {
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;

  await this.save({ validateModifiedOnly: true });
};

userSchema.methods.resetPassword = async function (password, passwordConfirm) {
  if (!password || !passwordConfirm)
    throw new AppError("Please provide password and passwordConfirm", 400);

  // 1) update the password
  this.password = password;
  this.passwordConfirm = passwordConfirm;
  this.passwordChangedAt = Date.now();

  // 2) delete the password reset token and password reset expires
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;

  await this.save({ validateModifiedOnly: true });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
