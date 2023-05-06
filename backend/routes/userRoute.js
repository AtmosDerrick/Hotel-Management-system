const { Router } = require("express");
const {
  register,
  login,
  profile,
  logout,
  uploadByLink,
  uploadManualPhoto,
  places,
  getPlaces,
  getSinglePlace,
  updatePlace,
  userPlaces,
  booking,
} = require("../controllers/usersController");
const multer = require("multer");
const path = require("path");

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", profile);
router.post("/logout", logout);
router.post("/upload-by-link", uploadByLink);

let imagefile = path.join(__dirname, "../uploads/");

//middleware for uploading images

const photoMiddleware = multer({ dest: imagefile });

router.post("/upload", photoMiddleware.array("photos", 100), uploadManualPhoto);
router.post("/place", places);
//route to get place
router.get("/places", getPlaces);
router.get("/places/:id", getSinglePlace);
router.put("/places", updatePlace);
router.get("/user-places", userPlaces);
router.post("/bookings", booking);

module.exports = router;
