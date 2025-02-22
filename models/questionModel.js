import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    explanation: { type: String },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true }
  },
  { timestamps: true }
);

export default mongoose.models.Question || mongoose.model("Question", questionSchema);