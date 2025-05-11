import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ExamSubmission from "../models/examSubmissionModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const handleSTT = async (req, res) => {
  const { examId, studentId, questionId, language = "tr" } = req.body;
  const audioFile = req.file;

  if (!audioFile) {
    return res.status(400).json({ error: "No audio uploaded" });
  }

  const supportedLanguages = ["tr", "en"];
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
        // 2. Run Python Vosk script with language param
        const pythonPath = "python3";
        const scriptPath = path.join(__dirname, "../vosk_stt.py");

        exec(
          `${pythonPath} "${scriptPath}" "${wavPath}" "${language}"`,
          async (error, stdout) => {
            if (error) {
              console.error("STT error:", error);
              return res.status(500).json({ error: "Speech recognition failed" });
            }

            const transcript = stdout.trim();

            // 3. Save answer
            const existing = await ExamSubmission.findOne({
              exam: examId,
              student: studentId,
            });

            if (existing) {
              existing.answers.push({
                question: questionId,
                answer: transcript,
              });
              await existing.save();
            } else {
              await ExamSubmission.create({
                exam: examId,
                student: studentId,
                answers: [{ question: questionId, answer: transcript }],
                score: 0,
              });
            }

            // 4. Cleanup temp files
            fs.unlink(wavPath, () => {});
            fs.unlink(originalPath, () => {});

            return res.json({ success: true, transcript });
          }
        );
      } catch (err) {
        console.error("Unexpected error:", err);
        return res.status(500).json({ error: "Unexpected error" });
      }
    }
  );
};