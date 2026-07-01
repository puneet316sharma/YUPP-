import UploadonCloudinary from "../config/cloudinary.js"
import User from "../models/user.model.js"
import Story from "../models/story.model.js"

export const uploadStory = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        
        const { mediaType } = req.body
        let media;
        if (req.file) {
            media = await UploadonCloudinary(req.file.path)
        } else {
            return res.status(400).json({ message: "media is required" })
        }
        
        const story = await Story.create({
            author: req.userId,
            mediaType: mediaType || "image",
            media
        })

        if (user) {
            if (!Array.isArray(user.story)) {
                user.story = []
            }
            user.story.push(story._id)
            await user.save()
        }
        
        const populatedStory = await Story.findById(story._id)
            .populate("author", "name username profileImage")
            .populate("viewers", "name username profileImage")
            
        return res.status(200).json(populatedStory)
    } catch (error) {
        console.error("Upload Story Error:", error)
        return res.status(500).json({ message: `story upload error: ${error.message}` })
    }
}

export const viewStory = async (req, res) => {
    try {
        const storyId = req.params.storyId
        const story = await Story.findById(storyId)
        if (!story) {
            return res.status(400).json({ message: "story not found" })
        }
        
        if (!Array.isArray(story.viewers)) {
            story.viewers = []
        }
        const viewersIds = story.viewers.map(id => id.toString())
        if (!viewersIds.includes(req.userId.toString())) {
            story.viewers.push(req.userId)
            await story.save()
        }
        
        const populatedStory = await Story.findById(story._id)
            .populate("author", "name username profileImage")
            .populate("viewers", "name username profileImage")
            
        return res.status(200).json(populatedStory)
    } catch (error) {
        console.error("View Story Error:", error)
        return res.status(500).json({ message: `story view error: ${error.message}` })
    }
}

export const getStoryByusername = async (req, res) => {
    try {
        const username = req.params.username
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        
        const story = await Story.find({ author: user._id }).populate("author").populate("viewers", "name username profileImage")
        return res.status(200).json(story)
    } catch (error) {
        console.error("Get Story Error:", error)
        return res.status(500).json({ message: `getstory by username error: ${error.message}` })
    }
}

export const getAllStories = async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId)
        if (!currentUser) {
            return res.status(400).json({ message: "Current user context not found" })
        }
        
        const followingIds = currentUser.following || []
        const stories = await Story.find({ author: { $in: followingIds } })
            .populate("author")
            .sort({ createdAt: -1 })
            
        return res.status(200).json(stories)
    } catch (error) {
        console.error("Get All Stories Error:", error)
        return res.status(500).json({ message: `getAllstories error: ${error.message}` })
    }
}