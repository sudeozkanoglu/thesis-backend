import express from 'express';
import { loginUser, registerUser, deleteAllUsers} from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.delete("/deleteAll", deleteAllUsers);


export default userRouter;