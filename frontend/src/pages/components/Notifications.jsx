import React from 'react'
import { useNavigate } from 'react-router-dom'
import { IoMdArrowBack } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import NotificationCard from './NotificationCard';
import { serverUrl } from '../../App';
import { useEffect } from 'react';
import axios from 'axios';
import { setnotificationData } from '../../redux/userslic';

function Notifications() {
    const navigate = useNavigate()
    const { notificationData } = useSelector(state => state.user || { notificationData: [] })
    const dispatch = useDispatch()
    
    const ids = Array.isArray(notificationData) ? notificationData.map((n) => n?._id).filter(Boolean) : []

    const markAsread = async () => {
        try {
            if (ids.length === 0) return;
            await axios.post(`${serverUrl}/api/user/markAsread`, { notificationId: ids }, { withCredentials: true })
            await fetchNotifications()
        } catch (error) {
            console.log(error) 
        }
    }

    const fetchNotifications = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/user/getAllNotifications`, { withCredentials: true })
            dispatch(setnotificationData(result.data))
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        markAsread()
    }, [])

  return (
    <div className='w-full h-[calc(100vh-100px)] bg-black flex flex-col'>
      <div className='w-full h-[60px] flex items-center gap-[15px] px-[20px] border-b border-gray-900 sticky top-0 bg-black z-10'>
        <IoMdArrowBack 
          onClick={() => navigate("/")}   
          className='text-white h-[24px] w-[24px] cursor-pointer hover:opacity-80 transition-opacity lg:hidden'
        />
        <h1 className='text-white text-[20px] font-bold tracking-wide'>
          Notifications
        </h1>
      </div> 

      <div className='w-full flex-1 overflow-y-auto px-[15px] py-[10px] custom-scrollbar flex flex-col gap-[12px]'>
        {Array.isArray(notificationData) && notificationData.length > 0 ? (
            notificationData.map((noti, index) => (
                <NotificationCard noti={noti} key={noti?._id || index} />
            ))
        ) : (
            <div className='w-full h-[60%] flex flex-col items-center justify-center text-center gap-[8px]'>
                <div className='text-gray-600 text-[16px] font-medium'>No new notifications yet</div>
                <div className='text-gray-700 text-[13px]'>Activity involving your posts or profile updates will appear here.</div>
            </div>
        )}
      </div>
    </div>
  )
}

export default Notifications