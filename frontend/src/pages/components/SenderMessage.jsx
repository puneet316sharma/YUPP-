import React from 'react'
import { useSelector } from 'react-redux'
import dp from "../../assets/dp.png"

function SenderMessage({ message }) {
    const { userData } = useSelector(state => state.user)
    return (
        <div className='flex items-end gap-[8px] justify-end'>
            <div className='max-w-[65%] flex flex-col gap-[6px] items-end'>
                {message.image && (
                    <img src={message.image} alt='' className='max-w-full rounded-2xl rounded-tr-sm object-cover max-h-[260px]' />
                )}
                {message.message && (
                    <div className='bg-gradient-to-br from-[#9500ff] to-[#ff0095] text-white text-[15px] px-[14px] py-[10px] rounded-2xl rounded-tr-sm break-words'>
                        {message.message}
                    </div>
                )}
            </div>
            <div className='w-[28px] h-[28px] rounded-full overflow-hidden flex-shrink-0 border border-gray-700'>
                <img src={userData?.profileImage || dp} alt='' className='w-full h-full object-cover' />
            </div>
        </div>
    )
}

export default SenderMessage
