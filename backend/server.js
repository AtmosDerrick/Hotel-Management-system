const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const routes = require("../backend/routes/userRoute");
const cookieParser = require("cookie-parser");

mongoose.connect("mongodb://localhost:27017/hotelBooking");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use(routes);

app.get("/", (req, res) => {
  res.json("test ok");
});

app.listen(5000, () => {
  console.log("app running on port 5000...");
});
