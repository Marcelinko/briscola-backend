const express = require("express");
const router = express.Router();

const imageController = require("../controllers/imageController");

router.get("/avatars", imageController.getAvatars);

module.exports = router;
