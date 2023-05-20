const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },

    name: {
      type: String,
      required: true,
    },

    place: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "place",
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("review", reviewSchema);
module.exports = Review;
