import Exam from "../models/examsModel.js";
import Course from "../models/courseModel.js";

// Yeni sınav oluşturma
export const addExam = async (req, res) => {
    try {
      const { examName, course, examDate, examType, duration, instructions, questions, createdBy } = req.body;
  
      // Zorunlu alanların kontrolü
      if (!examName || !course || !examType) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }
      
      const examStatus = new Date(examDate) > new Date() ? "upcoming" : "pending";

      // Yeni sınav nesnesini oluştur
      const newExam = new Exam({
        examName,
        course,
        examDate,
        examType,
        duration,
        instructions: instructions || "",
        questions: questions || [],
        createdBy: createdBy || null,
        status: examStatus,
      });
  
      const savedExam = await newExam.save();
  
      // İlgili course dokümanına sınav _id'sini ekle
      const updatedCourse = await Course.findByIdAndUpdate(
        course,
        { $push: { exams: savedExam._id } },
        { new: true }
      );
  
      // Eğer course bulunamadıysa hata dönebilir
      if (!updatedCourse) {
        return res.status(404).json({ success: false, message: "Associated course not found" });
      }
  
      res.status(201).json({ success: true, message: "Exam created and added to course successfully", exam: savedExam });
    } catch (error) {
      console.error("Error creating exam:", error);
      res.status(500).json({ success: false, message: "Error creating exam", error: error.message });
    }
  };

// Tüm sınavları getirme (ilgili Course, Question ve Teacher bilgilerini populate eder)
export const getExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate("course")
      .populate("questions")
      .populate("createdBy")
      .sort({ examDate: -1 });
    res.status(200).json({ success: true, exams });
  } catch (error) {
    console.error("Error fetching exams:", error);
    res.status(500).json({ success: false, message: "Error fetching exams", error: error.message });
  }
};

// Belirli bir sınavı getirme
export const getExamById = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id)
      .populate("course")
      .populate("questions")
      .populate("createdBy");
    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }
    res.status(200).json({ success: true, exam });
  } catch (error) {
    console.error("Error fetching exam:", error);
    res.status(500).json({ success: false, message: "Error fetching exam", error: error.message });
  }
};

// Sınavı güncelleme
export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.body.examDate) {
      req.body.status = new Date(req.body.examDate) > new Date() ? "upcoming" : "pending";
    }

    const updatedExam = await Exam.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedExam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }
    res.status(200).json({ success: true, message: "Exam updated successfully", exam: updatedExam });
  } catch (error) {
    console.error("Error updating exam:", error);
    res.status(500).json({ success: false, message: "Error updating exam", error: error.message });
  }
};

// Sınavı silme
export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExam = await Exam.findByIdAndDelete(id);
    if (!deletedExam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }

    await Course.findByIdAndUpdate(deletedExam.course, { $pull: { exams: id } });
    
    res.status(200).json({ success: true, message: "Exam deleted successfully" });
  } catch (error) {
    console.error("Error deleting exam:", error);
    res.status(500).json({ success: false, message: "Error deleting exam", error: error.message });
  }
};