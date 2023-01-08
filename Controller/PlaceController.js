const fs = require("fs");
// const uniqId = require("uniqid");
const { validationResult } = require("express-validator");

const AppError = require("../utils/AppError");
const getCoordsForAddress = require("../utils/location");
const catchAsync = require("../utils/catchAsync");
const Place = require("../Model/placeModel");
const User = require("../Model/userModel");
// const { compareSync } = require("bcryptjs");

exports.checkAuthority = catchAsync(async (req, res, next) => {
  let placeId = req.params.pId;

  const place = await Place.findById(placeId);
  const creatorId = place.creator.toString();

  if (req.user.id !== creatorId) {
    return next(
      new AppError("Sorry! you are not authorized to perform this action.", 403)
    );
  }

  next();
});

exports.createPlace = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: "fail",
      message: "Invalid inputs !Please check and try again",
    });
  }

  let coordinates = await getCoordsForAddress(req.body.address);

  if (!req.body.creator) {
    req.body.creator = req.user.id;
  }

  if (req.file) {
    req.body.image = req.file.filename;
  }

  if (!req.body.location) {
    req.body.location = coordinates;
  }

  const creatorExist = await User.findById(req.user.id);

  const createdPlace = await Place.create({
    title: req.body.title,
    description: req.body.description,
    image: req.body.image,
    location: req.body.location,
    address: req.body.address,
    creator: req.body.creator,
  });

  creatorExist.places.push(createdPlace.id);
  await creatorExist.save({ validateBeforeSave: false });

  res.status(201).json({
    status: "success",
    data: createdPlace,
  });
});

exports.getAllPlaces = async (req, res, next) => {
  const allPlaces = await Place.find().select("-__v");

  if (allPlaces.length === 0) {
    return next(new AppError("No places found! Add a place now.", 404));
  }

  res.json({
    status: "success",
    results: allPlaces.length,
    data: allPlaces,
  });
};

exports.getPlaceById = catchAsync(async (req, res, next) => {
  const placeId = req.params.pId;

  const place = await Place.findById(placeId);

  if (!place) {
    return next(
      new AppError("Could not find a place for the provided ID", 404)
    );
  }

  res.status(200).json({
    status: "success",
    data: place,
  });
});

//As one user can have multiple places
exports.getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uId;

  const places = await Place.find({ creator: userId });

  if (places.length === 0) {
    return next(
      new AppError(
        "Could not find places ceated by the user of provided ID",
        404
      )
    );
  }

  res.json({
    status: "success",
    resutls: places.length,
    data: places,
  });
};

exports.updatePlace = catchAsync(async (req, res, next) => {
  const placeId = req.params.pId;
  // const { title, description, coordinates, address } = req.body

  const updatedPlace = await Place.findByIdAndUpdate(
    placeId,
    {
      title: req.body.title,
      description: req.body.description,
    },
    {
      new: true,
      validateBeforeSave: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: updatedPlace,
  });
});

exports.deletePlace = catchAsync(async (req, res, next) => {
  const placeId = req.params.pId;

  const place = await Place.findByIdAndDelete(placeId);
  const image = place.image;

  let creatorId = place.creator;

  const user = await User.findById(creatorId);

  var index = user.places.indexOf(placeId);

  if (index > -1) {
    user.places.splice(index, 1);
    await user.save({ validateBeforeSave: false });
  }

  fs.unlink(`public/img/${image}`, (err) => {
    console.log(err);
  });

  res.status(200).json({
    status: "success",
  });
});
