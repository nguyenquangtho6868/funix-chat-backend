const RoomChatModel = require("../models/roomChat");
const MessageModel = require("../models/message");
const { count } = require("../models/user");
const moment = require("moment");
class RoomChatController {
  constructor() {
    // Danh sách các phòng chat đang chờ và hẹn giờ đếm ngược tương ứng
  }
  async addRoomChat(data, io, socket) {
    // console.log(data.roomId);

    const room = await RoomChatModel.findOne({ _id: data.roomId });
    if (room.users.length > 1) {
      io.emit("quantity-room-chat-full");

      return;
    }
    // const updateStatus = {
    //   accepted_date: new Date(),
    //   status: "waiting",
    // };

    // await RoomChatModel.updateOne({ _id: data.room_id }, updateStatus, {
    //   new: true,
    // });
    await RoomChatModel.updateOne(
      { _id: data.roomId },
      {
        users: [...room.users, data.mentor_id],
        emailMentor: data.mentor,
        accepted_date: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        status: "waiting",
      }
    );

    io.emit(`join-room-chat-success/${data.mentor_id}`, data);
    io.emit(`mentor-in-room-chat/${data.roomId}`);
    const roomdate = await RoomChatModel.findOne({ _id: data.roomId });
    setInterval(() => {
      const date = moment(new Date())
        .format("YYYY-MM-DD HH:mm:ss")
        .split(" ")[1]
        .split(":");
      const hour = parseInt(date[0]);
      const minute = parseInt(date[1]);
      const second = parseInt(date[2]);
      const totalSecond = hour * 3600 + minute * 60 + second;

      io.emit("date", totalSecond);
    }, 1000);
  }

