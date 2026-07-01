import React, { useState } from 'react'
import { ClipLoader } from 'react-spinners'
import axios from "axios" 
import { serverUrl } from '../App'
function ForgotPassword() {
    const[loading, setloading]=useState(false)
    const [step, setstep]=useState(1)
    const [inputClicked,setinputClicked]=useState({
        email:false ,
otp:false,
newpassword:false,
confirmnewpassword:false
    }
     )
     const[err,seterr]= useState("")
     const [email , setemail]=useState("")
     const [otp, setotp]=useState("")
     const [newpassword, setnewpassword]=useState("")
     const [confirmnewpassword, setconfirmnewpassword]=useState("")
const handlestep1=async()=>{
      setloading(true)
      seterr("")
      try {
             
          const result=  await axios.post(`${serverUrl}/api/auth/sendOtp`,{email},{withCredentials:true})
          console.log(result.data)

          setloading(false)
          setstep(2)
      } catch (error) {
            console.log(error)
            seterr(error.response?.data?.message)
                setloading(false)
      }
}
const handlestep2=async()=>{
        setloading(true)
        seterr("")
      try {
            
          const result=  await axios.post(`${serverUrl}/api/auth/verifyOtp`,{email,otp},{withCredentials:true})
          console.log(result.data)
          setloading(false)
          setstep(3)
      } catch (error) {
            console.log(error)
            seterr(error.response?.data?.message)
            setloading(false)
      }
}


const handlestep3=async()=>{
                  if (newpassword!==confirmnewpassword){
                  return seterr("passwords do not match")

            }
      
      seterr("")
      setloading(true)
      try {
            

           
          const result=  await axios.post(`${serverUrl}/api/auth/resetPassword`,{email,password:newpassword},{withCredentials:true})
          console.log(result.data)
          setloading(false)
      } catch (error) {
            console.log(error)
            seterr(error.response?.data?.message)
            setloading(false)
      }
}


  return (
    <div className='w-full  h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col justify-center items-center'>
     {   step==1
&&       <div className='w-[90%] max-w-[500px] h-[500px] bg-white rounded-2xl flex justify-center items-center flex-col border-[#1a1f23]'> 
<h2 className='text-[30px] font-semibold '>Forgot Password</h2>
<div className=' relative flex items-center justify-start w-[90%] h-[50px] mt-[30px]  rounded-2xl  border-2 border-black  ' onClick={()=>setinputClicked({...inputClicked,email:true})}>
<label htmlFor="email" className={`text-gray-700 absolute left-[20px] top-2.5  bg-white text-[15px] ${inputClicked.email?"top-[-13px]":""}`}>Enter Your email</label>
<input type="text" id="email " className='w-[100%] h-[100%] rounded-2xl px-[20px] outline-none border-0 'onChange={(e)=>{setemail(e.target.value)}} required/>

</div>
{err &&<p className='text-red-600'>{err}</p>}
<button className='w-[70%] px-[20px] py-[10px] bg-black text-white font-semibold h-[50px] cursor-pointer  rounded-2xl mt-[30px]' disabled={loading} onClick={handlestep1}>{loading?<ClipLoader size={30} color='white'/>:"Send OTP"} </button>

      </div>}

{step==2 &&  <div className='w-[90%] max-w-[500px] h-[500px] bg-white rounded-2xl flex justify-center items-center flex-col border-[#1a1f23]'> 
<h2 className='text-[30px] font-semibold '>Forgot Password</h2>
<div className=' relative flex items-center justify-start w-[90%] h-[50px] mt-[30px]  rounded-2xl  border-2 border-black  ' onClick={()=>setinputClicked({...inputClicked,otp:true})}>
<label htmlFor="otp" className={`text-gray-700 absolute left-[20px] top-2.5  bg-white text-[15px] ${inputClicked.otp?"top-[-13px]":""}`}>Enter The OTP </label>
<input type="text" id="otp" className='w-[100%] h-[100%] rounded-2xl px-[20px] outline-none border-0 'onChange={(e)=>{setotp(e.target.value)}} required/>

</div>
{err &&<p className='text-red-600'>{err}</p>}
<button className='w-[70%] px-[20px] py-[10px] bg-black text-white font-semibold h-[50px] cursor-pointer  rounded-2xl mt-[30px]' disabled={loading} onClick={handlestep2}>{loading?<ClipLoader size={30} color='white'/>:"Submit"} </button>

      </div>

}

{step==3 && <div className='w-[90%] max-w-[500px] h-[500px] bg-white rounded-2xl flex justify-center items-center flex-col border-[#1a1f23]'> 
<h2 className='text-[30px] font-semibold '>Reset Password</h2>
<div className=' relative flex items-center justify-start w-[90%] h-[50px] mt-[30px]  rounded-2xl  border-2 border-black  ' onClick={()=>setinputClicked({...inputClicked,newpassword:true})}>
<label htmlFor="newpassword" className={`text-gray-700 absolute left-[20px] top-2.5  bg-white text-[15px] ${inputClicked.newpassword?"top-[-13px]":""}`}>Enter New Password </label>
<input type="text" id="newpassword " className='w-[100%] h-[100%] rounded-2xl px-[20px] outline-none border-0 'onChange={(e)=>{setnewpassword(e.target.value)}} required/>

</div>


<div className=' relative flex items-center justify-start w-[90%] h-[50px] mt-[30px]  rounded-2xl  border-2 border-black  ' onClick={()=>setinputClicked({...inputClicked,confirmnewpassword:true})}>
<label htmlFor="confirmnewpassword" className={`text-gray-700 absolute left-[20px] top-2.5  bg-white text-[15px] ${inputClicked.confirmnewpassword?"top-[-13px]":""}`}>Confirm New Password </label>
<input type="text" id="confirmnewpassword " className='w-[100%] h-[100%] rounded-2xl px-[20px] outline-none border-0 'onChange={(e)=>{setconfirmnewpassword(e.target.value)}} required/>

</div>
{err &&<p className='text-red-600'>{err}</p>}
<button className='w-[70%] px-[20px] py-[10px] bg-black text-white font-semibold h-[50px] cursor-pointer  rounded-2xl mt-[30px]' disabled={loading} onClick={handlestep3}>{loading?<ClipLoader size={30} color='white'/>:"Reset Password"} </button>

      </div>}

    </div>
  )
}

export default ForgotPassword
