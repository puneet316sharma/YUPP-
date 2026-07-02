import http from "http"
import express from "express"
import { Server } from "socket.io"
import User from "./models/user.model.js"

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "https://yupp-wn71.onrender.com", 
        methods: ["GET", "POST"] 
    }
})

const userSocketMap = {}  
export const getSocketId = (receiverId) => {
    return userSocketMap[receiverId]
}

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId
    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id
    }

    
    io.emit('getOnlineUsers', Object.keys(userSocketMap))

    
    socket.on("disconnect", () => {
        if (userId && userSocketMap[userId]) {
            delete userSocketMap[userId]
        }
      
        io.emit('getOnlineUsers', Object.keys(userSocketMap))
    })
}) 

export { app, io, server }
