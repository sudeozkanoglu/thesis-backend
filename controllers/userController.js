import { webcrypto } from 'crypto';
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { SignJWT } from 'jose';
import crypto from 'crypto';
import { createSecretKey } from 'crypto';
import validator from "validator";
import bcrypt from "bcryptjs";

// login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    const token = await createToken(user._id, user.userType);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      userType: user.userType,
      userId: user._id,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.json({ success: false, message: "Error", error: error.message });
  }
};

// const createToken = (id, userType) => {
//   return jwt.sign({ id, userType }, process.env.JWT_SECRET);
// };

const createToken = async (id, userType) => {
  const secret = createSecretKey(Buffer.from(process.env.JWT_SECRET));

  const token = await new SignJWT({ id, userType })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secret);

  return token;
};

// register user
const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, userType } = req.body;
  try {
    // checking is user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // validating email format and strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please Enter a Valid Email",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be atleast 8 characters",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // creating new user
    const newUser = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      userType: userType,
    });

    // saving user to database
    const user = await newUser.save();
    const token = await createToken(user._id, user.userType);
    res.json({ success: true, token });
  } catch (error) {
    console.error("Login Error:", error);
    res.json({ success: false, message: "Error", error: error.message });
  }
};
export const deleteAllUsers = async (req, res) => {
  try {
    const result = await User.deleteMany({});
    res.status(200).json({
      success: true,
      message: "All users deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting users:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting users",
      error: error.message,
    });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.json({ success: true, message: "Logged out successfully" });
};

export { loginUser, registerUser };
