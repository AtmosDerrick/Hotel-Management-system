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
  getBookings,
  bookingRecieve,
  activeBooking,
  owneractiveBooking,
  userFavPlace,
  deleteUserFavPlace,
  getFavouritePlace,
  roomAvailable,
  getRoomAvailability,
  clientRoomAvailability,
  reviewAndComment,
  getReviewAndRating,
} = require("../controllers/usersController");

const { ownerLogin, ownerRegister } = require("../controllers/ownerController");

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
router.get("/bookings", getBookings);
router.get("/activebooking", activeBooking);
router.post("/favourite", userFavPlace);
router.delete("/deletefavourite/:placeId", deleteUserFavPlace);
router.get("/getfavouriteplace", getFavouritePlace);
router.post("/roomavailability", roomAvailable);
router.get("/getroomavailability", getRoomAvailability);
router.get("/getforclientroomavailability", clientRoomAvailability);
router.post("/review", reviewAndComment);
router.get("/getuserrating/:placeId", getReviewAndRating);

//owner routes
router.post("/ownerregister", ownerRegister);
router.post("/ownerlogin", ownerLogin);
router.get("/bookingsrecieve", bookingRecieve);

router.get("/owneractivebooking", owneractiveBooking);

module.exports = router;
