import Notification from "../models/notificationModel.js";
import { Teacher } from "../models/userModel.js";


// Tüm bildirimleri getir (kullanıcıya göre)
export const getUserNotifications = async (req, res) => {
    try {
      const { userId } = req.params;
  
      const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
  
      res.status(200).json({ success: true, notifications });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ success: false, message: "Failed to fetch notifications" });
    }
  };
  
  // Yeni bir bildirim oluştur (örnek: sınav eklenince)
  export const createNotification = async (req, res) => {
    try {
      const { user, title, message, type } = req.body;
  
      const newNotification = new Notification({
        user,
        title,
        message,
        type,
      });
  
      await newNotification.save();
  
      res.status(201).json({ success: true, message: "Notification created", notification: newNotification });
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ success: false, message: "Failed to create notification" });
    }
  };
  
  // Bildirim sil
  export const deleteNotification = async (req, res) => {
    try {
      const { id } = req.params;
  
      const deleted = await Notification.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Notification not found" });
      }
  
      res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ success: false, message: "Failed to delete notification" });
    }
  };

  export const sendNotificationToTeachers = async (req, res) => {
    try {
      const { title, message, sendToAll, teacherId } = req.body;
  
      if (!title || !message) {
        return res
          .status(400)
          .json({ success: false, message: "Title and message are required." });
      }
  
      if (sendToAll) {
        const teachers = await Teacher.find();
        const notifications = teachers.map((teacher) => ({
          user: teacher._id,
          role: "Teacher",
          title,
          message,
        }));
  
        await Notification.insertMany(notifications);
        return res
          .status(201)
          .json({ success: true, message: "Notifications sent to all teachers." });
      } else {
        if (!teacherId) {
          return res
            .status(400)
            .json({ success: false, message: "Teacher ID is required." });
        }
  
        const newNotification = new Notification({
          user: teacherId,
          role: "Teacher",
          title,
          message,
        });
  
        await newNotification.save();
        return res
          .status(201)
          .json({ success: true, message: "Notification sent to teacher." });
      }
    } catch (error) {
      console.error("Error sending teacher notification:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to send teacher notification" });
    }
  };