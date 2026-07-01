import React from 'react'
import { useSelector } from 'react-redux'
import dp from "../../assets/dp.png"

function ReceiverMessage({ message }) {
    const { selectedUser } = useSelector(state => state.message)
    return (
        <div className='flex items-end gap-[8px]'>
            <div className='w-[28px] h-[28px] rounded-full overflow-hidden flex-shrink-0 border border-gray-700'>
                <img src={selectedUser?.profileImage || dp} alt='' className='w-full h-full object-cover' />
            </div>
            <div className='max-w-[65%] flex flex-col gap-[6px]'>
                {message.image && (
                    <img src={message.image} alt='' className='max-w-full rounded-2xl rounded-tl-sm object-cover max-h-[260px]' />
                )}
                {message.message && (
                    <div className='bg-[#1e2424] text-white text-[15px] px-[14px] py-[10px] rounded-2xl rounded-tl-sm break-words'>
                        {message.message}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReceiverMessage
