import teacherModel from "../models/teacherModel.js";
import userModel from "../models/userModel.js";
import courseModel from "../models/courseModel.js";
import bcrypt from "bcryptjs";

// Yeni öğretmen ekle
const addTeacher = async (req, res) => {
    try {
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
            courses
        } = req.body;

        let photo = "";
        if (req.file) {
            photo = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        }

        const exists = await teacherModel.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: "Teacher already exists" });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User with this email already exists" });
        }

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

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name: `${firstName} ${lastName}`,
            email,
            password: hashedPassword, 
            userType: "teacher",
        });

        const savedUser = await newUser.save();

        const newTeacher = new teacherModel({
            firstName,
            lastName,
            password,
            degreeLevel,
            department,
            photo,
            phoneNumber,
            email,
            roomNumber,
            schools: parsedSchools,
            expertiseAreas: parsedExpertise,
            officeHours: parsedOfficeHours,
            courses: parsedCourses,
            userId: savedUser._id, 
        });
        
        const savedTeacher = await newTeacher.save();

        savedUser.teacherId = savedTeacher._id;
        await savedUser.save();
    
        res.status(201).json({ success: true, message: "Teacher added successfully", savedTeacher });

    } catch (error) {
        console.error("Error adding teacher:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getTeachers = async (req, res) => {
    try {
        const teachers = await teacherModel.find();
        res.status(200).json({ success: true, teachers });
    } catch (error) {
        console.error("Error fetching teachers:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getTeacherById = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await teacherModel.findById(id).populate("userId");
        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }
        res.status(200).json({ success: true, teacher });
    } catch (error) {
        console.error("Error fetching teacher:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            firstName,
            lastName,
            degreeLevel,
            department,
            photo,
            password,
            phoneNumber,
            email,
            roomNumber,
            schools,
            expertiseAreas,
            officeHours,
            courses 
        } = req.body;

        let updatedPhoto = photo;
        if (req.file) {
            updatedPhoto = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        }

        const parsedSchools = typeof schools === "string" ? JSON.parse(schools) : schools;
        const parsedExpertise = typeof expertiseAreas === "string" ? JSON.parse(expertiseAreas) : expertiseAreas;
        const parsedOfficeHours = typeof officeHours === "string" ? JSON.parse(officeHours) : officeHours;
        const parsedCourses = typeof courses === "string" ? JSON.parse(courses) : courses;

        const updatedTeacher = await teacherModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    firstName,
                    lastName,
                    degreeLevel,
                    department,
                    photo: updatedPhoto,
                    phoneNumber,
                    email,
                    password,
                    roomNumber,
                    schools: parsedSchools,
                    expertiseAreas: parsedExpertise,
                    officeHours: parsedOfficeHours,
                    courses: parsedCourses 
                }
            },
            { new: true }
        );

        if (!updatedTeacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }
        res.status(200).json({ success: true, message: "Teacher updated successfully", updatedTeacher });

    } catch (error) {
        console.error("Error updating teacher:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getTeacherByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const teacher = await teacherModel.findOne({ userId });

        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        res.status(200).json({ success: true, teacher });
    } catch (error) {
        console.error("Error fetching teacher by userId:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        const userId = teacher.userId;

        await teacherModel.findByIdAndDelete(id);

        if (userId) {
            await userModel.findByIdAndDelete(userId);
        }

        res.status(200).json({ success: true, message: "Teacher and associated user deleted successfully" });

    } catch (error) {
        console.error("Error deleting teacher:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export { addTeacher, getTeachers, getTeacherById, updateTeacher, deleteTeacher, getTeacherByUserId };