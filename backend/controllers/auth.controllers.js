import sendMail from "../config/Mail.js"
import gentoken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { OAuth2Client } from "google-auth-library"

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const validateFields = (fields) => {
    for (const [key, value] of Object.entries(fields)) {
        if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
            return `${key} is required`;
        }
    }
    return null;
};

const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: process.env.COOKIE_SECURE === "true" || isProduction,
        sameSite: process.env.COOKIE_SAME_SITE || (isProduction ? "None" : "Lax")
    };
};

export const signup = async (req, res) => {
   try {
    console.log(req.body)  
    const { name, email, password, username } = req.body
    
    const validationError = validateFields({ name, email, password, username });
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    const findbyemail = await User.findOne({ email })
    if (findbyemail){
        return res.status(400).json({ message: "Email already exists " })
    }
    const findbyusername = await User.findOne({ username })
    if (findbyusername){
        return res.status(400).json({ message: "Username already exists " })
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "password must be atleast 6 characters " })
    }
    
    const hashedpassword = await bcrypt.hash(password, 10)
    const user = await User.create({
        name,
        username,
        email,
        password: hashedpassword
    })
    
    const token = await gentoken(user._id)
    res.cookie("token", token, getCookieOptions())
    
    const { password: _, ...safeUser } = user.toObject()
    return res.status(201).json(safeUser)

   } catch (error) {
    console.log("Signup error:", error)
    return res.status(500).json({ message: "signup error" })
   }
}

export const signIn = async (req, res) => {
   try {
    const { password, username } = req.body
    
    const validationError = validateFields({ password, username });
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }
    
    const user = await User.findOne({ username })
    if (!user) {
        return res.status(400).json({ message: "User not found " })
    }
    
    if (user.authProvider === "google" && !user.password) {
        return res.status(400).json({ message: "This account uses Google Sign-In. Please sign in with Google." })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
       return res.status(400).json({ message: "Incorrect Password" }) 
    }
    
    const token = await gentoken(user._id)
    res.cookie("token", token, getCookieOptions())
    
    const { password: _, ...safeUser } = user.toObject()
    return res.status(200).json(safeUser)

   } catch (error) {
    console.log("Signin error:", error)
    return res.status(500).json({ message: "signup error" })
   }
}

export const googleSignIn = async (req, res) => {
    try {
        const { credential } = req.body
        const validationError = validateFields({ credential });
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        })
        const payload = ticket.getPayload()
        const { email, name, sub: googleId, picture } = payload

        let user = await User.findOne({ email })
        if (user) {
            if (user.authProvider !== "google") {
                user.authProvider = "google";
                user.googleId = googleId;
                if (!user.profileImage && picture) {
                    user.profileImage = picture;
                }
                await user.save();
            }
        } else {
            let baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-zA-Z0-9_]/g, "");
            if (!baseUsername) baseUsername = "user";
            let username = baseUsername;
            let counter = 1;
            while (await User.findOne({ username })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }

            user = await User.create({
                name,
                email,
                username,
                googleId,
                authProvider: "google",
                profileImage: picture,
                role: "user"
            });
        }

        const token = await gentoken(user._id)
        res.cookie("token", token, getCookieOptions())

        const { password: _, ...safeUser } = user.toObject()
        return res.status(200).json(safeUser)
    } catch (error) {
        console.log("Google Signin error:", error)
        return res.status(500).json({ message: `Google Signin error: ${error.message}` })
    }
}

export const signOut = async (req, res) => {
    try {
        const options = getCookieOptions();
        delete options.maxAge;
        res.clearCookie("token", options)
        return res.status(200).json({ message: "signOut successfully" })
    } catch (error) {
        return res.status(500).json({ message: `signin error ${error}` }) 
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
