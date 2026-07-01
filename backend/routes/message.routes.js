import express from "express"

import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { getAllMessages, getPrevUserChats, sendMessage } from "../controllers/message.controllers.js"


const MessageRouter= express.Router()
MessageRouter.post("/send/:receiverId",isAuth,upload.single("image"),sendMessage)
MessageRouter.get("/getAll/:receiverId",isAuth,getAllMessages)
MessageRouter.get("/prevChats",isAuth,getPrevUserChats)


export default MessageRouter