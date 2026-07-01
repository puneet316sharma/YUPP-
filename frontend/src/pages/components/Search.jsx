import React, { useEffect, useState } from 'react'
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { CiSearch } from "react-icons/ci";
import axios from 'axios';
import { serverUrl } from '../../App';
import { useDispatch, useSelector } from 'react-redux';
import dp from "../../assets/dp.png"
import { setsearchData } from '../../redux/userslic';

function Search() {
    const navigate = useNavigate()
    const [input, setinput] = useState("")
    const dispatch = useDispatch()
    const { searchData } = useSelector(state => state.user || {})

   const handlesearch = async () => {
    try {
        if (!input.trim()) return; 

        const result = await axios.get(`${serverUrl}/api/user/search`, {
            params: { keyword: input }, 
            withCredentials: true
        })

        dispatch(setsearchData(result.data))
    } catch (error) {
        console.error(error)
    }
}

    useEffect(() => {
        if (input.trim() !== "") {
            handlesearch()
        } else {
            dispatch(setsearchData([]))
        }
    }, [input])

  return (
    <div className='w-full min-h-[100vh] bg-black flex items-center flex-col gap-[20px] pt-[20px]'>
       <div className='w-full h-[60px] flex items-center gap-[20px] px-[20px]'>
          <IoMdArrowBack 
            onClick={() => navigate("/")}   
            className='text-white h-[25px] w-[25px] cursor-pointer hover:scale-110 transition-transform'
          />
       </div>
       
       <div className='w-full h-[80px] flex items-center justify-center'>
         <form className='w-[90%] max-w-[800px] h-[80%] rounded-full bg-[#0f1414] flex items-center px-[20px]' onSubmit={(e) => e.preventDefault()}>
            <CiSearch className='w-[18px] h-[18px] text-white'/>
            <input 
              type='text' 
              className='w-full h-full outline-0 rounded-full px-[20px] text-white text-[18px] bg-transparent' 
              onChange={(e) => setinput(e.target.value)} 
              value={input}
              placeholder="Search..."
            />
         </form>
       </div>

       {input && Array.isArray(searchData) && searchData.map((user, index) => (
          <div key={user._id || index} className='w-[90vw] max-w-[700px] h-[80px] rounded-full bg-white flex items-center gap-[20px] px-[15px] hover:bg-gray-200 cursor-pointer' onClick={() => navigate(`/profile/${user.username}`)}>
            <div className='w-[50px] h-[50px] border-2 border-black rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center'>
                <img src={user.profileImage || dp} alt='' className='w-full h-full object-cover'/>
            </div>
            <div>
                <div className='text-black text-[18px] font-semibold'>{user.username || user.Username}</div>
                <div className='text-gray-500 text-[14px] font-medium'>{user.name}</div>
            </div>
          </div>
       ))}

       {!input && <div className='text-[30px] text-gray-700 font-semibold mt-10'> Search Here....</div>}
    </div>
  )
}

export default Search