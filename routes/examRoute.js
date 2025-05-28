import express from 'express';

import {
    addExam,
    getExams,
    getExamById,
    updateExam,
    deleteExam,
    getExamStatistics,
    getExamStatusByCourseId,
    getLatestCompletedExam
} from '../controllers/examController.js';

const examRouter = express.Router();

examRouter.post('/add', addExam); // Yeni sınav ekleme
examRouter.get('/', getExams); // Tüm sınavları getirme
examRouter.get('/:id', getExamById); // Belirli bir sınavı getirme
examRouter.put('/:id', updateExam); // Sınavı güncelleme
examRouter.delete('/:id', deleteExam); // Sınavı silme
examRouter.get("/:examId/statistics", getExamStatistics);
examRouter.get("/exam-status/:courseId", getExamStatusByCourseId);
examRouter.get("/:teacherId/latest-completed-exam", getLatestCompletedExam);

export default examRouter;
