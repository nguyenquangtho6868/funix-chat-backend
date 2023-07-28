const Rate = require("../models/rate");
class RateControler {
  async addRate(req, res) {
    try {
      const { student, mentor, rate, room } = req.body;

      console.log({ student }, { mentor }, { rate }, { room });
      const newRate = await Rate.create({
        student: student,
        mentor: mentor,
        rate: rate,
        room: room,
      });
      res.json({
        message: "Add User Successfully!",
        data: newRate,
        statusCode: 200,
      });
    } catch (e) {
      res.status(422).json(e);
    }
  }
  async getMentorDetail(req, res) {
    try {
      const { id } = req.body;
      console.log(id);
      const mentorDetail = await Rate.find({ mentor: id });
      console.log(mentorDetail);
      const a = mentorDetail.map((mentor) => Number(mentor.rate));
      console.log(a);
      const b = a.reduce((c, b) => (c + b) / a.length);
      console.log(b);
      res.json({
        message: "Get User Detail Successfully!",
        data: b,
        statusCode: 200,
      });
    } catch (e) {
      res.status(422).json(e);
    }
  }
}

module.exports = new RateControler();
