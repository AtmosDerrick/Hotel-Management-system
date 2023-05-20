const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

const UserFavPlace = mongoose.model("favourite", favouriteSchema);
module.exports = UserFavPlace;
