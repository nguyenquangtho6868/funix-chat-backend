const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const EmailModel = require("../models/email");
const path = require("path");
const { getMaxListeners } = require("process");

const filePath = path.join(__dirname, "../public", "index.ejs");
console.log("Full file path:", filePath);
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mrtholoiabc@gmail.com",
    pass: "pbhckvjvhxzsirqv",
  },
});

class UserController {
  async addUser(req, res) {
    try {
      const { username, email, role, courses } = req.body;
      const user = await User.findOne({ email });
      if (user) {
        return res
          .status(422)
          .json({ message: "Your email must be a unique!", statusCode: 500 });
      }

      const chars =
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      const string_length = 8;
      let randomstring = "";

      for (var i = 0; i < string_length; i++) {
        let rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
      }
      const salt = await bcrypt.genSalt(6);
      const randomhash = await bcrypt.hash(randomstring, salt);
      console.log(randomhash);
      const newUser = await User.create({
        username: username,
        password: randomhash,
        email: email,
        role: role,
        courses: courses,
      });
      const passwordhash = await bcrypt.compare(randomstring, randomhash);
      console.log({ passwordhash });
      const mailOptions = {
        from: "thonqfx17090@funix.edu.vn",
        to: email,
        subject: "nodemailer test",
        text: "ok",
        html: ` <h1>Xin chào ${username}, Funix gửi tới bạn tài khoản web-chat với mentor có thông tin như sau : </h1>
           <h5>Tên tài khoản : ${email}</h5>
           <h5>Mật khẩu : ${randomstring}</h5>
             <div>
                 <h3>Chúc bạn sớm hoàn thành khóa học!</h3>
            </div>`,
      };
      transport.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent" + info.reponse);
        }
      });
      // EmailModel.api.emailsPost(
      //   EmailModel.email(newUser),
      //   (error, data, response) => {
      //     if (error) {
      //       console.error(error);
      //     } else {
      //       console.log("Email send successfully.");
      //     }
      //   }
      // );
      res.json({
        message: "Add User Successfully!",
        data: newUser,
        statusCode: 200,
      });
    } catch (e) {
      res.status(422).json(e);
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, password, id } = req.body;
      console.log({ email }, { password }, { id });
      const salt = await bcrypt.genSalt(6);
      const newPassword = await bcrypt.hash(password, salt);
      const newData = {
        password: newPassword,
      };
      await User.findByIdAndUpdate({ _id: id }, newData, { new: true });
      res.json({
        message: "Add User Successfully!",

        statusCode: 200,
      });
    } catch (e) {
      res.status(422).json(e);
    }
  }
  async getListUser(req, res) {
    try {
      const listUser = await User.find({});
      res.json({
        message: "Get List User Successfully!",
        data: listUser,
        statusCode: 200,
      });
    } catch (e) {
      res.status(422).json(e);
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.body;
      await User.deleteOne({ _id: id });
      res.json({ message: "Delete User Successfully!", statusCode: 200 });
    } catch (e) {
      res.status(422).json(e);
    }
  }

  async editUser(req, res) {
    try {
      const { id, username, email, role, courses } = req.body;
      const newData = {
        username: username,

        email: email,
        role: role,
        courses: courses,
      };
      await User.findByIdAndUpdate({ _id: id }, newData, { new: true });
      res.json({ message: "Edit User Successfully!", statusCode: 200 });
    } catch (e) {
      res.status(422).json(e);
    }
  }

  async getUserDetail(req, res) {
    try {
      const { id } = req.body;
      const userDetail = await User.findOne({ _id: id });
      res.json({
        message: "Get User Detail Successfully!",
        data: userDetail,
        statusCode: 200,
      });
    } catch (e) {
      res.status(422).json(e);
    }
  }
}

module.exports = new UserController();
