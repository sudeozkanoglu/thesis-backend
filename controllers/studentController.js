import { Student } from "../models/userModel.js";
import Course from "../models/courseModel.js";
import Exam from "../models/examsModel.js";
import ExamSubmission from "../models/examSubmissionModel.js";
import bcrypt from "bcryptjs";

// Tüm öğrencileri listeleme
const getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate(
      "courses",
      "courseName courseCode description"
    );
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

const enrollInCourse = async (req, res) => {
  const { studentId } = req.params;
  const { courseId } = req.body;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (student.courses.includes(courseId)) {
      return res
        .status(400)
        .json({ message: "Student is already enrolled in this course" });
    }

    // ✅ Student tarafı
    student.courses.push(courseId);
    await student.save();

    // ✅ Course tarafı (EKLENEN KISIM)
    course.students = course.students || [];
    if (!course.students.includes(studentId)) {
      course.students.push(studentId);
      await course.save();
    }

    return res.status(200).json({ message: "Enrollment successful", student });
  } catch (error) {
    console.error("Enrollment error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getStudentCourses = async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await Student.findById(studentId).populate({
      path: "courses",
      populate: {
        path: "exams",
        select: "examName examDate examType",
      },
    });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      courses: student.courses,
    });
  } catch (error) {
    console.error("Error fetching student courses:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getExamsForStudent = async (req, res) => {
  const { studentId } = req.params;

  try {
    // 1. Öğrenciyi bul ve kurslarını al
    const student = await Student.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const courseIds = student.courses; // ObjectId[] listesi

    if (!courseIds || courseIds.length === 0) {
      return res.status(200).json({ success: true, exams: [] }); // hiç kurs yoksa boş dön
    }

    // 2. Bu kurslara ait sınavları al
    const exams = await Exam.find({ course: { $in: courseIds } })
      .populate("course", "courseName courseCode")
      .populate("createdBy", "firstName lastName")
      .populate("questions")
      .sort({ examDate: 1 });

    return res.status(200).json({ success: true, exams });
  } catch (error) {
    console.error("Error fetching student exams:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Error fetching exams",
        error: error.message,
      });
  }
};

const getStudentExamSubmissions = async (req, res) => {
  const { studentId } = req.params;

  try {
    const submissions = await ExamSubmission.find({
      student: studentId,
    }).populate({
      path: "exam",
      select: "examName examDate examType course",
      populate: {
        path: "course",
        select: "courseName courseCode",
      },
    });

    res.status(200).json({ success: true, submissions });
  } catch (error) {
    console.error("Error fetching exam submissions:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch exam submissions" });
  }
};

export {
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  enrollInCourse,
  getStudentCourses,
  getExamsForStudent,
  getStudentExamSubmissions,
};
