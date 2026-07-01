import express from "express"

import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"

import { comment, getAllscroll, like, uploadScroll } from "../controllers/scroll.controllers.js"
const scrollRouter= express.Router()
scrollRouter.post("/upload",isAuth,upload.single("media"),uploadScroll)
scrollRouter.get("/getAll",isAuth,getAllscroll)
scrollRouter.post("/comment/:scrollId",isAuth,comment)
scrollRouter.post("/like/:scrollId",isAuth,like)

export default scrollRouter