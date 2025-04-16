import express from "express";

import {
    addTeacher,
    updateTeacher,
    deleteTeacher,
    getTeacherById,
    getTeachers,
    getExamsByTeacher,
    removeCourseFromTeacher
} from "../controllers/teacherController.js";

const teacherRouter = express.Router();

teacherRouter.post("/add", addTeacher);         // Yeni öğretmen ekle
teacherRouter.get("/:teacherId/exams", getExamsByTeacher); // Öğretmene ait sınavları getir
teacherRouter.get("/", getTeachers);            // Tüm öğretmenleri getir
teacherRouter.get("/:id", getTeacherById);      // Belirli bir öğretmeni getir
// teacherRouter.get("/user/:userId", getTeacherByUserId);
teacherRouter.put("/:id", updateTeacher);       // Öğretmeni güncelle
teacherRouter.delete("/:id", deleteTeacher);    // Öğretmeni sil
teacherRouter.delete("/:teacherId/course/:courseId", removeCourseFromTeacher); // Öğretmenden dersi sil

export default teacherRouter;