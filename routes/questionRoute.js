import express from 'express';

import {
    addQuestions,
    deleteQuestions,
    updateQuestions
} from '../controllers/questionController.js';

const questionRouter = express.Router();

questionRouter.post('/add', addQuestions); // Yeni soru ekleme
questionRouter.put('/:id', updateQuestions); // Soruyu güncelleme
questionRouter.delete('/:id', deleteQuestions); // Soruyu silme

export default questionRouter;