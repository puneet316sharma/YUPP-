import express from "express"
import { sendotp,resetPassword, signIn, signOut, signup, verifyotp } from "../controllers/auth.controllers.js"
const authRouter= express.Router()
authRouter.post("/signup",signup)
authRouter.post("/signin",signIn)
authRouter.post("/SendOtp",sendotp)
authRouter.post("/VerifyOtp",verifyotp)
authRouter.post("/resetPassword",resetPassword)

authRouter.get("/signout",signOut)
export default authRouter