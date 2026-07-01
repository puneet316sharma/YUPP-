import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // true for port 465 (SSL), false for port 587 (STARTTLS)
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});
const sendMail =async(to,otp)=>{

  await  transporter.sendMail({
        from: `${process.env.EMAIL}`,
to,
subject:"Reset Your Password",
html:`<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 mins.</p>`
    })
    

}
export default sendMail

