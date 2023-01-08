const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

const PlaceController = require("../Controller/PlaceController");
const authController = require("../Controller/authController");
const middleware = require("../middleware/file-upload");
// const { router } = require("../server");

router.route("/user/:uId").get(PlaceController.getPlacesByUserId);

router.use(authController.protect);

router
  .route("/")
  .get(PlaceController.getAllPlaces)
  .post(
    middleware.uploadPhoto,
    middleware.resizePhoto,
    [
      check("title").not().isEmpty(),
      check("description").isLength({ min: 10 }),
      check("address").not().isEmpty(),
    ],
    PlaceController.createPlace
  );

router
  .route("/:pId")
  .get(PlaceController.getPlaceById)
  .patch(
    [
      check("title").not().isEmpty(),
      check("description").isLength({ min: 10 }),
    ],
    PlaceController.checkAuthority,
    PlaceController.updatePlace
  )
  .delete(PlaceController.checkAuthority, PlaceController.deletePlace);

module.exports = router;
