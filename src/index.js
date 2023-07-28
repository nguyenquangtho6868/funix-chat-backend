const express = require("express");
const app = express();

require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const router = require("./routes/index");
const Notification = require("./controllers/notificationController");
const RoomChatController = require("./controllers/RoomChatController");
const UserModel = require("./models/user");
const http = require("http");
app.set("public engine", "ejs");
app.use(express.static(__dirname + "/public"));

// Lấy đường dẫn thư mục hiện tại

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(
  cors({
    credentials: true,
    origin: "*",
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.json());

//List user online;
let users = [];

const addUser = async (userId, socketId) => {
  const getUserDetail = await UserModel.findOne({ _id: userId });
  !users.some((item) => item.user?._id == userId) &&
    users.push({ user: getUserDetail, socketId });
  console.log(users);
};

const filterUser = async (data) => {
  const newUsers = users.filter(
    (obj) =>
      obj.user.courses?.some((item) => item._id === data.courseId) &&
      obj.user.role !== "STUDENT"
  );
  io.emit(`get-users-filter/${data.userId}`, newUsers);
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

mongoose
  .connect(process.env.MONGOOSE_URL)
  .then(() => {
    console.log("Connect to MonDu successfully!");
    io.on("connection", (socket) => {
      socket.on("post-notification", (rs) => {
        Notification.addNotification(rs, io);
      });

      socket.on("request-delete-notification", (id) => {
        Notification.getNotificationDelete(id, io);
      });

      socket.on("change-new-notification", (data) => {
        Notification.changeNewNotification(data, io);
      });

      socket.on("mentor-support-now", (data) => {
        RoomChatController.addRoomChat(data, io);
      });

      socket.on("send-message", (data) => {
        RoomChatController.sendMessage(data, io);
      });

      socket.on("end-conversation", (id) => {
        io.emit(`end-conversation-success/${id}`);
      });

      //take userId and socketId from user
      socket.on("addUser", async (userId) => {
        await addUser(userId, socket.id);
        io.emit("getUsers", users);
      });

      //filter user
      socket.on("filter-mentor", (data) => {
        filterUser(data);
      });

      //when disconnect
      socket.on("disconnect", () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users);
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });

router(app);

server.listen(process.env.PORT || 4001, () => {
  console.log("listening on *:4001");
});
