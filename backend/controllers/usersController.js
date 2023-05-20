const { json } = require("express");
const User = require("../model/userModel");
const Place = require("../model/placeModel");
const Owner = require("../model/ownerModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const imageDownloader = require("image-downloader");
const fs = require("fs");
const path = require("path");
const Booking = require("../model/BookingModel");
const UserFavPlace = require("../model/userFavPlace");
const RoomAvailability = require("../model/roomAvailabilityModel");
const Review = require("../model/reviewModel");
//secrete for web cookie
const jwtSecrete = "dfgsfgbffgsrgr555";

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecrete, {}, async (err, userData) => {
      if (err) throw err;
      resolve(userData);
    });
  });
}

module.exports.register = async (req, res) => {
  //bycrypt string password
  const bcryptSalt = await bcrypt.genSalt(10);

  const { name, role, email, password } = req.body;
  try {
    const userDoc = await User.create({
      name,
      role,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email });
  if (userDoc) {
    const passwordOK = bcrypt.compareSync(password, userDoc.password);
    if (passwordOK) {
      jwt.sign(
        { email: userDoc.email, id: userDoc._id },
        jwtSecrete,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json(userDoc);
        }
      );
    } else {
      res.status(422).json("pass not ok");
    }
  } else {
    res.json("not found");
  }
};

module.exports.profile = (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecrete, {}, async (err, userData) => {
      if (err) throw err;
      const { name, email, _id, role } =
        (await User.findById(userData.id)) ||
        (await Owner.findById(userData.id));
      res.json({ name, email, _id, role });
    });
  } else {
    res.json(null);
  }
};

module.exports.logout = (req, res) => {
  res.cookie("token", "").json(true);
};

module.exports.uploadByLink = async (req, res) => {
  const { link } = req.body;
  const newName = "photo" + Date.now() + ".jpg";
  let imagefile = path.join(__dirname, "../uploads", newName);

  await imageDownloader.image({
    url: link,
    dest: imagefile,
  });

  console.log(imagefile);

  res.json(newName);
};

module.exports.uploadManualPhoto = (req, res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname } = req.files[i];
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];

    const newPath = path + "." + ext;
    fs.renameSync(path, newPath);

    uploadedFiles.push(
      newPath.replace(
        "C:\\Users\\AtmosTech\\Desktop\\PJCS\\learnMeanStack\\blogApp\\backend\\uploads\\",
        ""
      )
    );
  }
  res.json(uploadedFiles);
};

module.exports.places = (req, res) => {
  const { token } = req.cookies;
  const {
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuest,
    name,
    price,
  } = req.body;

  jwt.verify(token, jwtSecrete, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.create({
      owner: userData.id,
      title,
      address,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuest,
      name,
      price,
    });
    res.json(placeDoc);
  });
};

module.exports.getPlaces = (req, res) => {
  try {
    const { token } = req.cookies;
    jwt.verify(token, jwtSecrete, {}, async (err, userData) => {
      const { id } = userData;
      res.json(await Place.find({ owner: id }));
    });
  } catch {
    res.json("sign in");
  }
};

module.exports.getSinglePlace = async (req, res) => {
  const { id } = req.params;
  res.json(await Place.findById(id));
};

module.exports.updatePlace = async (req, res) => {
  const { token } = req.cookies;
  const {
    id,
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuest,
    name,
    price,
  } = req.body;
  jwt.verify(token, jwtSecrete, {}, async (err, userData) => {
    const placeDoc = await Place.findById(id);

    if (userData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuest,
        name,
        price,
      });
      await placeDoc.save();
      res.json("ohk");
    }
  });
};

module.exports.userPlaces = async (req, res) => {
  res.json(await Place.find());
};

module.exports.booking = async (req, res) => {
  const userData = await getUserDataFromReq(req);
  const {
    place,
    owner,
    checkIn,
    checkOut,
    numberOfGuest,
    mobile,
    price,
    name,
  } = req.body;
  Booking.create({
    place,
    owner,
    checkIn,
    checkOut,
    numberOfGuest,
    mobile,
    name,
    price,
    user: userData.id,
  })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      throw err;
    });
};

