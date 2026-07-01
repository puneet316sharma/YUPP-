import React from 'react'
import logo from "../../assets/logo.png"
import { FaRegHeart } from "react-icons/fa"
import dp from "../../assets/dp.png"
import { useDispatch, useSelector } from 'react-redux'
import { serverUrl } from '../../App'
import { setuserData } from '../../redux/userslic'
import Other from './Other'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Notifications from './Notifications'
import axios from 'axios'

function Lefthome() {
    const { userData, suggestedusers, following } = useSelector(state => state.user || { following: [] })
    const { notificationData } = useSelector(state => state.user)
    const [shownotifications, setshownotifications] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handlelogout = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            dispatch(setuserData(null))
        } catch (error) {
            console.log(error)
        }
    }

    const followedIds = Array.isArray(following) 
        ? following.map(u => (u?._id || u).toString()) 
        : []

    const dynamicSuggestions = Array.isArray(suggestedusers)
        ? suggestedusers.filter(user => user?._id && !followedIds.includes(user._id.toString()))
        : []

  return (
    <div className={`w-[25%] hidden lg:block h-[100vh] bg-[black] border-r-2 border-gray-900 ${shownotifications ? "overflow-hidden" : "overflow-auto"}`}>
      <div className='w-full h-[100px] flex items-center justify-between p-[20px]'>
        <img src={logo} alt="" className='w-[80px]'/> 
      
        <div className='relative z-[100] cursor-pointer' onClick={() => setshownotifications(prev => !prev)}>
          <FaRegHeart className='text-white w-[25px] h-[25px]' />
          {(notificationData?.length > 0 && notificationData.some((noti) => noti.isRead === false)) && (
            <div className='w-[10px] h-[10px] bg-blue-600 rounded-full absolute top-0 right-[-5px]'></div>
          )}
        </div>
      </div>

      {!shownotifications && (
        <>
          <div className='flex items-center w-full justify-between gap-[10px] p-[10px] border-b-2 border-b-gray-900 pb-4'>
            <div className='flex items-center gap-[10px] p-[10px]'>
              <div className='w-[70px] h-[70px] border-2 border-gray-800 rounded-full cursor-pointer overflow-hidden flex-shrink-0 flex items-center justify-center' onClick={() => navigate(`/profile/${userData?.username}`)}>
                <img src={userData?.profileImage || dp} alt='' className='w-full h-full object-cover'/>
              </div>
              <div>
                <div className='text-[18px] text-white font-semibold'>{userData?.username || userData?.Username}</div>
                <div className='text-[15px] text-gray-400 font-semibold'>{userData?.name}</div>
              </div>
            </div>
            <div className='text-blue-500 font-semibold cursor-pointer text-[15px] pr-2' onClick={handlelogout}>
              Log Out
            </div>
          </div>

          <div className='w-full flex flex-col gap-[20px] p-[20px]'>
            <h1 className='text-[white] text-[19px] font-semibold'>
              Suggested Users
            </h1>
            {dynamicSuggestions.slice(0, 3).map((user, index) => {
                return <Other key={user._id || index} user={user} />
            })}
          </div>
        </>
      )}

      {shownotifications && <Notifications />}
    </div>
  )
}

export default Lefthome