const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const User = require("../Model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const signToken = catchAsync(async (userId, req, res) => {
  const user = await User.findById(userId);

  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.EXPIRES_IN,
  });

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true,
    httpOnly: true,
  });

  if (process.env.NODE_ENV === "production") res.cookie.secure = true;

  res.status(200).json({
    status: "success",
    token,
    data: user,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError("Please login to access this route!", 401));
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(
      new AppError("The user belonging to this token is no longer exist", 401)
    );
  }

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please login again", 401)
    );
  }

  req.user = freshUser;
  next();
});

exports.signup = catchAsync(async (req, res, next) => {
  // if (req.file) req.body.image = req.file.filename;
  const { name, image, email, password, passwordConfirm, passwordChangedAt } =
    req.body;

  const user = await User.create({
    name,
    email,
    image: req.file ? req.file.filename : "",
    password,
    passwordConfirm,
    passwordChangedAt,
  });

  signToken(user.id, req, res);

  // res.status(200).json({
  //   status: "success",
  //   data: user,
  // });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password required", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user)
    return next(
      new AppError("User not exist ! please sigunup and try again", 404)
    );

  const correctPass = await user.correctPassword(user.password, password);

  if (!correctPass) {
    return next(new AppError("Incorrect email of password! Try again", 403));
  }

  signToken(user.id, req, res);
});
