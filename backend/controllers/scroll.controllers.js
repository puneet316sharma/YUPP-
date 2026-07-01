import UploadonCloudinary from "../config/cloudinary.js";
import Notification from "../models/notification.model.js";
import Scroll from "../models/scroll.model.js";
import User from "../models/user.model.js";
import { getSocketId, io } from "../socket.js";

export const uploadScroll = async (req, res) => {
    try {
        const { caption } = req.body
        let media;
        if (req.file) {
            media = await UploadonCloudinary(req.file.path)
        } else {
            return res.status(400).json({ message: "media is required" })
        }
        
        const scroll = await Scroll.create({
            caption,
            media,
            author: req.userId
        })
        
        const user = await User.findById(req.userId)
        if (user) {
            if (!Array.isArray(user.scrolls)) {
                user.scrolls = []
            }
            user.scrolls.push(scroll._id)
            await user.save()
        }
        
        const Populatedscroll = await Scroll.findById(scroll._id).populate("author", "name username profileImage")
        return res.status(201).json(Populatedscroll)
    } catch (error) {
        return res.status(500).json({ message: `populated scroll error: ${error.message}` })
    }
}

export const like = async (req, res) => {
    try {
        const scrollId = req.params.scrollId
        const scroll = await Scroll.findById(scrollId) 

        if (!scroll) {
            return res.status(400).json({ message: "scroll not found" })
        }

        const alreadyLiked = scroll.likes.some(id => id.toString() == req.userId.toString())
        if (alreadyLiked) {
            scroll.likes = scroll.likes.filter(id => id.toString() != req.userId.toString())
        } else {
            scroll.likes.push(req.userId)
            if (scroll.author._id != req.userId) {
                const notification = await Notification.create({
                    sender: req.userId,
                    receiver: scroll.author._id,
                    type: "like",
                    scroll: scroll._id,
                    message: "liked your scroll"
                })
                const populatedNotification = await Notification.findById(notification._id).populate("sender receiver scroll")
                const receiverSocketId = getSocketId(scroll.author._id)
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newNotification", populatedNotification)
                }
            }
        }
        io.emit("LikedScroll", {
            scrollId: scroll._id,
            likes: scroll.likes
        })
        await scroll.save()
        await scroll.populate("author", "name username profileImage")
        return res.status(200).json(scroll)
    } catch (error) {
        return res.status(500).json({ message: `likedscroll error: ${error.message}` }) 
    }
}

export const comment = async (req, res) => {
    try {
        const { message } = req.body
        const scrollId = req.params.scrollId
        const scroll = await Scroll.findById(scrollId)
        if (!scroll) {
            return res.status(400).json({ message: "scroll not found" })
        }

        scroll.comments.push({
            author: req.userId,
            message
        })

        if (scroll.author._id != req.userId) {
            const notification = await Notification.create({
                sender: req.userId,
                receiver: scroll.author._id,
                type: "comment",
                scroll: scroll._id,
                message: "Commented on your scroll"
            })
            const populatedNotification = await Notification.findById(notification._id).populate("sender receiver scroll")
            const receiverSocketId = getSocketId(scroll.author._id)
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newNotification", populatedNotification)
            }
        }

        io.emit("CommentScroll", {
            scrollId: scroll._id,
            comments: scroll.comments
        })
        await scroll.save()
        await scroll.populate("author", "name username profileImage")
        await scroll.populate("comments.author")
        return res.status(200).json(scroll)
    } catch (error) {
        return res.status(500).json({ message: `comment scroll error: ${error.message}` }) 
    }
}

export const getAllscroll = async (req, res) => {
    try {
        const scrolls = await Scroll.find({}).populate("author", "name username profileImage").populate("comments.author")
        return res.status(200).json(scrolls)
    } catch (error) {
        return res.status(500).json({ message: `getAllscrolls error: ${error.message}` })
    }
}