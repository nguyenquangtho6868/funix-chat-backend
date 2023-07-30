const mongoose = require('mongoose');

const { Schema } = mongoose;

// Khi muốn ref đến model khác thì phải đặt tên trường và ref giống với tên collection muốn hướng tới 
// và populate về sau
const RoomChatSchema = new Schema({
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    is_history: { type: Boolean, default: false},
    start_date: { type: String },
    end_date: { type: String },
    rate: { type: Number, default: 5},
    status: { type: String },
    courses: { type: mongoose.Schema.Types.ObjectId, ref: "courses" },
});

const RoomChatModel = mongoose.model('rooms', RoomChatSchema);
module.exports = RoomChatModel;