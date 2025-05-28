import ExamSubmission from "../models/examSubmissionModel.js";
import Question from "../models/questionModel.js";

export const getSubmissionsByStudent = async (req, res) => {
  const { studentId } = req.params;

  try {
    const submissions = await ExamSubmission.find({ student: studentId })
      .populate({
        path: "exam",
        select: "examName examDate",
      })
      .select("exam overall_score status createdAt");

    res.status(200).json({
      success: true,
      submissions,
    });
  } catch (err) {
    console.error("Error fetching submissions:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
    });
  }
};

export const getLatestExamResults = async (req, res) => {
  const { studentId } = req.params;

  try {
    const submissions = await ExamSubmission.find({ student: studentId })
      .populate({
        path: "exam",
        populate: { path: "course", select: "courseName" },
      })
      .sort({ createdAt: -1 })
      .limit(5);

    const results = submissions
      .filter((sub) => sub.exam !== null)
      .map((sub) => ({
        id: sub._id,
        exam: sub.exam.examName,
        courseName: sub.exam.course?.courseName || "No Course",
        overall_score: sub.overall_score,
        date: new Date(sub.createdAt).toLocaleDateString(),
      }));

    res.status(200).json({ success: true, results });
  } catch (err) {
    console.error("Error fetching latest results:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSubmissionForExam = async (req, res) => {
  const { studentId, examId } = req.params;

  try {
    const submission = await ExamSubmission.findOne({
      student: studentId,
      exam: examId,
    })
      .populate({
        path: "exam",
        select: "examName examType",
      })
      .populate({
        path: "answers.question",
        select: "questionText correctAnswer",
      });

    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }

    const detailedQuestions = submission.answers.map((ans) => ({
      question: ans.question.questionText,
      correctAnswer: ans.question.correctAnswer,
      studentAnswer: ans.answer,
      score: ans.score,
      isCorrect: ans.score >= 80,
      timeSpent: 0,
    }));

    const result = {
      examName: submission.exam.examName,
      examType: submission.exam.examType,
      overall_score: submission.overall_score,
      totalQuestions: detailedQuestions.length,
      correctAnswers: detailedQuestions.filter((q) => q.isCorrect).length,
      timeSpent: "N/A",
      questions: detailedQuestions,
    };

    res.json({ success: true, result });
  } catch (err) {
    console.error("Error fetching detailed result:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const autoCompleteExam = async (req, res) => {
  const { studentId, examId } = req.body;

  if (!studentId || !examId) {
    return res.status(400).json({ error: "Missing studentId or examId" });
  }

  try {
    const questions = await Question.find({ exam: examId });
    const submission = await ExamSubmission.findOne({
      student: studentId,
      exam: examId,
    });

    if (!submission) {
      const answers = questions.map((q) => ({
        question: q._id,
        answer: "",
        score: 0,
      }));

      const avg = 0;

      await ExamSubmission.create({
        student: studentId,
        exam: examId,
        answers,
        overall_score: avg,
        status: "completed",
      });

      return res.json({ success: true, created: true });
    }

    const answeredIds = submission.answers.map((a) => a.question.toString());

    const unansweredQuestions = questions.filter(
      (q) => !answeredIds.includes(q._id.toString())
    );

    unansweredQuestions.forEach((q) => {
      submission.answers.push({
        question: q._id,
        answer: "",
        score: 0,
      });
    });

    const total = submission.answers.reduce((acc, a) => acc + a.score, 0);
    const avg = total / submission.answers.length;

    submission.overall_score = avg;
    submission.status = "completed";
    await submission.save();

    return res.json({ success: true, completed: true });
  } catch (err) {
    console.error("Auto-complete error:", err);
    return res.status(500).json({ error: "Failed to auto-complete exam" });
  }
};
