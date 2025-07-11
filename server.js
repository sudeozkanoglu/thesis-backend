import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import userRouter from "./routes/userRoute.js"
import teacherRouter from "./routes/teacherRoute.js"
import courseRouter from "./routes/courseRoute.js"
import studentRouter from "./routes/studentRoute.js"
import examRouter from "./routes/examRoute.js"
import questionRouter from "./routes/questionRoute.js"
import notificationRouter from "./routes/notificationRoute.js"
import examSubmissionRouter from "./routes/examSubmissionRoute.js"
import ttsRouter from "./routes/ttsRoute.js"
import 'dotenv/config' 
import sttRouter from "./routes/sttRoute.js"


// app config 
const app = express()
const port = 4000

// middleware
app.use(express.json())
app.use(
  cors({
    origin: "http://localhost:3000", 
    credentials: true,               
  })
);

// db connection
connectDB();

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/teacher", teacherRouter)
app.use("/api/courses", courseRouter)
app.use("/api/students", studentRouter)
app.use("/api/exams", examRouter)
app.use("/api/questions", questionRouter)
app.use("/api/notifications", notificationRouter)
app.use("/api/exam-submissions", examSubmissionRouter)
app.use('/api', ttsRouter);
app.use('/api', sttRouter);

app.get("/", (req,res)=>{
    res.send("API Working")
})

app.listen(port, ()=>{
    console.log(`Server is running on port http://localhost:${port}`)
})
