import jwt from "jsonwebtoken"
const isAuth=async(req,res,next)=>{
    try {
        const token = req.cookies.token
if (!token){
   return res.status(400).json({message:"token not found"})}

const verifytoken = await jwt.verify(token,process.env.JWT_SECRET)
req.userId=verifytoken.userId
next()
    } catch (error) {
       return res.status(401).json({message:`the auth error is ${error}`}) 
    }
}
export default isAuth