  async sendMessage(data, io) {
    const convertTime12to24 = (time12h) => {
      const [time, modifier] = time12h.split(" ");

      let [hours, minutes] = time.split(":");

      if (hours === "12") {
        hours = "00";
      }

      if (modifier === "PM") {
        hours = parseInt(hours, 10) + 12;
      }

      return `${hours}:${minutes}`;
    };
    const date = new Date(Date.now());
    const createdAtDay = date.toLocaleDateString([], {
      timeZone: "Asia/Saigon",
    });
    const createdAtTime = convertTime12to24(
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Saigon",
      })
    );

    const distanceTimeMessage =
      Number(createdAtTime?.slice(3)) -
        Number(data.prev_message?.createdAtTime?.slice(3)) || 6;
    if (
      data.sender === data.prev_message?.sender._id &&
      distanceTimeMessage <= 5
    ) {
      await MessageModel.updateOne(
        { _id: data.prev_message._id },
        {
          content: [...data.prev_message.content, data.content],
        }
      );

      const getDetailNewMessage = await MessageModel.find({
        _id: data.prev_message._id,
      }).populate("sender");
      io.emit("update-message", getDetailNewMessage);
    } else {
      const newMessage = await MessageModel.create({
        sender: data.sender,
        content: [data.content],
        room: data.room_id,
        createdAtDay,
        createdAtTime,
      });

      const getDetailNewMessage = await MessageModel.find(newMessage).populate(
        "sender"
      );
      io.emit("create-new-message", getDetailNewMessage);
    }
  }

  async getRoomChatDetail(req, res) {
    try {
      const { id } = req.body;
      if (!id) {
        return res
          .status(422)
          .json({ message: "Have no ID!", statusCode: 500 });
      }
      const getRoom = await RoomChatModel.find({ _id: id, is_history: false });
      if (getRoom.length === 1) {
        const messages = await MessageModel.find({ room: id }).populate(
          "sender"
        );
        res.json({
          message: "Get room chat Successfully!",
          data: messages,
          statusCode: 200,
        });
      } else {
        return res.status(422).json({
          message: "Have no room chat with this ID!",
          statusCode: 500,
        });
      }
    } catch (e) {
      res.status(422).json(e);
    }
  }

  async getRoomChat(req, res) {
    try {
      const { id } = req.body;
      if (!id) {
        return res
          .status(422)
          .json({ message: "Have no ID!", statusCode: 500 });
      }
      const getRoom = await RoomChatModel.findOne({
        _id: id,
        is_history: false,
      });
      console.log(getRoom);
      if (getRoom) {
        res.json({
          message: "Get room chat Successfully!",
          data: getRoom,
          statusCode: 200,
        });
      } else {
        res.json({
          message: "Get room chat Failed!",
          data: getRoom,
          statusCode: 500,
        });
      }
    } catch (e) {
      res.status(422).json(e);
    }
  }

  async getRoomCheckUserId(req, res) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res
          .status(422)
          .json({ message: "Have no ID!", statusCode: 500 });
      }
      const getRoom = await RoomChatModel.findOne({
        users: { $elemMatch: { $eq: userId } },
        is_history: false,
      });
      res.json({ message: "Successfully!", data: getRoom, statusCode: 200 });
    } catch (e) {
      res.status(422).json(e);
    }
  }

  async endRoomChatDetail(req, res) {
    try {
      const { end_date, roomId, status, block } = req.body;
      console.log(end_date, roomId, status, block);
      if (!roomId) {
        return res
          .status(422)
          .json({ message: "Have no ID!", statusCode: 500 });
      }
      await RoomChatModel.updateOne(
        { _id: roomId },
        { is_history: true, end_date, status, blocks: block }
      );
      res.json({ message: "End room chat Successfully!", statusCode: 200 });
    } catch (e) {
      res.status(422).json(e);
    }
  }

  async getHistoryRoomChatWithUserID(req, res) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res
          .status(422)
          .json({ message: "Have no ID!", statusCode: 500 });
      }
      const getRoom = await RoomChatModel.find({
        users: { $elemMatch: { $eq: userId } },
        is_history: true,
      }).populate(["users", "courses"]);
      if (getRoom) {
        res.json({
          message: "Get history chat Successfully!",
          data: getRoom,
          statusCode: 200,
        });
      } else {
        res.json({
          message: "Get history chat Failed!",
          data: getRoom,
          statusCode: 500,
        });
      }
    } catch (e) {
      res.status(422).json(e);
    }
  }

  async postRateRoomChat(req, res) {
    try {
      const { roomId, rate } = req.body;
      if (!roomId) {
        return res
          .status(422)
          .json({ message: "Have no room ID!", statusCode: 500 });
      }
      console.log(rate);
      await RoomChatModel.updateOne(
        { _id: roomId },
        {
          rate: rate,
        }
      );
      const getRoom = await RoomChatModel.findOne({ _id: roomId });
      console.log(getRoom);
      res.json({ message: "Update rate chat Successfully!", statusCode: 200 });
    } catch (e) {
      res.status(422).json(e);
    }
  }

  async getMessagesHistoryWithIdRoomChat(req, res) {
    try {
      const { roomId } = req.body;
      if (!roomId) {
        return res
          .status(422)
          .json({ message: "Have no room!", statusCode: 500 });
      }
      const messages = await MessageModel.find({ room: roomId }).populate(
        "sender"
      );
      res.json({
        message: "Get history chat Successfully!",
        data: messages,
        statusCode: 200,
      });
    } catch (e) {
      res.status(422).json(e);
    }
  }
  async getAllRoomChat(req, res) {
    try {
      console.log("ok");
      const data = await RoomChatModel.find()
        .sort({ start_date: -1 })
        .limit(20)
        .populate({
          path: "users",
          select: "email",
        })
        .populate({
          path: "courses",
          select: "code",
        });
      console.log(data);
      if (data) {
        res.json({
          message: "Get history chat Successfully!",
          data: data,
          statusCode: 200,
        });
      } else {
        res.json({
          message: "Get history chat Failed!",
          data: data,
          statusCode: 500,
        });
      }
    } catch (e) {
      res.status(422).json(e);
    }
  }
  async getFilterRoomChat(req, res) {
    try {
      const { mentor, xter, from, to, status } = req.query;
      console.log(req.query);
      const data = await RoomChatModel.find()
        .sort({ start_date: -1 })
        .populate({
          path: "users",
          select: "email",
        })
        .populate({
          path: "courses",
          select: "code",
        });
      const sort = data.sort(
        (a, b) => new Date(b.start_date) - new Date(a.start_date)
      );

      const filteredMentor =
        mentor !== ""
          ? sort.filter((item) => {
              if (item.users && item.users.length > 1 && item.users[1].email) {
                return item.users[1].email === mentor;
              }
              return false;
            })
          : sort;
      const filteredXter =
        xter !== ""
          ? filteredMentor.filter((item) => {
              if (item.users && item.users.length > 0 && item.users[0].email) {
                return item.users[0].email === xter;
              }
              return false;
            })
          : filteredMentor;
      const filteredFrom =
        from !== ""
          ? filteredXter.filter((item) => {
              if (item.start_date) {
                return item.start_date >= from;
              }
              return false;
            })
          : filteredXter;
      const filteredTo =
        to !== ""
          ? filteredFrom.filter((item) => {
              if (item.start_date) {
                return to >= item.start_date.split(" ")[0];
              }
              return false;
            })
          : filteredFrom;
      const filteredStatus =
        status !== ""
          ? filteredTo.filter((item) => {
              if (item.status) {
                return item.status.includes(status);
              }
              return false;
            })
          : filteredTo;
      if (data) {
        res.json({
          message: "Get history chat Successfully!",
          data: filteredStatus,
          statusCode: 200,
        });
      } else {
        res.json({
          message: "Get history chat Failed!",
          data: filteredTo,
          statusCode: 500,
        });
      }
    } catch (e) {
      res.status(422).json(e);
    }
  }
}

module.exports = new RoomChatController();
