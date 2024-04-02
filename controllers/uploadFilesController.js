const multer = require("multer");
const sharp = require("sharp");
const { catchSync, catchAsync } = require("../utils/catch");

// only images multer filter
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

// store file in memory, it then can be accessed in req.file.buffer
const userStorage = multer.memoryStorage();

const upload = multer({
  storage: userStorage,
  fileFilter: imageFilter,
});

const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);
  next();
});

const uploadUserPhoto = catchSync(upload.single("photo"));
const uploadTourImages = catchSync(
  upload.fields([
    { name: "imageCover", maxCount: 1 },
    { name: "images", maxCount: 3 },
  ])
);

module.exports = {
  resizeUserPhoto,
  resizeTourImages,
  uploadUserPhoto,
  uploadTourImages,
};
