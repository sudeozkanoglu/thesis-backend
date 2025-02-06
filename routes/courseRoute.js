import express from "express";
import {
  addCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";

const courseRouter = express.Router();

// 🟢 Ders ekleme (sınavlar dahil)
courseRouter.post("/add", addCourse);

// 🔵 Tüm dersleri getir
courseRouter.get("/", getCourses);

// 🔵 Belirli bir dersi getir
courseRouter.get("/:id", getCourseById);

// 🟡 Dersi güncelle
courseRouter.put("/:id", updateCourse);

// 🔴 Dersi ve ilişkili sınavları sil
courseRouter.delete("/:id", deleteCourse);

export default courseRouter;