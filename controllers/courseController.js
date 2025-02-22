import Course from "../models/courseModel.js";
import Exam from "../models/examsModel.js";
import {Student} from "../models/userModel.js";

export const addCourse = async (req, res) => {
  const session = await Course.startSession();
  session.startTransaction();
  try {
    const { courseName, courseCode, description } = req.body;

    // Gerekli alanların kontrolü
    if (!courseName || !courseCode || !description) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Dersin zaten var olup olmadığını kontrol et
    const existingCourse = await Course.findOne({ courseCode }).session(session);
    if (existingCourse) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Course already exists" });
    }

    // Yeni ders oluştur
    const newCourse = new Course({ courseName, courseCode, description });
    const savedCourse = await newCourse.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Course added successfully",
      course: savedCourse,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error adding course:", error);
    res.status(500).json({ success: false, message: "Error adding course", error: error.message });
  }
};

// Tüm dersleri ve ilişkili sınavları getir
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("exams");
    res.status(200).json({ success: true, courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ success: false, message: "Error fetching courses" });
  }
};

// Belirli bir dersi getir
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).populate("exams");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.status(200).json({ success: true, course });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ success: false, message: "Error fetching course" });
  }
};

// Dersi güncelle
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    const updatedCourse = await Course.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.status(200).json({ success: true, message: "Course updated", course: updatedCourse });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ success: false, message: "Error updating course", error: error.message });
  }
};

// Dersi sil ve bağlı sınavları da kaldır (Transaction kullanarak)
export const deleteCourse = async (req, res) => {
  const session = await Course.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const deletedCourse = await Course.findByIdAndDelete(id, { session });
    if (!deletedCourse) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Bağlı tüm sınavları sil
    await Exam.deleteMany({ course: deletedCourse._id }, { session });

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ success: true, message: "Course and associated exams deleted" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting course:", error);
    res.status(500).json({ success: false, message: "Error deleting course" });
  }
};

export const registerStudentToCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    
    // Gerekli alanların kontrolü
    if (!studentId || !courseId) {
      return res.status(400).json({ success: false, message: "Missing studentId or courseId" });
    }
    
    // Kursun varlığını kontrol et
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    
    // Öğrenciyi güncelle: Kursu ekle (zaten varsa eklemez)
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $addToSet: { courses: courseId } },
      { new: true }
    );
    
    if (!updatedStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    
    res.status(200).json({
      success: true,
      message: "Student registered to course successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error registering student to course:", error);
    res.status(500).json({
      success: false,
      message: "Error registering student to course",
      error: error.message,
    });
  }
};
