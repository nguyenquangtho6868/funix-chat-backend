const mongoose = require('mongoose');

const { Schema } = mongoose;

const RoomChatSchema = new Schema({
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    is_history: { type: Boolean, default: false},
    start_date: String,
    end_date: String
});

const RoomChatModel = mongoose.model('rooms', RoomChatSchema);
module.exports = RoomChatModel;