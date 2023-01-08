const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a title for a place."],
    },
    email: {
      type: String,
      required: [true, "Please provide your email."],
      unique: [true, "Email already resgistered! Please use another one"],
      validate: [validator.isEmail, "Please provide an valid Email"],
    },
    image: {
      type: String,
      required: [true, "A user must have a image"],
    },
    password: {
      type: String,
      select: false,
      required: [true, "Please provide a password."],
      minLength: [8, "password must be less the 8 characters."],
    },
    passwordConfirm: {
      type: String,
      // required: [true, "Please confirm you password."],
      validate: {
        validator: function (pass) {
          return this.password === pass;
        },
        message: "Password doesn\t match! Try again",
      },
    },
    places: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Place",
      },
    ],
    passwordChangedAt: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async function (origPass, userPass) {
  return await bcrypt.compare(userPass, origPass);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
