import express from "express"
import dotenv from "dotenv"
import ConnectDb from "./config/DB.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import rateLimit from "express-rate-limit"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/users.route.js"
import postRouter from "./routes/post.routes.js"
import scrollRouter from "./routes/scroll.routes.js"
import storyRouter from "./routes/story.routes.js"
import MessageRouter from "./routes/message.routes.js"
import aiRouter from "./routes/ai.routes.js"
import { app, server } from "./socket.js"

dotenv.config()

const port = process.env.PORT || 5000
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"

app.use(cors({
   origin: [frontendUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
   credentials: true
}))

app.use(express.json())
app.use(cookieParser())

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many auth requests, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
})

const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { message: "Too many AI requests, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
})

app.use("/api/auth", authLimiter, authRouter)
app.use("/api/user", userRouter)
app.use("/api/post", postRouter)
app.use("/api/scroll", scrollRouter)
app.use("/api/story", storyRouter)
app.use("/api/message", MessageRouter)
app.use("/api/ai", aiLimiter, aiRouter)

server.listen(port, () => {
    ConnectDb()
    console.log(`Server running on http://localhost:${port}`)
})
