const axios = require("axios");
const fetch = require("fetch");
const AppError = require("./AppError");
const catchAsync = require("../utils/catchAsync");

const getCoordsForAddress = async function (address) {
  let params = {
    access_key: process.env.POSITIONSTACK_API_KEY,
    query: address,
  };

  const response = await axios.get("http://api.positionstack.com/v1/forward", {
    params,
  });

  const data = await response.data;

  if (data.length <= 0) {
    return new AppError("Sorry no data found with that address!", 404);
  }

  let lat = data.data[0].latitude;
  let lng = data.data[0].longitude;

  const coordinates = {
    lat,
    lng,
  };

  return coordinates;
};

module.exports = getCoordsForAddress;
