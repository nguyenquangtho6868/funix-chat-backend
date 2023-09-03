const mongoose = require("mongoose");

const { Schema } = mongoose;

const NotificationSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "users" },

  question: { type: String, required: true },
  description: { type: String, required: true },
  course: { type: Schema.Types.ObjectId, ref: "courses" },
  room: { type: Schema.Types.ObjectId, ref: "rooms" },
  file: {},
  createdAt: { type: String, required: true },
});

const NotificationModel = mongoose.model("notification", NotificationSchema);
module.exports = NotificationModel;
