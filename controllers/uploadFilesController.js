const multer = require("multer");

// only images multer filter
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const userStorage = multer.diskStorage({
  destination: (rq, file, cb) => {
    cb(null, "public/img/users");
  },
  filename: (rq, file, cb) => {
    // user-userId.jpeg as each user can have only one profile picture
    const fileExtension = file.mimetype.split("/")[1];
    const filename = `user-${rq.user.id}.${fileExtension}`;

    cb(null, filename);
  },
});

const upload = multer({
  storage: userStorage,
  fileFilter: imageFilter,
});

const uploadUserPhoto = upload.single("photo");

module.exports = {
  uploadUserPhoto,
};
