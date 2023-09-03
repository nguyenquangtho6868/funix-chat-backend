const CourseModal = require("../models/course");
const UserModal = require("../models/user");

class CourseController {
  async addCourse(req, res) {
    try {
      const { name, code, popup, blocks } = req.body;
      console.log(req.body);
      const newCourse = await CourseModal.create({
        name,
        code,
        popup,
        blocks,
      });
      res.json({
        message: "Add Course Successfully!",
        data: newCourse,
        statusCode: 200,
      });
    } catch (e) {
      res.status(422).json(e);
    }
  }

  async getListCourse(req, res) {
    try {
      const listCourse = await CourseModal.find({});
      res.json({
        message: "Get List Course Successfully!",
        data: listCourse,
        statusCode: 200,
      });
    } catch (e) {
      res.status(422).json(e);
    }
  }

  async getListCourseDetail(req, res) {
    try {
      const { course_id, userId } = req.body;
      console.log("41", req.body);
      if (course_id) {
        const course = await CourseModal.find({ _id: course_id });
        return res.json({
          message: "Get Course Successfully!",
          data: course,
          statusCode: 200,
        });
      } else {
        const data = await UserModal.findOne({ _id: userId });
        return res.json({
          message: "Get Courses Successfully!",
          data: data.courses,
          statusCode: 200,
        });
      }
    } catch (e) {
      res.status(422).json(e);
    }
  }

  async deleteCourse(req, res) {
    try {
      const { id } = req.body;
      await CourseModal.deleteOne({ _id: id });
      res.json({ message: "Delete Course Successfully!", statusCode: 200 });
    } catch (e) {
      res.status(422).json(e);
    }
  }

  async editCourse(req, res) {
    try {
      const { id, name, code, popup, blocks } = req.body;
      console.log(req.body);
      const newData = {
        name: name,

        code: code,
        popup: popup,
        blocks: blocks,
      };
      await CourseModal.findByIdAndUpdate({ _id: id }, newData, { new: true });
      res.json({ message: "Edit User Successfully!", statusCode: 200 });
      console.log("ok");
    } catch (e) {
      res.status(422).json(e);
    }
  }
}

module.exports = new CourseController();
