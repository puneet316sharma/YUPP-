import express from "express"
import { editprofile, follow, followingList, getAllNotifications, getcurrentuser, getprofile, markAsread, search, Suggestedusers } from "../controllers/users.controllers.js"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"

const userRouter= express.Router()
userRouter.get("/current",isAuth,getcurrentuser)
userRouter.get("/suggested",isAuth,Suggestedusers)
userRouter.get("/follow/:targetuserId",isAuth,follow)
userRouter.get("/search",isAuth,search)
userRouter.get("/getAllNotifications",isAuth,getAllNotifications)
userRouter.post("/markAsread",isAuth,markAsread)
userRouter.get("/followingList",isAuth,followingList)
userRouter.post("/editprofile",isAuth,upload.single("profileImage"),editprofile)
userRouter.get("/getprofile/:username",getprofile)
export default userRouter