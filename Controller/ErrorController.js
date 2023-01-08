const fs = require("fs");

const AppError = require("../utils/AppError");

const handleJwtError = () => {
  return new AppError("Invalid token! Please login again!", 401);
};

const handleJwtExpiredError = () => {
  return new AppError("Your token has been expired! Please login again!", 401);
};

const handleCastError = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Invalid ${value}`;

  return new AppError(message, 400);
};

const handleDuplicateError = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `${
    value.includes("@")
      ? "Email already registered, Please try another one!"
      : "Place alreday added, Please add another one!"
  } `;
  return new AppError(message, 400);
};
const handleMongoValidationError = (err) => {};

const sendErrorProd = (req, res, err) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong! Please try again later",
    });
  }
};

const sendErrorDev = (req, res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    err,
  });
};

const globalErrorHandler = (error, req, res, next) => {
  if (req.file) {
    fs.unlink(`public/img/${req.file.filename}`, (err) => {
      console.log(err);
    });
  }

  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(req, res, error);
  } else if (process.env.NODE_ENV === "production") {
    if (error.name === "CastError") error = handleCastError(error);
    if (error.name === "ValidationError")
      error = handleMongoValidationError(error);
    if (error.name === "JsonWebTokenError") error = handleJwtError();
    if (error.name === "TokenExpiredError") error = handleJwtExpiredError();
    if (error.code === 11000) error = handleDuplicateError(error);

    sendErrorProd(req, res, error);
  }
};

module.exports = globalErrorHandler;
