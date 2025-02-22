import express from 'express';

import {
    addExam,
    getExams,
    getExamById,
    updateExam,
    deleteExam
} from '../controllers/examController.js';

const examRouter = express.Router();

examRouter.post('/add', addExam); // Yeni sınav ekleme
examRouter.get('/', getExams); // Tüm sınavları getirme
examRouter.get('/:id', getExamById); // Belirli bir sınavı getirme
examRouter.put('/:id', updateExam); // Sınavı güncelleme
examRouter.delete('/:id', deleteExam); // Sınavı silme

export default examRouter;
