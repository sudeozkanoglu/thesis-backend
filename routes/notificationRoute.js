import express from "express";
import {
  getUserNotifications,
  createNotification,
  deleteNotification,
  sendNotificationToTeachers,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/:userId", getUserNotifications);
router.post("/", createNotification);
router.delete("/:id", deleteNotification);
router.post("/to-teachers", sendNotificationToTeachers);

export default router;