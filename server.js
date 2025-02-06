import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import userRouter from "./routes/userRoute.js"
import teacherRouter from "./routes/teacherRoute.js"
import courseRouter from "./routes/courseRoute.js"
import 'dotenv/config' 


// app config 
const app = express()
const port = 4000

// middleware
app.use(express.json())
app.use(cors())

// db connection
connectDB();

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/teacher", teacherRouter)
app.use("/api/courses", courseRouter)

app.get("/", (req,res)=>{
    res.send("API Working")
})

app.listen(port, ()=>{
    console.log(`Server is running on port http://localhost:${port}`)
})
