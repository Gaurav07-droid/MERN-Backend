const fs = require("fs");

const uniqId = require("uniqid");
const User = require("../Model/userModel");
const catchAsync = require("../utils/catchAsync");
// const Place = require("../Model/placeModel");
const AppError = require("../utils/AppError");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select("-__v");

  if (users.length <= 0) {
    return next(new AppError("No users found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: users,
  });
});

exports.getAUser = catchAsync(async (req, res, next) => {
  const userId = req.params.uId;

  const user = await User.findById(userId).select("-__v").populate({
    path: "places",
    select: "title address",
  });

  if (!user) {
    return next(new AppError("No user found with that id!", 404));
  }

  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.deletUser = catchAsync(async (req, res, next) => {
  const userId = req.params.uId;

  const user = await User.findByIdAndDelete(userId);
  // const place = await Place.find({ creator: userId });
  const image = user.image;

  if (!user) {
    return next(new AppError("No user found with that id!", 404));
  }

  fs.unlink(`public/img/${image}`, (err) => {
    console.log(err);
  });

  res.status(204).json({
    status: "success",
  });
});
