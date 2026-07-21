import UploadonCloudinary from "../config/cloudinary.js";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { getSocketId, io } from "../socket.js";
import { moderateText } from "../config/aiService.js";

export const uploadPost = async (req, res) => {
    try {
        const { caption, mediaType, mediaUrl } = req.body
        
        if (caption) {
            const moderation = await moderateText(caption);
            if (!moderation.allowed) {
                return res.status(400).json({ message: moderation.reason || "Content violates platform guidelines." });
            }
        }

        let media = mediaUrl;
        if (!media) {
            if (req.file) {
                media = await UploadonCloudinary(req.file.path)
            } else {
                return res.status(400).json({ message: "media is required" })
            }
        }
        
        const post = await Post.create({
            caption,
            media,
            mediaType,
            author: req.userId
        })
        
        
        await User.findByIdAndUpdate(req.userId, {
            $push: { posts: post._id }
        })
        
        const Populatedpost = await Post.findById(post._id).populate("author", "name username profileImage")
        return res.status(201).json(Populatedpost)
    } catch (error) {
        return res.status(500).json({ message: `populated post error: ${error.message}` })
    }
}

export const getAllpost = async (req, res) => {
    try {
        const posts = await Post.find({})
            .sort({ createdAt: -1 })
            .populate("author", "name username profileImage")
            .populate("comments.author", "name username profileImage")
            
        return res.status(200).json(posts)
    } catch (error) {
        return res.status(500).json({ message: `getAllposts error: ${error.message}` })
    }
}

export const like = async (req, res) => {
    try {
        const postId = req.params.id
        const post = await Post.findById(postId) 

        if (!post) {
            return res.status(400).json({ message: "post not found" })
        }

        const alreadyLiked = post.likes.some(id => id.toString() === req.userId.toString())
        if (alreadyLiked) {
            post.likes = post.likes.filter(id => id.toString() !== req.userId.toString())
        } else {
            post.likes.push(req.userId)
            if (post.author.toString() !== req.userId.toString()) {
                const notification = await Notification.create({
                    sender: req.userId,
                    receiver: post.author,
                    type: "like",
                    post: post._id,
                    message: "liked your post"
                })
                const populatedNotification = await Notification.findById(notification._id).populate("sender receiver post")
                const receiverSocketId = getSocketId(post.author.toString())
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newNotification", populatedNotification)
                }
            }
        }

        io.emit("LikedPost", {
            postId: post._id,
            likes: post.likes
        })

        await post.save()
        await post.populate("author", "name username profileImage")
        return res.status(200).json(post)
    } catch (error) {
        return res.status(500).json({ message: `likedpost error: ${error.message}` }) 
    }
}

export const comment = async (req, res) => {
    try {
        const { message } = req.body
        const postId = req.params.postId

        if (message) {
            const moderation = await moderateText(message);
            if (!moderation.allowed) {
                return res.status(400).json({ message: moderation.reason || "Content violates platform guidelines." });
            }
        }

        const post = await Post.findById(postId)
        
        if (!post) {
            return res.status(400).json({ message: "post not found" })
        }

        post.comments.push({
            author: req.userId,
            message
        })
        
        if (post.author.toString() !== req.userId.toString()) {
            const notification = await Notification.create({
                sender: req.userId,
                receiver: post.author,
                type: "comment",
                post: post._id,
                message: "commented on your post"
            })
            const populatedNotification = await Notification.findById(notification._id).populate("sender receiver post")
            const receiverSocketId = getSocketId(post.author.toString())
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newNotification", populatedNotification)
            }
        }

        io.emit("CommentPost", {
            postId: post._id,
            comments: post.comments
        })
        
        await post.save()
        await post.populate("author", "name username profileImage")
        await post.populate("comments.author", "name username profileImage")
        return res.status(200).json(post)
    } catch (error) {
        return res.status(500).json({ message: `commentpost error: ${error.message}` }) 
    }
}

export const saved = async (req, res) => {
    try {
        const postId = req.params.id
        const user = await User.findById(req.userId)
        
        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }

        const postExists = await Post.findById(postId)
        if (!postExists) {
            return res.status(400).json({ message: "post not found" })
        }

        if (!Array.isArray(user.saved)) {
            user.saved = []
        }

        const alreadySaved = user.saved.some(id => id.toString() === postId.toString())
        if (alreadySaved) {
            user.saved = user.saved.filter(id => id.toString() !== postId.toString())
        } else {
            user.saved.push(postId)
        }
        
        await user.save()
        await user.populate({
            path: "saved",
            populate: { path: "author", select: "name username profileImage" }
        })
        
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `Savedpost error: ${error.message}` }) 
    }
}