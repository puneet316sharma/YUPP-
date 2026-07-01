import React from 'react'
import { GoHomeFill } from "react-icons/go";
import { IoIosSearch } from "react-icons/io";
import { MdOutlineOndemandVideo } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import dp from "../../assets/dp.png"
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Nav() {
    const navigate = useNavigate()
    const { userData } = useSelector(state => state.user)
    
  return (
    //  Added left-1/2 and -translate-x-1/2 to perfectly center the fixed dock!
    <div className='w-[90%] lg:w-[40%] h-[80px] bg-black flex justify-around items-center fixed bottom-[20px] left-1/2 -translate-x-1/2 rounded-full shadow-2xl shadow-[#000000] z-[100]'>
      <div onClick={() => navigate("/")}> <GoHomeFill className='cursor-pointer text-white w-[25px] h-[25px]'/></div>
      <div onClick={() => navigate("/search")}><IoIosSearch className='cursor-pointer text-white w-[25px] h-[25px]'/></div>
      <div onClick={() => navigate("/upload")}><FaPlus className='cursor-pointer text-white w-[25px] h-[25px]' /></div>
      <div onClick={() => navigate("/scrolls")}><MdOutlineOndemandVideo className='cursor-pointer text-white w-[28px] h-[28px]' /></div>
      
      {/* Fixed the typo: changed w=[40px] to w-[40px] and added h-[40px] constraint to the img */}
      <div className='w-[40px] h-[40px] border-2 border-white rounded-full cursor-pointer overflow-hidden flex items-center justify-center' onClick={() => navigate(`/profile/${userData?.username}`)}>
         <img src={userData?.profileImage || dp} alt='' className='w-full h-full object-cover'/>
      </div>
    </div>
  )
}

export default Nav