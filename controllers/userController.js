import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import validator from "validator";
import bcrypt from "bcryptjs";

// login user
const loginUser = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success:false, message:"User does not exist"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({success:false, message:"Invalid Credentials"});
        }

        const token = createToken(user._id);
        res.json({success:true, token, userType:user.userType});
    } catch (error) {
        res.json({success:false, message:"Error"});
    }
}

const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET)
}

// register user
const registerUser = async (req, res) => {
    const {name, email, password} = req.body;
    try {
        // checking is user already exists
        const exists = await userModel.findOne({email})
        if (exists) {
            return res.json({success: false, message: "User already exists"})
        }

        // validating email format and strong password
        if (!validator.isEmail(email)) {
            return res.json({success: false, message: "Please Enter a Valid Email"})
        }

        if(password.length < 8){
            return res.json({success: false, message: "Password must be atleast 8 characters"})
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // creating new user 
        const newUser = new userModel ({
            name: name,
            email: email,
            password: hashedPassword,
            userType: "student"
        })

        // saving user to database
        const user = await newUser.save();
        const token = createToken(user._id)
        res.json({success:true, token});
    } catch (error) {
        res.json({success:false, message:"Error"});
    }
}

export {loginUser, registerUser};