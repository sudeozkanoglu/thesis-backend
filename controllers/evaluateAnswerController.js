import Question from "../models/Question.js";
import ExamSubmission from "../models/ExamSubmission.js";

const correctAnswer = await Question.findById(questionId).then(
  (q) => q.correctAnswer
);
const pythonPath = "python3";
const evalScriptPath = path.join(__dirname, "../evaluate_answer.py");

// Komut oluştur
const evalCommand = `${pythonPath} "${evalScriptPath}" "${transcript}" "${correctAnswer}"`;

exec(evalCommand, async (error, stdout, stderr) => {
  if (error) {
    console.error("SBERT error:", error);
    return res.status(500).json({ error: "Evaluation failed" });
  }

  const score = parseFloat(stdout.trim());
  console.log(`🎯 SBERT Score: ${score}%`);

  // MongoDB'ye kayıt: cevabın skoruyla birlikte
  const existing = await ExamSubmission.findOne({
    exam: examId,
    student: studentId,
  });

  const newAnswer = {
    question: questionId,
    answer: transcript,
    score,
  };

  if (existing) {
    existing.answers.push(newAnswer);
    await existing.save();
  } else {
    await ExamSubmission.create({
      exam: examId,
      student: studentId,
      answers: [{ question: questionId, answer: transcript }],
      score: 0,
      overall_score: 0,
    });
  }

  res.json({ success: true, transcript, score });
});
