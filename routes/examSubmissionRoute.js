import express from "express";
import { getSubmissionsByStudent, getLatestExamResults, getSubmissionForExam, autoCompleteExam } from "../controllers/examSubmissionController.js";

const examSubmissionRouter = express.Router();

examSubmissionRouter.post("/autocomplete", autoCompleteExam);
examSubmissionRouter.get("/:studentId", getSubmissionsByStudent);
examSubmissionRouter.get("/:studentId/latest", getLatestExamResults);
examSubmissionRouter.get("/:studentId/:examId", getSubmissionForExam);

export default examSubmissionRouter;