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
//owner register
module.exports.ownerRegister = async (req, res) => {
  //bycrypt string password
  const bcryptSalt = await bcrypt.genSalt(10);

  const { name, role, email, password } = req.body;
  try {
    const userDoc = await Owner.create({
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

//owner login
module.exports.ownerLogin = async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await Owner.findOne({ email });
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
