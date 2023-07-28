const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const jwtSecret = "askdkasdkaskdkasdk";

class AuthController {
  async loginHandle(req, res) {
    console.log(req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const passwordhash = await bcrypt.compare(password, user.password);
      if (passwordhash) {
        // if(user.password === password) {
        jwt.sign(
          { email: user.email, id: user._id },
          jwtSecret,
          (err, token) => {
            if (err) throw err;
            res.cookie("token", token).json({
              message: "password ok",
              email: user.email,
              token: token,
              username: user.username,
              userId: user._id,
              role: user.role,
              courses: user.courses,
              statusCode: 200,
            });
          }
        );
      } else {
        res.status(422).json({ message: "password not ok", statusCode: 500 });
      }
    } else {
      res.status(422).json({ message: "account not ok", statusCode: 500 });
    }
  }
}

module.exports = new AuthController();
