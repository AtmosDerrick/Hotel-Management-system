const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "place",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "owner",
    },

    user: { type: mongoose.Schema.Types.ObjectId, required: true },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

const BookingModel = mongoose.model("Booking", bookingSchema);
module.exports = BookingModel;
