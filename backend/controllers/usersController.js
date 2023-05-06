const { json } = require("express");
const User = require("../model/userModel");
const Place = require("../model/placeModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const imageDownloader = require("image-downloader");
const fs = require("fs");
const path = require("path");
const Booking = require("../model/BookingModel");
//secrete for web cookie
const jwtSecrete = "dfgsfgbffgsrgr555";

module.exports.register = async (req, res) => {
  //bycrypt string password
  const bcryptSalt = await bcrypt.genSalt(10);

  const { name, email, password } = req.body;
  try {
    const userDoc = await User.create({
      name,
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
      const { name, email, _id } = await User.findById(userData.id);

      res.json({ name, email, _id });
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
  const { token } = req.cookies;
  jwt.verify(token, jwtSecrete, {}, async (err, userData) => {
    const { id } = userData;
    res.json(await Place.find({ owner: id }));
  });
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

module.exports.booking = (req, res) => {
  const { place, checkIn, checkOut, numberOfGuest, mobile, price, name } =
    req.body;
  Booking.create({
    place,
    checkIn,
    checkOut,
    numberOfGuest,
    mobile,
    name,
    price,
  })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      throw err;
    });
};
