const Notification = require("../models/notification");
const RoomChatModel = require("../models/roomChat");
const MessageModel = require("../models/message");
const UserModel = require("../models/user");

class NotificationController {
  async addNotification(rs, io) {
    const countdown = 60000;
    const {
      question,
      user_id,
      description,
      course_id,
      file,
      start_date,
      emailStudent,
    } = rs.data;
    const date = new Date(Date.now());
    const createdAtDay = date.toLocaleDateString([], {
      timeZone: "Asia/Saigon",
    });
    const createdAtTime = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Saigon",
    });
    const room = await RoomChatModel.create({
      users: [user_id],
      start_date,
      courses: course_id,
      emailStudent: emailStudent,
    });
    await MessageModel.create({
      sender: user_id,
      content: [
        { value: `Câu hỏi : ${question}`, is_file: false },
        { value: `Mô tả : ${description}`, is_file: false },
      ],
      room: room._id,
      createdAtDay,
      createdAtTime,
    });
    const newNotification = await Notification.create({
      sender: user_id,
      question: question,
      description: description,
      course: course_id,
      room: room._id,
      file: {},
      createdAt: createdAtDay + "-" + createdAtTime,
    });
    await UserModel.updateMany(
      { role: { $in: ["MENTOR", "ADMIN"] }, "courses._id": `${course_id}` },
      { $set: { "courses.$.new_notification": true } }
    );
    io.emit(`get-create-notification/${course_id}`, newNotification);
    io.emit(`get-create-notification-all`, rs.mentors);
    io.emit(`create-room-chat/${user_id}`, {
      room_id: room._id,
      sender_id: user_id,
    });
    setTimeout(async () => {
      const checkNotification = await Notification.findOne({
        _id: newNotification._id,
      });
      if (checkNotification) {
        await Notification.deleteOne({ _id: newNotification._id });
        await RoomChatModel.updateOne({ _id: room._id }, { is_history: true });
        io.emit("delete-notification", newNotification._id);
        io.emit(`exit-room-cause-no-mentor/${user_id}`);
      }
      return;
    }, countdown);
  }

  async getNotificationDetail(req, res) {
    try {
      const { id } = req.body;
      const listNotification = await Notification.find({ course: id });
      res.json({
        message: "Get list notification Successfully!",
        data: listNotification,
        statusCode: 200,
      });
    } catch (e) {
      res.status(422).json(e);
    }
  }

  async getNotificationDelete(id, io) {
    const checkNotification = await Notification.findOne({ _id: id });
    if (checkNotification) {
      await Notification.deleteOne({ _id: id });
      io.emit("delete-notification", id);
    }
    return;
  }

  async changeNewNotification(data, io) {
    await UserModel.updateOne(
      { _id: data.userId, "courses._id": `${data.courseId}` },
      { $set: { "courses.$.new_notification": false } }
    );
    const getUserModify = await UserModel.findOne({ _id: data.userId });
    if (getUserModify)
      io.emit(`change-new-notification-success/${data.userId}`, getUserModify);
  }
}

module.exports = new NotificationController();
