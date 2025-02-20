import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  degreeLevel: { type: String, required: true },
  department: { type: String, required: true },
  photo: { type: String },

  phoneNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true},
  password: { type: String, required: true },
  roomNumber: { type: String },

  schools: [
    {
      degree: { type: String, required: true }, 
      name: { type: String, required: true }
    }
  ],

  expertiseAreas: [{ type: String }],

  courses: [
    {
      courseName: { type: String, required: true },
      courseCode: { type: String, required: true },
      description: { type: String, required: true },
      exams: [{ type: String }] 
    }
  ],

  officeHours: [
    {
      day: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    }
  ],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
});

export default mongoose.models.teacher || mongoose.model("teacher", teacherSchema);