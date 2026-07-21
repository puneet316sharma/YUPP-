import http from "http"
import express from "express"
import { Server } from "socket.io"
import User from "./models/user.model.js"

const app = express()
const server = http.createServer(app)
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"
const io = new Server(server, {
    cors: {
        origin: [frontendUrl, "https://yupp-wn71.onrender.com", "http://localhost:5173", "http://127.0.0.1:5173"], 
        methods: ["GET", "POST"] 
    }
})

const userSocketMap = {}  
const activeCalls = {} // maps userId -> partnerId

export const getSocketId = (receiverId) => {
    return userSocketMap[receiverId]
}

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId
    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap))

    // Video Call Signaling Events
    socket.on("call:offer", ({ to, offer, callerInfo }) => {
        const targetSocketId = getSocketId(to)
        if (targetSocketId) {
            activeCalls[userId] = to
            activeCalls[to] = userId
            io.to(targetSocketId).emit("call:offer", { from: userId, offer, callerInfo })
        }
    })

    socket.on("call:answer", ({ to, answer }) => {
        const targetSocketId = getSocketId(to)
        if (targetSocketId) {
            io.to(targetSocketId).emit("call:answer", { from: userId, answer })
        }
    })

    socket.on("call:ice-candidate", ({ to, candidate }) => {
        const targetSocketId = getSocketId(to)
        if (targetSocketId) {
            io.to(targetSocketId).emit("call:ice-candidate", { from: userId, candidate })
        }
    })

    socket.on("call:end", ({ to }) => {
        const targetSocketId = getSocketId(to)
        if (targetSocketId) {
            io.to(targetSocketId).emit("call:end", { from: userId })
        }
        delete activeCalls[userId]
        if (to) delete activeCalls[to]
    })
    
    socket.on("disconnect", () => {
        if (userId && userSocketMap[userId]) {
            delete userSocketMap[userId]
        }
        
        // Cleanup active call on disconnect
        if (userId && activeCalls[userId]) {
            const partnerId = activeCalls[userId]
            const partnerSocketId = getSocketId(partnerId)
            if (partnerSocketId) {
                io.to(partnerSocketId).emit("call:end", { from: userId })
            }
            delete activeCalls[userId]
            delete activeCalls[partnerId]
        }
      
        io.emit('getOnlineUsers', Object.keys(userSocketMap))
    })
}) 

export { app, io, server }
