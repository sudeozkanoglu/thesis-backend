import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ExamSubmission from "../models/examSubmissionModel.js";
import Question from "../models/questionModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const handleSTT = async (req, res) => {
  const { examId, studentId, questionId, language = "tr" } = req.body;
  const audioFile = req.file;

  if (!audioFile) {
    return res.status(400).json({ error: "No audio uploaded" });
  }

  const supportedLanguages = ["tr", "en", "de"];
  if (!supportedLanguages.includes(language)) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  const originalPath = audioFile.path;
  const wavPath = originalPath + ".wav";

  // 1. Convert to WAV
  exec(
    `ffmpeg -i "${originalPath}" -ar 16000 -ac 1 -f wav "${wavPath}"`,
    async (err) => {
      if (err) {
        console.error("FFmpeg error:", err);
        return res.status(500).json({ error: "Conversion failed" });
      }

      try {
        // 2. Run Vosk STT
        const pythonPath = "python3";
        const sttScript = path.join(__dirname, "../vosk_stt.py");

        exec(
          `${pythonPath} "${sttScript}" "${wavPath}" "${language}"`,
          async (error, stdout) => {
            if (error) {
              console.error("STT error:", error);
              return res
                .status(500)
                .json({ error: "Speech recognition failed" });
            }

            const transcript = stdout.trim();

            // 3. Get correct answer
            const question = await Question.findById(questionId);
            if (!question) {
              return res.status(404).json({ error: "Question not found" });
            }
            const correctAnswer = question.correctAnswer;

            // 4. Run similarity score with SBERT
            const scoreScript = path.join(__dirname, "../evaluate_answer.py");
            exec(
              `${pythonPath} "${scoreScript}" "${transcript}" "${correctAnswer}"`,
              async (similarityErr, scoreOutput) => {
                if (similarityErr) {
                  console.error("Scoring error:", similarityErr);
                  return res.status(500).json({ error: "Scoring failed" });
                }

                const score = parseFloat(scoreOutput.trim());

                // 5. Save answer to DB
                const existing = await ExamSubmission.findOne({
                  exam: examId,
                  student: studentId,
                });

                if (existing) {
                  existing.answers.push({
                    question: questionId,
                    answer: transcript,
                    score: score,
                  });

                  const total = existing.answers.reduce(
                    (acc, a) => acc + a.score,
                    0
                  );
                  const avgScore = total / existing.answers.length;
                  existing.overall_score = avgScore;
                  const totalQuestionCount = await Question.countDocuments({
                    exam: examId,
                  });
                  if (existing.answers.length === totalQuestionCount) {
                    existing.status = "completed";
                  }
                  await existing.save();
                } else {
                  await ExamSubmission.create({
                    exam: examId,
                    student: studentId,
                    answers: [
                      {
                        question: questionId,
                        answer: transcript,
                        score: score,
                      },
                    ],
                    overall_score: score,
                  });
                }

                // 6. Cleanup
                fs.unlink(wavPath, () => {});
                fs.unlink(originalPath, () => {});

                return res.json({ success: true, transcript, score });
              }
            );
          }
        );
      } catch (err) {
        console.error("Unexpected error:", err);
        return res.status(500).json({ error: "Unexpected error" });
      }
    }
  );
};
