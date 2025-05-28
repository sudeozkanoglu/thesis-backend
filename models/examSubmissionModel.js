import mongoose from "mongoose";

const examSubmissionSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        answer: {
          type: String,
          required: false,
          default: "",
        },
        score: {
          type: Number,
          required: true,
        },
      },
    ],
    overall_score: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
  },
  { timestamps: true }
);

export default mongoose.models.ExamSubmission ||
  mongoose.model("ExamSubmission", examSubmissionSchema);
