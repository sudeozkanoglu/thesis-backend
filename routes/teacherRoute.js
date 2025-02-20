import express from "express";
import multer from "multer";

import {
    addTeacher,
    getTeachers,
    getTeacherById,
    getTeacherByUserId,
    updateTeacher,
    deleteTeacher
} from "../controllers/teacherController.js";

const teacherRouter = express.Router();

// Multer ayarları (Dosya yükleme için)
const storage = multer.memoryStorage();
const upload = multer({ storage });

teacherRouter.post("/add", upload.single("photo"), addTeacher);         // Yeni öğretmen ekle
teacherRouter.get("/", getTeachers);            // Tüm öğretmenleri getir
teacherRouter.get("/:id", getTeacherById);      // Belirli bir öğretmeni getir
teacherRouter.get("/user/:userId", getTeacherByUserId);
teacherRouter.put("/:id", updateTeacher);       // Öğretmeni güncelle
teacherRouter.delete("/:id", deleteTeacher);    // Öğretmeni sil

export default teacherRouter;