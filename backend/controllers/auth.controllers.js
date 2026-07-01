import sendMail from "../config/Mail.js"
import gentoken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
export const signup =async (req,res)=>{
   try {
    console.log(req.body)  
    const{name, email,password, username}= req.body
    const findbyemail =await User.findOne({email})
    if (findbyemail){
        return res.status(400).json({message:"Email already exists "})
    }
 const findbyusername =await User.findOne({username})
    if (findbyusername){
        return res.status(400).json({message:"Username already exists "})


    }

    if (password.length<6){
 return res.status(400).json({message:"password must be atleast 6 characters "})

    }
const hashedpassword = await bcrypt.hash(password,10)
    const user =await User.create({
        name,
        username,
        email,
    password:hashedpassword
    })
    const token= await gentoken(user._id)
    res.cookie("token",token,{
        httpOnly:true,
        maxAge:10*365*24*60*60*1000,
        secure:process.env.NODE_ENV === "production",
        sameSite:"Strict"
    })
    const {password:_,...safeUser} = user.toObject()
    return res.status(201).json(safeUser)

   } catch (error) {
    console.log("Signup error:", error)
    return res.status(500).json({message:"signup error"})
   }
}






export const signIn =async (req,res)=>{
   try {
    const{password, username}= req.body
    
 const user =await User.findOne({username})
    if (!user){
        return res.status(400).json({message:"User not found "})
    }
const isMatch= await bcrypt.compare(password,user.password)
    if (!isMatch){
       return res.status(400).json({message:"Incorrect Password"}) 
    }
    const token= await gentoken(user._id)
    res.cookie("token",token,{
        httpOnly:true,
        maxAge:10*365*24*60*60*1000,
        secure:process.env.NODE_ENV === "production",
        sameSite:"Strict"
    })
    const {password:_,...safeUser} = user.toObject()
    return res.status(200).json(safeUser)

   } catch (error) {
    console.log("Signin error:", error)
  return res.status(500).json({message:"signup error"})

   }
}




export const signOut = async(req,res)=>{
    try {
        res.clearCookie("token",{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"Strict"
    })
    return res.status(200).json({message:"signOut successfully"})
    } catch (error) {
        return res.status(500).json({message:`signin error ${error}`}) 
    }
}


export const sendotp= async (req,res)=>{
  try {
    const {email}= req.body
    const user = await User.findOne({email})
    if (!user){
      return res.status(400).json({message:"User Not Found"})
    }
    const  otp =Math.floor (1000 + Math.random()*9000).toString()

    user.resetOtp=otp
    user.OtpExpires= Date.now()+ 5*60*1000
    user.isOtpVerified=false
   await  user.save()
   await sendMail(email,otp)
   return res.status(200).json({message:"email successfully sent"})
    
  } catch (error) {
     console.log("SEND OTP ERROR:", error)
     return res.status(500).json({message:`Mail error ${error}`})
  }
}

export const verifyotp= async (req,res)=>{

    try {
        const {email,otp}=req.body
 const user = await User.findOne({email})
 if (!user|| user.resetOtp!=otp || user.OtpExpires<Date.now()){
   return res.status(400).json({message:"invalid or expired otp"})
 }
        user.isOtpVerified=true
        user.resetOtp=undefined
        user.OtpExpires=undefined
        await user.save()
        return res.status(200).json({message:"otp verified successfully"})
    } catch (error) {
        return res.status(500).json({message:`OTP verification error ${error}`})
    }

}

export const resetPassword=async (req,res)=>{
    try {
        const{email,password}=req.body
         const user = await User.findOne({email})
         if (!user|| !user.isOtpVerified){
           return res.status(400).json({message:"otp verification required"})
         }
const hashedpassword= await bcrypt.hash(password,10)
user.password=hashedpassword
user.isOtpVerified=false
await user.save()
return res.status(200).json({message:"password reset successful"})

    } catch (error) {
        return res.status(500).json({message:`OTP verification error ${error}`})
     
    }

}