import express from "express";
import {
  addCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  registerStudentToCourse
} from "../controllers/courseController.js";

const courseRouter = express.Router();

// Ders ekleme (sınavlar dahil)
courseRouter.post("/add", addCourse);

// Tüm dersleri getir
courseRouter.get("/", getCourses);

// Belirli bir dersi getir
courseRouter.get("/:id", getCourseById);

// Dersi güncelle
courseRouter.put("/:id", updateCourse);

// Dersi ve ilişkili sınavları sil
courseRouter.delete("/:id", deleteCourse);

// Öğrenciyi derse kaydet
courseRouter.post("/register", registerStudentToCourse);

export default courseRouter;