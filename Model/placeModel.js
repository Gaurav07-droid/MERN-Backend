const mongoose = require("mongoose");
const validator = require("validator");

const placeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title for a place."],
    },
    address: {
      type: String,
      required: [true, "Please add address for a place."],
    },
    image: {
      type: String,
      // required: [true, "A place must have a image"],
    },
    description: {
      type: String,
      required: [true, "Please add a description for a place."],
      minLength: [5, "Place description must be greater than 5 characters."],
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    creator: {
      type: mongoose.Types.ObjectId,
      required: [true, "Place must be belongs to a user."],
      ref: "User",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

placeSchema.indexes({ title: 1, location: 1, creator: 1 }, { unique: true });

// placeSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "creator",
//     select: "name image",
//   });
//   next();
// });

const Place = mongoose.model("Place", placeSchema);

module.exports = Place;
