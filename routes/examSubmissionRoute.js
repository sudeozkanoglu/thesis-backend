import express from "express";
import { getSubmissionsByStudent, getLatestExamResults } from "../controllers/examSubmissionController.js";

const examSubmissionRouter = express.Router();

examSubmissionRouter.get("/:studentId", getSubmissionsByStudent);
examSubmissionRouter.get("/:studentId/latest", getLatestExamResults);

export default examSubmissionRouter;