const express = require("express");

const router = express.Router();

const userController = require("../Controller/userController");
const authController = require("../Controller/authController");
const middleware = require("../middleware/file-upload");

router
  .route("/signup")
  .post(middleware.uploadPhoto, middleware.resizePhoto, authController.signup);
router.route("/login").post(authController.login);

router.route("/").get(userController.getAllUsers);

router.use(authController.protect);

router
  .route("/:uId")
  .get(userController.getAUser)
  .delete(userController.deletUser);

module.exports = router;
