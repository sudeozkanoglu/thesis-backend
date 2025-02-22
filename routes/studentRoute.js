import express from "express";
import {
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../controllers/studentController.js";

const studentRouter = express.Router();

studentRouter.get("/", getStudents); // Tüm öğrencileri getir
studentRouter.get("/:id", getStudentById); // Belirli bir öğrenciyi getir
studentRouter.put("/:id", updateStudent); // Öğrenciyi güncelle
studentRouter.delete("/:id", deleteStudent); // Öğrenciyi sil

export default studentRouter;