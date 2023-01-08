const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = require("./server");

const morgan = require("morgan");
const cors = require("cors");

const globalErrorHandler = require("./Controller/ErrorController");
const AppError = require("./utils/AppError");

const placeRouter = require("./Routes/placeRoutes");
const userRouter = require("./Routes/userRoutes");

app.use(cookieParser());

app.use(bodyParser.json());

app.use("/public/img", express.static(path.join("public", "img")));
app.use(express.static(path.join("public")));

app.use(morgan("dev"));
app.use(cors());

app.use("/api/places", placeRouter);
app.use("/api/users", userRouter);

app.use((req, res, next) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

app.use("*", (req, res, next) => {
  return next(
    new AppError(`can not find ${req.originalUrl} on this server!`, 404)
  );
});

app.use(globalErrorHandler);
