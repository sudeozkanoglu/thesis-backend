import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  examName: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true }, // Course ID'ye referans
});

export default mongoose.models.Exam || mongoose.model("Exam", examSchema);