import UploadonCloudinary from "../config/cloudinary.js"
import Notification from "../models/notification.model.js"
import User from "../models/user.model.js"
import { getSocketId, io } from "../socket.js"

export const getcurrentuser = async (req, res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId).select("-password").populate([
            {
                path: "posts",
                populate: [
                    { path: "author", select: "-password" },
                    { path: "comments" }
                ]
            },
            { path: "scrolls" },
            { path: "story" },
            { path: "following", select: "-password" }
        ])

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `get current user error ${error}` })
    }
}

export const Suggestedusers = async (req, res) => {
    try {
        const users = await User.find({
            _id: {
                $ne: req.userId
            }
        }).select("-password")
        
        return res.status(200).json(users)
    } catch (error) {
        return res.status(500).json({ message: `get suggested user error ${error}` })
    }
}

export const editprofile= async(req,res)=>{
    try {
        const{name , username,bio,profession, gender}=req.body
        const user=await User.findById(req.userId).select("-password")
        if(!user){
            return res.status(400).json({message:"user not found"})
        }
        const sameuserwithUsername= await User.findOne({username}).select("-password")
        if(sameuserwithUsername && sameuserwithUsername._id!=req.userId){
            return res.status(400).json({message:"username already exists"})
        }
        let profileImage;
        if (req.file){
            profileImage=await UploadonCloudinary(req.file.path)
        }
        user.name=name
        user.username=username
        if(profileImage){
        user.profileImage=profileImage}
        user.bio=bio
        user.profession=profession
        user.gender=gender
        await user.save()
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`editprofile error  ${error}`})
    }
}

export const getprofile=async(req,res)=>{
    try {
        const username=req.params.username
        const user = await User.findOne({username}).select("-password").populate([
            { path: "posts" },
            { path: "scrolls" },
            { path: "followers", select: "-password" },
            { path: "following", select: "-password" }
        ])
        if(!user){
           return res.status(404).json({message:"user not found"})   
        }
        return res.status(200).json(user)
    } catch (error) {
         return res.status(500).json({message:`get profile error  ${error}`})
    }
}

export const follow = async (req, res) => {
    try {
        const currentuserId = req.userId
        const targetuserId = req.params.targetuserId

        if (!targetuserId) {
            return res.status(400).json({ message: "target user is not found " })
        }

        if (currentuserId == targetuserId) {
            return res.status(400).json({ message: "you can not follow yourself " })
        }

        const currentuser = await User.findById(currentuserId)
        const targetuser = await User.findById(targetuserId)

        if (!currentuser || !targetuser) {
            return res.status(404).json({ message: "User not found" })
        }

        const isfollowing = currentuser.following.includes(targetuserId)

        if (isfollowing) {
            currentuser.following = currentuser.following.filter(id => id.toString() != targetuserId)
            targetuser.followers = targetuser.followers.filter(id => id.toString() != currentuserId)
            await currentuser.save()
            await targetuser.save()
            return res.status(200).json({
                following: false,
                message: "unfollowed successfully"
            })
        } else {
            currentuser.following.push(targetuserId)
            targetuser.followers.push(currentuserId)

            if (currentuser._id.toString() !== targetuser._id.toString()) {
                const notification = await Notification.create({
                    sender: currentuser._id,
                    receiver: targetuser._id,
                    type: "follow",
                    message: "started following you"
                })

                try {
                    const populatedNotification = await Notification.findById(notification._id).populate("sender receiver")
                    const receiverSocketId = getSocketId(targetuser._id)
                    if (receiverSocketId) {
                        io.to(receiverSocketId).emit("newNotification", populatedNotification)
                    }
                } catch (socketError) {
                    console.error(socketError.message)
                }
            }

            await currentuser.save()
            await targetuser.save()
            return res.status(200).json({
                following: true,
                message: "followed successfully"
            })
        }
    } catch (error) {
        return res.status(500).json({ message: `follow error ${error}` })
    }
}

export const followingList=async(req,res)=>{
    try {
      const result = await User.findById(req.userId)
      return res.status(200).json(result?.following)
    } catch (error) {
     return res.status(500).json({message:`follow error  ${error}`})    
    }
}

export const search = async (req, res) => {
    try {
        const keyWord = req.query.keyword
        if (!keyWord) {
            return res.status(400).json({ message: "keyword is required" })
        }

        const users = await User.find({
            $or: [
                { username: { $regex: keyWord, $options: "i" } },
                { name: { $regex: keyWord, $options: "i" } }
            ]
        }).select("-password")

        return res.status(200).json(users)
    } catch (error) {
        return res.status(500).json({ message: `search error ${error}` })
    }
}

export const getAllNotifications= async (req,res)=>{
    try {
        const notifications=await Notification.find({
            receiver:req.userId
        }).populate("sender receiver post scroll").sort({createdAt:-1})
        return res.status(200).json(notifications)
    } catch (error) {
             return res.status(500).json({message:`get All Notifications error  ${error}`}) 
    }
}

export const markAsread=async(req,res)=>{
    try {
        const {notificationId}=req.body
        
       if(Array.isArray(notificationId)){
        await Notification.updateMany(
            {
            _id:{$in:notificationId},receiver:req.userId
            },
            {
                $set:{isRead:true}
            }
        );
       }else {
        await Notification.findOneAndUpdate(
            {_id:notificationId,receiver:req.userId},
            {
                $set:{isRead:true}
            }
        );
       }
        return res.status(200).json({message:"marked as read"})
    } catch (error) {
        return res.status(500).json({message:`markAsRead error  ${error}`}) 
    }
}