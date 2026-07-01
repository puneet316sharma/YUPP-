import express from "express"

import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { comment, getAllpost, like, saved, uploadPost } from "../controllers/post.controllers.js"
const postRouter= express.Router()
postRouter.post("/upload",isAuth,upload.single("media"),uploadPost)
postRouter.get("/getAll",isAuth,getAllpost)
postRouter.post("/comment/:postId",isAuth,comment)
postRouter.post("/like/:id",isAuth,like)
postRouter.post("/saved/:id",isAuth,saved)
export default postRouter