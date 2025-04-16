import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    explanation: { type: String },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    audioUrl: { type: String,required: false},
    hasGeneratedAudio: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.Question || mongoose.model("Question", questionSchema);