const mongoose = require("mongoose");

const { Schema } = mongoose;

const CourseSchema = new Schema({
  name: String,
  code: String,
  popup: String,
  blocks: String,
});

const CourseModel = mongoose.model("courses", CourseSchema);
module.exports = CourseModel;
