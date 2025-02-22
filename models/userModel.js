import mongoose from "mongoose";

const options = { discriminatorKey: "userType", collection: "users" };

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  options
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

const teacherSchema = new mongoose.Schema({
  degreeLevel: { type: String, required: true },
  department: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  roomNumber: { type: String },
  schools: [
    {
      degree: { type: String, required: true },
      name: { type: String, required: true },
    },
  ],
  expertiseAreas: [{ type: String }],
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  officeHours: [
    {
      day: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
  ],
});

const Teacher = User.discriminator("Teacher", teacherSchema);

const studentSchema = new mongoose.Schema({
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});

const Student = User.discriminator("Student", studentSchema);

export { User, Teacher, Student };
