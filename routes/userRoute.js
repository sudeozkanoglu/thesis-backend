import express from 'express';
import { loginUser, registerUser, deleteAllUsers, logoutUser} from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.delete("/deleteAll", deleteAllUsers);
userRouter.get("/logout", logoutUser);

export default userRouter;