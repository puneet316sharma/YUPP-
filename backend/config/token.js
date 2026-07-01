import jwt from "jsonwebtoken"

const gentoken = async (userId)=>{
    try {
        const token = await jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"10y"})
        return token
    } catch (error) {
        console.log("token generation error:", error)
        return null
    }

}
export default gentoken