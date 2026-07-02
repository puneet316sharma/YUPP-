import express from "express"
import dotenv from "dotenv"
import ConnectDb from "./config/DB.js"
import cookieParser from "cookie-parser"
import cors from"cors"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/users.route.js"
import postRouter from "./routes/post.routes.js"
import scrollRouter from "./routes/scroll.routes.js"
import storyRouter from "./routes/story.routes.js"
import MessageRouter from "./routes/message.routes.js"
import { app, server } from "./socket.js"
dotenv.config()

const port = process.env.PORT || 5000
app.use(cors({
   origin:"https://yupp-wn71.onrender.com",
   credentials:true
}))
   app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/post",postRouter)
app.use("/api/scroll",scrollRouter)
app.use("/api/story",storyRouter)
app.use("/api/message",MessageRouter)
server.listen(port, ()=>{
    ConnectDb()
    console.log(`Server running on http://localhost:${port}`)
})
