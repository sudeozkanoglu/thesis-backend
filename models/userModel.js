import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type:String, required:true},
    email: {type:String, required:true, unique:true},
    password: {type:String, required:true},
    userType: {type:String, required:true},
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "teacher" }, 
}, {minimize:false})

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;