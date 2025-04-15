import express from "express";
import {
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  enrollInCourse,
  getStudentCourses,
  getExamsForStudent,
  getStudentExamSubmissions,
} from "../controllers/studentController.js";

const studentRouter = express.Router();

studentRouter.get("/", getStudents); // Tüm öğrencileri getir
studentRouter.get("/:id", getStudentById); // Belirli bir öğrenciyi getir
studentRouter.put("/:id", updateStudent); // Öğrenciyi güncelle
studentRouter.delete("/:id", deleteStudent); // Öğrenciyi sil
studentRouter.post("/:studentId/enroll", enrollInCourse); // Öğrenciyi derse kaydet
studentRouter.get("/:studentId/courses", getStudentCourses); // Öğrencinin derslerini getir
studentRouter.get("/:studentId/exams", getExamsForStudent); // Öğrencinin sınavlarını getir
studentRouter.get("/:studentId/exam-submissions", getStudentExamSubmissions); // Öğrencinin sınav sonuçlarını getir
export default studentRouter;