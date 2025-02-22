import { Teacher } from "../models/userModel.js"; // Teacher artık User modelinin discriminator'ı
import Exams from "../models/examsModel.js";
import bcrypt from "bcryptjs";

// Yeni öğretmen ekle
const addTeacher = async (req, res) => {
  try {
    const {
      userType,
      firstName,
      lastName,
      degreeLevel,
      department,
      password,
      phoneNumber,
      email,
      roomNumber,
      schools,
      expertiseAreas,
      officeHours,
      courses,
    } = req.body;

    // Email kontrolü
    const exists = await Teacher.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Teacher already exists" });
    }

    // JSON parse işlemleri (gerekirse)
    const safeParse = (data) => {
      try {
        return typeof data === "string" ? JSON.parse(data) : data;
      } catch (error) {
        console.error("JSON Parse Error:", error);
        return [];
      }
    };

    const parsedSchools = safeParse(schools);
    const parsedExpertise = safeParse(expertiseAreas);
    const parsedOfficeHours = safeParse(officeHours);
    const parsedCourses = safeParse(courses);

    // Şifreyi hash'leme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tek bir Teacher belgesi oluşturuluyor
    const newTeacher = new Teacher({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      degreeLevel,
      department,
      phoneNumber,
      roomNumber,
      schools: parsedSchools,
      expertiseAreas: parsedExpertise,
      officeHours: parsedOfficeHours,
      courses: parsedCourses,
    });

    const savedTeacher = await newTeacher.save();
    res.status(201).json({
      success: true,
      message: "Teacher added successfully",
      savedTeacher,
    });
  } catch (error) {
    console.error("Error adding teacher:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { addTeacher };

const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }
    const {
      firstName,
      lastName,
      degreeLevel,
      department,
      password,
      phoneNumber,
      email,
      roomNumber,
      schools,
      expertiseAreas,
      officeHours,
      courses,
    } = req.body;

    const parsedSchools =
      typeof schools === "string" ? JSON.parse(schools) : schools;
    const parsedExpertise =
      typeof expertiseAreas === "string"
        ? JSON.parse(expertiseAreas)
        : expertiseAreas;
    const parsedOfficeHours =
      typeof officeHours === "string" ? JSON.parse(officeHours) : officeHours;
    const parsedCourses =
      typeof courses === "string" ? JSON.parse(courses) : courses;

    // Eğer şifre güncellenecekse, hash işlemi yapmanız gerekir
    let updatedData = {
      email,
      firstName,
      lastName,
      degreeLevel,
      department,
      phoneNumber,
      roomNumber,
      schools: parsedSchools,
      expertiseAreas: parsedExpertise,
      officeHours: parsedOfficeHours,
      courses: parsedCourses,
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(password, salt);
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true }
    ).populate("courses", "courseName courseCode description");

    if (!updatedTeacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }
    res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      updatedTeacher,
    });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { updateTeacher };

const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTeacher = await Teacher.findByIdAndDelete(id);

    if (!deletedTeacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { deleteTeacher };

const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate(
      "courses",
      "courseName courseCode description"
    );
    res.status(200).json({ success: true, teachers });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { getTeachers };

const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id).populate(
      "courses",
      "courseName courseCode description"
    );
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }
    res.status(200).json({ success: true, teacher });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { getTeacherById };

export const getExamsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // ✅ Step 1: Validate teacher ID
    if (!teacherId) {
      return res
        .status(400)
        .json({ success: false, message: "Teacher ID is required" });
    }

    // ✅ Step 2: Find the teacher and get assigned courses
    const teacher = await Teacher.findById(teacherId);
    if (!teacher || !teacher.courses || teacher.courses.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No courses found for this teacher" });
    }

    // ✅ Step 3: Find exams for those courses created by the teacher
    const exams = await Exams.find({
      course: { $in: teacher.courses }, // Exams whose course is in teacher.courses
      createdBy: teacherId, // Exams created by the teacher
    }).populate([
      { path: "course", select: "courseName courseCode" },
      { path: "createdBy", select: "firstName lastName" },
    ]);

    if (!exams || exams.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No exams found for this teacher's courses",
        });
    }

    // ✅ Step 4: Send response
    res.status(200).json({
      success: true,
      teacher: {
        _id: teacher._id,
        name: `${teacher.firstName} ${teacher.lastName}`,
      },
      exams,
    });
  } catch (error) {
    console.error("Error fetching exams for teacher:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
