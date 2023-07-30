const loginController = require("../controllers/AuthController");
const userController = require("../controllers/UserController");
const AuthMiddleware = require("../middleware/authMiddleware");
const CourseController = require("../controllers/CourseController");
const NotificationController = require("../controllers/notificationController");
const RoomChatController = require("../controllers/RoomChatController");
const path = require("path");
const filePath = path.join(__dirname, "../public/index.ejs");

function route(app) {
  // login and user
  app.post("/login", loginController.loginHandle);
  app.get(
    "/get-list-user",
    AuthMiddleware.authLoginNoRole,
    userController.getListUser
  );
  app.post("/add-user", AuthMiddleware.authLoginNoRole, userController.addUser);

  app.post("/reset-password", userController.resetPassword);
  app.post('/edit-image-user',AuthMiddleware.authLoginNoRole,userController.editImageUser);
  app.delete(
    "/delete-user",
    AuthMiddleware.authLoginNoRole,
    userController.deleteUser
  );
  app.put(
    "/edit-user",
    AuthMiddleware.authLoginNoRole,
    userController.editUser
  );
  app.post(
    "/get-user-detail",
    AuthMiddleware.authLoginNoRole,
    userController.getUserDetail
  );

  // Courses
  app.get(
    "/get-list-course",
    AuthMiddleware.authLoginNoRole,
    CourseController.getListCourse
  );
  app.post(
    "/get-list-course-detail",
    AuthMiddleware.authLoginNoRole,
    CourseController.getListCourseDetail
  );
  app.post(
    "/add-course",
    AuthMiddleware.authLoginNoRole,
    CourseController.addCourse
  );
  app.delete(
    "/delete-course",
    AuthMiddleware.authLoginNoRole,
    CourseController.deleteCourse
  );
  
  app.post('/get-history-room-chat',AuthMiddleware.authLoginNoRole,RoomChatController.getHistoryRoomChatWithUserID);

  // Chat room
  app.post(
    "/get-room-chat",
    AuthMiddleware.authLoginNoRole,
    RoomChatController.getRoomChat
  );
  app.post(
    "/get-room-chat-detail",
    AuthMiddleware.authLoginNoRole,
    RoomChatController.getRoomChatDetail
  );
  app.post(
    "/end-room-chat-detail",
    AuthMiddleware.authLoginNoRole,
    RoomChatController.endRoomChatDetail
  );
  app.post(
    "/get-room-chat-check-user-id",
    AuthMiddleware.authLoginNoRole,
    RoomChatController.getRoomCheckUserId
  );

  // Notification
  app.post(
    "/get-list-notification",
    AuthMiddleware.authLoginNoRole,
    NotificationController.getNotificationDetail
  );
  app.post("/post-rate-room-chat", RoomChatController.postRateRoomChat);
}
module.exports = route;
