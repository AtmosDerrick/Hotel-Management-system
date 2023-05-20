const mongoose = require("mongoose");

const roomAvailabilitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "owner",
    },

    roomAvailable: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
      ref: "place",
    },
  },
  { timestamps: true }
);

const RoomAvailable = mongoose.model(
  "roomAvailability",
  roomAvailabilitySchema
);
module.exports = RoomAvailable;
