import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  courseCode: { type: String, required: true, unique: true },
  description: { type: String },
  exams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }] // Exam koleksiyonuna referans
});

export default mongoose.models.Course || mongoose.model("Course", courseSchema);