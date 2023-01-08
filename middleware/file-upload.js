const multer = require("multer");
const uuid = require("uniqid");
const sharp = require("sharp");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

//when we do memeory storage then only buffer is present otherwise the data will store in local machine
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload an image", 400), false);
  }
};

const imageUpload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhoto = imageUpload.single("image");

exports.resizePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  //req.userId when the authorization implemented
  req.file.filename = `${uuid()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/${req.file.filename}`);

  next();
});

// module.exports = imageUpload;
