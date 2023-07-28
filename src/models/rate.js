const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema({
  student: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  mentor: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  rate: String,

  room: [{ type: mongoose.Schema.Types.ObjectId, ref: "rooms" }],
});

const RateModel = mongoose.model("rates", UserSchema);
module.exports = RateModel;
