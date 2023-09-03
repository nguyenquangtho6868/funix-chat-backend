const mongoose = require("mongoose");

const { Schema } = mongoose;

// Khi muốn ref đến model khác thì phải đặt tên trường và ref giống với tên collection muốn hướng tới
// và populate về sau
const RoomChatSchema = new Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],

  is_history: { type: Boolean, default: false },
  start_date: { type: String },
  accepted_date: { type: String },
  end_date: { type: String },
  clock: { type: Number, default: 0 },
  questions: { type: String, default: "1" },
  helpFul: { type: Boolean, default: false },
  blocks: { type: String, default: 0 },
  rate: { type: Number, default: 5 },
  status: { type: String },
  type: { type: String, default: "Livechat" },
  courses: { type: mongoose.Schema.Types.ObjectId, ref: "courses" },
});

const RoomChatModel = mongoose.model("rooms", RoomChatSchema);
module.exports = RoomChatModel;
