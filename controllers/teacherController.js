import teacherModel from "../models/teacherModel.js";
import axios from "axios";

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
            courses: parsedCourses
        });

        const name = firstName + " " + lastName;

        const formData = {
            name: name,
            email: email,
            password: password,
            userType: "teacher",
        };
        const newUrl = "http://localhost:4000/api/user/register";
        
        const teacher = await newTeacher.save();
        const response = await axios.post(newUrl, formData);
    
        res.status(201).json({ success: true, message: "Teacher added successfully", teacher });

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
        const teacher = await teacherModel.findById(id);
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


const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTeacher = await teacherModel.findByIdAndDelete(id);
        if (!deletedTeacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }
        res.status(200).json({ success: true, message: "Teacher deleted successfully" });
    } catch (error) {
        console.error("Error deleting teacher:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export { addTeacher, getTeachers, getTeacherById, updateTeacher, deleteTeacher };