import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    examName: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    examDate: { type: Date},
    examType: { 
      type: String, 
      enum: ["quiz", "midterm", "final"],
      required: true 
    },
    status: { 
      type: String, 
      enum: ["pending", "completed", "upcoming"], 
      default: "pending" 
    },
    duration: { type: Number},
    instructions: { type: String },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question"}],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }
  },
  { timestamps: true }
);

export default mongoose.models.Exam || mongoose.model("Exam", examSchema);