module.exports.getBookings = async (req, res) => {
  const userData = await getUserDataFromReq(req);
  res.json(await Booking.find({ user: userData.id }).populate("place"));
};

module.exports.bookingRecieve = async (req, res) => {
  const userData = await getUserDataFromReq(req);
  res.json(await Booking.find({ owner: userData.id }).populate("place"));
};

module.exports.activeBooking = async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);
    const currentServerDate = new Date();

    const data = await Booking.find({ user: userData.id }).populate("place");

    const activeData = data.filter((info) => {
      // Extract the date part only (without time)
      const checkInDate = new Date(info.checkIn.toDateString());
      console.log({ checkInDate });
      // Extract the date part only (without time) from the current server date
      const currentServerDateOnly = new Date(currentServerDate.toDateString());
      console.log({ currentServerDateOnly });

      return checkInDate.getTime() >= currentServerDateOnly.getTime();
    });

    res.json(activeData);
  } catch (error) {
    console.log("Error retrieving active bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.owneractiveBooking = async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);
    const currentServerDate = new Date();

    const data = await Booking.find({ owner: userData.id }).populate("place");

    const activeData = data.filter((info) => {
      // Extract the date part only (without time)
      const checkInDate = new Date(info.checkIn.toDateString());
      console.log({ checkInDate });
      // Extract the date part only (without time) from the current server date
      const currentServerDateOnly = new Date(currentServerDate.toDateString());
      console.log({ currentServerDateOnly });

      return checkInDate.getTime() >= currentServerDateOnly.getTime();
    });

    res.json(activeData);
  } catch (error) {
    console.log("Error retrieving active bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.userFavPlace = async (req, res) => {
  const userData = await getUserDataFromReq(req);
  const { place, owner } = req.body;
  UserFavPlace.create({
    place,
    owner,
    user: userData.id,
  })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      throw err;
    });
};

module.exports.deleteUserFavPlace = async (req, res) => {
  const { placeId } = req.params; // Assuming the place ID is passed as a route parameter
  console.log(placeId);

  try {
    const deletedPlaces = await UserFavPlace.findOneAndDelete({
      place: placeId,
    });
    res.json(deletedPlaces);
  } catch (error) {
    console.error("Error deleting places:", error);
    res.status(500).json({ message: "Failed to delete places" });
  }
};

module.exports.getFavouritePlace = async (req, res) => {
  const userData = await getUserDataFromReq(req);
  res.json(await UserFavPlace.find({ user: userData.id }).populate("place"));
};

module.exports.roomAvailable = async (req, res) => {
  const userData = await getUserDataFromReq(req);
  const { roomAvailable } = req.body;

  // Check if the user already has a document in the collection
  const existingDocument = await RoomAvailability.findOne({
    user: userData.id,
  });

  if (existingDocument) {
    // Update the existing document with the new array
    existingDocument.roomAvailable = roomAvailable;
    await existingDocument.save();

    res.json(existingDocument);
  } else {
    // Create a new document for the user
    const newDocument = new RoomAvailability({
      roomAvailable,
      user: userData.id,
    });

    await newDocument.save();

    res.json(newDocument);
  }
};

module.exports.getRoomAvailability = async (req, res) => {
  const userData = await getUserDataFromReq(req);

  try {
    const roomAvailability = await RoomAvailability.findOne({
      user: userData.id,
    });

    if (roomAvailability) {
      res.json(roomAvailability.roomAvailable);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.clientRoomAvailability = async (req, res) => {
  try {
    const roomAvailabilities = await RoomAvailability.find();

    if (roomAvailabilities.length > 0) {
      const roomAvailable = roomAvailabilities.map(
        (roomAvailability) => roomAvailability.roomAvailable
      );
      res.json(roomAvailable);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.reviewAndComment = async (req, res) => {
  const userData = await getUserDataFromReq(req);
  const { place, rating, comment, name } = req.body;
  Review.create({
    place,
    name,
    rating,
    comment,
    user: userData.id,
  })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      throw err;
    });
};

module.exports.getReviewAndRating = async (req, res) => {
  const { placeId } = req.params;
  console.log({ placeId });
  res.json(await Review.find({ place: placeId }));
};
