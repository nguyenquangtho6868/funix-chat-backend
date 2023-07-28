const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  content: { type: Array, required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "rooms" },
  createdAtDay: { type: String, required: true },
  createdAtTime: { type: String, required: true },
});

const MessageModel = mongoose.model("messages", messageSchema);
module.exports = MessageModel;
