import React from 'react'
import { IoMdArrowBack } from "react-icons/io"
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setselectedUser } from '../../redux/Messageslice'
import dp from "../../assets/dp.png"
import OnlineUsers from './OnlineUsers'

function Messages() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    const { OnlineUsers: onlineUserIds } = useSelector(state => state.socket)
    const { prevChatUsers } = useSelector(state => state.message)

    const openChat = (user) => {
        dispatch(setselectedUser(user))
        navigate("/messageArea")
    }

    return (
        <div className='w-full min-h-[100vh] flex flex-col bg-black'>
            {/* Header */}
            <div className='w-full h-[60px] flex items-center gap-[15px] px-[15px] border-b border-gray-800 sticky top-0 bg-black z-10'>
                <IoMdArrowBack
                    onClick={() => navigate("/")}
                    className='text-white h-[22px] w-[22px] cursor-pointer'
                />
                <h1 className='text-white text-[18px] font-bold flex-1'>{userData?.username}</h1>
            </div>

            {/* Active now row */}
            {userData?.following?.some(u => onlineUserIds?.includes(u._id?.toString())) && (
                <div className='w-full flex flex-col pt-[12px] pb-[4px]'>
                    <span className='text-white font-semibold text-[15px] px-[15px] mb-[10px]'>Active now</span>
                    <div className='flex gap-[18px] overflow-x-auto px-[15px] pb-[10px] scrollbar-hide'>
                        {userData?.following?.map((user, index) =>
                            onlineUserIds?.includes(user._id?.toString()) && (
                                <OnlineUsers key={user._id || index} user={user} />
                            )
                        )}
                    </div>
                </div>
            )}

            {/* Divider */}
            <div className='w-full h-[0.5px] bg-gray-800 my-[4px]' />

            {/* Chat list */}
            <div className='w-full flex flex-col'>
                {(!prevChatUsers || prevChatUsers.length === 0) && (
                    <div className='text-gray-500 text-center mt-[60px] text-[16px]'>No messages yet</div>
                )}
                {prevChatUsers?.map((user, index) => {
                    const isOnline = onlineUserIds?.includes(user?._id?.toString())
                    return (
                        <div
                            key={user._id || index}
                            className='w-full flex items-center gap-[12px] px-[15px] py-[10px] hover:bg-gray-900 cursor-pointer active:bg-gray-800 transition-colors'
                            onClick={() => openChat(user)}
                        >
                            {/* Avatar with online dot */}
                            <div className='relative flex-shrink-0'>
                                <div className='w-[54px] h-[54px] rounded-full overflow-hidden border border-gray-700'>
                                    <img src={user?.profileImage || dp} alt='' className='w-full h-full object-cover' />
                                </div>
                                {isOnline && (
                                    <div className='absolute bottom-[2px] right-[2px] w-[13px] h-[13px] bg-green-500 rounded-full border-2 border-black' />
                                )}
                            </div>
                            {/* Name + status */}
                            <div className='flex flex-col min-w-0'>
                                <span className='text-white font-semibold text-[15px] truncate'>{user?.username}</span>
                                <span className='text-gray-400 text-[13px] truncate'>
                                    {isOnline ? 'Active now' : user?.name || ''}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Messages
