import { Student } from "../models/userModel.js";
import bcrypt from "bcryptjs";

// Tüm öğrencileri listeleme
const getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("courses", "courseName courseCode description");
    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Belirli bir öğrenciyi getirme
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id).populate(
      "courses",
      "courseName courseCode description"
    );
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    res.status(200).json({ success: true, student });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Öğrenci güncelleme
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, password, courses } = req.body;

    let updatedData = {
      firstName,
      lastName,
      email,
      courses, // courses alanı, ilgili Course ObjectId'lerini içermelidir
    };

    // Eğer şifre güncellenecekse, hash işlemi yapıyoruz
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(password, salt);
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true }
    ).populate("courses", "courseName courseCode description");
    if (!updatedStudent) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Öğrenci silme
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStudent = await Student.findByIdAndDelete(id);
    if (!deletedStudent) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { getStudents, getStudentById, updateStudent, deleteStudent };
