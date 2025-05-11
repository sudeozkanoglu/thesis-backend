import examSubmissionModel from "../models/examSubmissionModel.js";

export const getSubmissionsByStudent = async (req, res) => {
  const { studentId } = req.params;

  try {
    const submissions = await examSubmissionModel
      .find({ student: studentId })
      .select("exam student");

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
    const submissions = await examSubmissionModel
      .find({ student: studentId })
      .populate({
        path: "exam",
        populate: { path: "course", select: "courseName" },
      })
      .sort({ createdAt: -1 })
      .limit(5);

    const results = submissions.map((sub) => ({
      id: sub._id,
      exam: sub.exam.examName,
      courseName: sub.exam.course?.courseName || "No Course",
      score: sub.score,
      date: new Date(sub.createdAt).toLocaleDateString(),
    }));

    res.status(200).json({ success: true, results });
  } catch (err) {
    console.error("Error fetching latest results:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
