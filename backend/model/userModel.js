const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  role: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
