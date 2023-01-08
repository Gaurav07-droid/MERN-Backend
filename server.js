const express = require("express");
const mongoose = require("mongoose");
const dotEnv = require("dotenv");

const app = express();

dotEnv.config({ path: "./config.env" });
const port = process.env.PORT;

const connectionString = process.env.Databse.replace(
  "<PASSWORD>",
  process.env.Database_password
);

mongoose.connect(connectionString, () => {
  console.log("Database connected successfully!");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}...`);
});

module.exports = app;
