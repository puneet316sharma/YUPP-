import React from 'react'
import dp from "../../assets/dp.png"

function NotificationCard({ noti }) {
  return (
    <div className='w-full flex justify-between items-center py-[10px] px-[12px] bg-[#0f1414] hover:bg-[#182020] rounded-xl transition-all duration-200 cursor-pointer border border-gray-900/50'>
      <div className='flex gap-[12px] items-center flex-1 min-w-0'>
        <div className='w-[44px] h-[44px] rounded-full overflow-hidden flex-shrink-0 border border-gray-800 bg-black flex items-center justify-center'>
          <img 
            src={noti?.sender?.profileImage || dp} 
            alt='' 
            className='w-full h-full object-cover'
          />
        </div>
        
        <div className='flex items-center gap-[6px] text-[14px] leading-tight text-white font-medium select-none truncate pr-2'>
          <span className='font-bold hover:underline cursor-pointer flex-shrink-0'>
            {noti?.sender?.username}
          </span>
          <span className='text-gray-400 font-normal truncate'>
            {noti?.message}
          </span>
        </div>
      </div>

      {(noti?.post || noti?.scroll) && (
        <div className='w-[40px] h-[40px] rounded-md overflow-hidden flex-shrink-0 border border-gray-800 bg-neutral-900 flex items-center justify-center'>
          {noti.scroll ? (
            <video src={noti?.scroll?.media} muted loop className='h-full w-full object-cover' />
          ) : noti.post?.mediaType === "image" ? (
            <img src={noti.post?.media} alt='' className='h-full w-full object-cover' />
          ) : noti.post ? (
            <video src={noti.post?.media} muted loop className='h-full w-full object-cover' />
          ) : null}
        </div>
      )}
    </div>
  )
}

export default NotificationCard