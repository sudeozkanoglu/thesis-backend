import Course from "../models/courseModel.js";
import Exam from "../models/examsModel.js";

// ✅ Yeni ders ve sınavları ekleme
export const addCourse = async (req, res) => {
  try {
    const { courseName, courseCode, description, exams } = req.body;

    // Dersin zaten var olup olmadığını kontrol et
    const existingCourse = await Course.findOne({ courseCode });
    if (existingCourse) {
      return res.status(400).json({ success: false, message: "Course already exists" });
    }

    // Yeni ders oluştur
    const newCourse = new Course({ courseName, courseCode, description });
    const savedCourse = await newCourse.save();

    // Exams (Sınavlar) ekleniyorsa, onları ayrı kaydet
    let examIds = [];
    if (exams && exams.length > 0) {
      const createdExams = await Exam.insertMany(
        exams.map((exam) => ({ examName: exam, course: savedCourse._id }))
      );
      examIds = createdExams.map((exam) => exam._id);
    }

    // Kursa sınavları bağla ve güncelle
    savedCourse.exams = examIds;
    await savedCourse.save();

    res.status(201).json({ success: true, message: "Course added successfully", course: savedCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error adding course" });
  }
};

// ✅ Tüm dersleri ve ilişkili sınavları getir
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("exams"); // Exam verilerini de getir
    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching courses" });
  }
};

// ✅ Belirli bir dersi getir
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("exams");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching course" });
  }
};

// ✅ Dersi güncelle
export const updateCourse = async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.status(200).json({ success: true, message: "Course updated", course: updatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating course" });
  }
};

// ✅ Dersi sil ve bağlı sınavları da kaldır
export const deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Bağlı tüm sınavları da sil
    await Exam.deleteMany({ course: deletedCourse._id });

    res.status(200).json({ success: true, message: "Course and associated exams deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting course" });
  }
};