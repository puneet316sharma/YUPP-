
import UploadonCloudinary from "../config/cloudinary.js";
import Conversation from "../models/Conversion.model.js";
import Message from "../models/messages.model.js";
import { getSocketId, io } from "../socket.js";

export const sendMessage=async(req,res)=>{
    try {
        const senderId=req.userId
        const receiverId=req.params.receiverId
        const {message}=req.body
        let image;
        if(req.file){
            image=await UploadonCloudinary(req.file.path)
        }
        const newMessage=await Message.create({
            sender:senderId,
            receiver:receiverId,
            message,
            image
        })

        let conversation= await Conversation.findOne({
            participants:{$all:[senderId,receiverId]}
        })
if (!conversation){
    conversation= await Conversation.create({
        participants:[senderId,receiverId],
        messages:[newMessage._id]
    })
}else{
    conversation.messages.push(newMessage._id)
    await conversation.save()
}

const receiverSocketId= getSocketId(receiverId)
if(receiverSocketId){
io.to(receiverSocketId).emit("newMessage",newMessage)}
return res.status(200).json(newMessage)

    } catch (error) {
        return res.status(500).json({message:`send Message error ${error}`})
    }
}

export const getAllMessages=async(req,res)=>{
    const senderId=req.userId
        const receiverId=req.params.receiverId
    try {
        const conversation=await Conversation.findOne({
            participants:{$all:[senderId,receiverId]}
        }).populate("messages")
        return res.status(200).json(conversation?.messages)
    } catch (error) {
         return res.status(500).json({message:`get Message error ${error}`})
    }
}

export const getPrevUserChats= async(req,res)=>{
    try {
        const currentuserId=req.userId
        const conversations= await Conversation.find({
            participants:currentuserId
        }).populate("participants").sort({updatedAt:-1})

        const userMap={}
        conversations.forEach(conv => {
            conv.participants.forEach(user => {
                if(user._id!=currentuserId){
                    userMap[user._id]=user
                }
            });
        });

        const PrevUsers=Object.values(userMap)
        return res.status(200).json(PrevUsers)
    } catch (error) {
          return res.status(500).json({message:`prev user error ${error}`})
    }


}