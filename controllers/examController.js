import Exam from "../models/examsModel.js";
import Course from "../models/courseModel.js";
import ExamSubmission from "../models/examSubmissionModel.js";
import Notification from "../models/notificationModel.js";

// Yeni sınav oluşturma
export const addExam = async (req, res) => {
  try {
    const {
      examName,
      course,
      examDate,
      examType,
      duration,
      instructions,
      questions,
      createdBy,
    } = req.body;

    // Zorunlu alanların kontrolü
    if (!examName || !course || !examType) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const now = new Date();
    const inputExamDate = new Date(examDate);

    if (inputExamDate < now.setHours(0, 0, 0, 0)) {
      return res.status(400).json({
        success: false,
        message: "Exam date cannot be in the past.",
      });
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
      return res
        .status(404)
        .json({ success: false, message: "Associated course not found" });
    }

    const notifications = updatedCourse.students.map((student) => ({
      user: student._id,
      role: "Student",
      title: "New Exam Scheduled",
      message: `${examName} exam has been added for ${new Date(
        examDate
      ).toLocaleDateString()}`,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res
      .status(201)
      .json({
        success: true,
        message: "Exam created and added to course successfully",
        exam: savedExam,
      });
  } catch (error) {
    console.error("Error creating exam:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error creating exam",
        error: error.message,
      });
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
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching exams",
        error: error.message,
      });
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
      return res
        .status(404)
        .json({ success: false, message: "Exam not found" });
    }
    res.status(200).json({ success: true, exam });
  } catch (error) {
    console.error("Error fetching exam:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching exam",
        error: error.message,
      });
  }
};

// Sınavı güncelleme
export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.body.examDate) {
      const incomingDate = new Date(req.body.examDate);
      const now = new Date();

      if (incomingDate < now.setHours(0, 0, 0, 0)) {
        return res.status(400).json({
          success: false,
          message: "Exam date cannot be in the past.",
        });
      }

      req.body.status = incomingDate > now ? "upcoming" : "pending";
    }

    const updatedExam = await Exam.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedExam) {
      return res
        .status(404)
        .json({ success: false, message: "Exam not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "Exam updated successfully",
        exam: updatedExam,
      });
  } catch (error) {
    console.error("Error updating exam:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating exam",
        error: error.message,
      });
  }
};

// Sınavı silme
export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExam = await Exam.findByIdAndDelete(id);
    if (!deletedExam) {
      return res
        .status(404)
        .json({ success: false, message: "Exam not found" });
    }

    await ExamSubmission.deleteMany({ exam: id });
    await Course.findByIdAndUpdate(deletedExam.course, {
      $pull: { exams: id },
    });

    res
      .status(200)
      .json({ success: true, message: "Exam deleted successfully" });
  } catch (error) {
    console.error("Error deleting exam:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting exam",
        error: error.message,
      });
  }
};

export const getExamStatistics = async (req, res) => {
  const { examId } = req.params;

  try {
    const submissions = await ExamSubmission.find({ exam: examId });

    const totalStudents = submissions.length;

    const scores = submissions.map((s) => s.overall_score);
    const averageScore = scores.reduce((a, b) => a + b, 0) / totalStudents || 0;
    const highestScore = Math.max(...scores, 0);
    const participationRate = (totalStudents / 100) * 100;

    const scoreDistribution = [
      { grade: "0-20", count: scores.filter((s) => s <= 20).length },
      { grade: "21-40", count: scores.filter((s) => s > 20 && s <= 40).length },
      { grade: "41-60", count: scores.filter((s) => s > 40 && s <= 60).length },
      { grade: "61-80", count: scores.filter((s) => s > 60 && s <= 80).length },
      { grade: "81-100", count: scores.filter((s) => s > 80).length },
    ];

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        averageScore,
        highestScore,
        participationRate,
        scoreDistribution,
      },
    });
  } catch (err) {
    console.error("Error fetching statistics:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch statistics" });
  }
};

export const getLatestCompletedExam = async (req, res) => {
  const { teacherId } = req.params;

  try {
    const exams = await Exam.find({ createdBy: teacherId }).sort({ examDate: -1 });

    for (const exam of exams) {
      const submissionCount = await ExamSubmission.countDocuments({
        exam: exam._id,
        status: "completed",
      });

      if (submissionCount > 0) {
        return res.status(200).json({
          success: true,
          exam,
        });
      }
    }

    return res.status(404).json({
      success: false,
      message: "No completed exams found.",
    });
  } catch (error) {
    console.error("Error fetching latest completed exam:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getExamStatusByCourseId = async (req, res) => {
  const { courseId } = req.params;

  try {
    const exams = await Exam.find({ course: courseId });

    const examStatuses = await Promise.all(
      exams.map(async (exam) => {
        const submissions = await ExamSubmission.find({ exam: exam._id });
        const isCompleted =
          submissions.length > 0 &&
          submissions.every((sub) => sub.status === "completed");

        const total = submissions.length;
        const scores = submissions.map((s) => s.overall_score || 0);

        const averageScore = total
          ? scores.reduce((a, b) => a + b, 0) / total
          : 0;

        const successRate = total
          ? (scores.filter((s) => s >= 50).length / total) * 100
          : 0;

        const highestScore = total ? Math.max(...scores) : 0;
        const lowestScore = total ? Math.min(...scores) : 0;

        const studentResults = [
          { name: "0-20", count: scores.filter((s) => s <= 20).length },
          {
            name: "21-40",
            count: scores.filter((s) => s > 20 && s <= 40).length,
          },
          {
            name: "41-60",
            count: scores.filter((s) => s > 40 && s <= 60).length,
          },
          {
            name: "61-80",
            count: scores.filter((s) => s > 60 && s <= 80).length,
          },
          { name: "81-100", count: scores.filter((s) => s > 80).length },
        ];

        return {
          examId: exam._id,
          status: isCompleted ? "completed" : "pending",
          averageScore: Number(averageScore.toFixed(1)),
          successRate: Number(successRate.toFixed(1)),
          studentResults,
          highestScore,
          lowestScore,
        };
      })
    );

    res.json({ success: true, statuses: examStatuses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Status fetch failed" });
  }
};
