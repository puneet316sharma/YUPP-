import React, { useState } from 'react'
import logo from "../assets/logo.png"
import { useCallback } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { ClipLoader } from "react-spinners";
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setuserData } from '../redux/userslic'
function Signup() {
const[inputClicked, setinputClicked]=useState({
  name:false,
  UserName:false,
  email:false,
  password: false
})
//const[showPassword, setshowPassword]=useState(false)
const[loading, setloading]=useState(false)
const[name, setName]=useState("")
const[err,seterr]= useState("")
const[username, setUsername]=useState("")
const[password, setpassword]=useState("")
const[email, setemail]=useState("")
const navigate = useNavigate()
const dispatch = useDispatch()
const handlesignup=async()=>{
  setloading(true)
  seterr("")
  try {
    const result =await axios.post(`${serverUrl}/api/auth/signup`,{name,username,password,email},{withCredentials:true})
   dispatch(setuserData(result.data))
    setloading(false)
  } catch (error) {
   const backendMessage = error.response?.data?.message || error.response?.data?.error || "Signup failed";
    seterr(backendMessage);
    

    console.log("👉 REAL BACKEND ERROR:", error.response?.data);
    
    setloading(false);
  }
}

  return (
    <div className='w-full  h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col justify-center items-center '>
      <div className='w-[90%] lg:max-w-[60%] h-[600px]  bg-white rounded-2xl  flex justify-center items-center overflow-hidden border-2 border-[#1a1f23]'>
<div className='w-full lg:w-[50%] bg-white flex flex-col  items-center p-[10px] gap-[20px] mb-[80px]'>
<div className='flex gap-[5px] items-center text-[20px] font-semibold mt-[40px]'>
  <span>Sign Up to</span>
  <img src={logo} alt="" className='w-[120px] h-[100px]'/>
</div>
<div className=' relative flex items-center justify-start w-[90%] h-[50px]  rounded-2xl   border-2 border-black  ' onClick={()=>setinputClicked({...inputClicked,name:true})}>
<label htmlFor="name" className={`text-gray-700 absolute left-[20px] top-2.5  bg-white text-[15px] ${inputClicked.name?"top-[-13px]":""}`}>Enter Your Name</label>
<input type="text" id="name " className='w-[100%] h-[100%] rounded-2xl px-[20px] outline-none border-0 ' onChange={(e)=>{setName(e.target.value)}}required/>

</div>

<div className=' relative flex items-center justify-start w-[90%] h-[50px]  rounded-2xl   border-2 border-black  ' onClick={()=>setinputClicked({...inputClicked,UserName:true})}>
<label htmlFor="Username" className={`text-gray-700 absolute left-[20px] top-2.5  bg-white text-[15px] ${inputClicked.UserName?"top-[-13px]":""}`}>Enter Your UserName</label>
<input type="text" id="Username " className='w-[100%] h-[100%] rounded-2xl px-[20px] outline-none border-0 ' onChange={(e)=>{setUsername(e.target.value)}}required/>

</div>

<div className=' relative flex items-center justify-start w-[90%] h-[50px]  rounded-2xl  border-2 border-black  ' onClick={()=>setinputClicked({...inputClicked,password:true})}>
<label htmlFor="Password" className={`text-gray-700 absolute left-[20px] top-2.5  bg-white text-[15px] ${inputClicked.password?"top-[-13px]":""}`}>Enter password</label>
<input type="password" id="Password " className='w-[100%] h-[100%] rounded-2xl px-[20px] outline-none border-0 'onChange={(e)=>{setpassword(e.target.value)}} required/>

</div>
{err &&<p className='text-red-600'>{err}</p>}
<div className=' relative flex items-center justify-start w-[90%] h-[50px]  rounded-2xl  border-2 border-black  ' onClick={()=>setinputClicked({...inputClicked,email:true})}>
<label htmlFor="email" className={`text-gray-700 absolute left-[20px] top-2.5  bg-white text-[15px] ${inputClicked.email?"top-[-13px]":""}`}>Enter Your email</label>
<input type="text" id="email " className='w-[100%] h-[100%] rounded-2xl px-[20px] outline-none border-0 'onChange={(e)=>{setemail(e.target.value)}} required/>

</div>
<button className='w-[70%] px-[20px] py-[10px] bg-black text-white font-semibold h-[50px] cursor-pointer  rounded-2xl mt-[30px]'onClick={handlesignup} disabled={loading}>{loading?<ClipLoader size={30} color='white'/>:"Sign Up"} </button>
<p className='cursor-pointer text-gray-800'>Already have an account ? <span className='border-b-2 border-b-black pb-[3px] text-black' onClick={()=>navigate("/signin")}>Sign In</span></p>
</div>
<div className='lg:flex justify-center items-center bg-[#000000] flex-col gap-[10px] text-white text-[16px] font-semibold rounded-l-[30px] shadow-2xl shadow-black md:w-[50%] h-full hidden'>
<img src={logo} alt='' className='w-[60%]'/>
<p>Speak Your World </p>
</div>
      </div>
    </div>
  )
}

export default Signup
