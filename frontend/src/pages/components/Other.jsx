import React from 'react'
import { useNavigate } from 'react-router-dom'
import dp from '../../assets/dp.png'
import Followbutton from './Followbutton'

function Other({ user }) {
  const navigate = useNavigate()

  return (
    <div className='flex items-center justify-between w-full p-2 rounded-xl hover:bg-gray-900/50 transition-all duration-200 group'>
      <div 
        className='flex items-center gap-3 cursor-pointer flex-1 min-w-0' 
        onClick={() => navigate(`/profile/${user?.username}`)}
      >
        <div className='w-[44px] h-[44px] rounded-full border border-gray-800 overflow-hidden flex-shrink-0 bg-gray-900 flex items-center justify-center'>
          <img 
            src={user?.profileImage || dp} 
            alt={user?.username} 
            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-200'
          />
        </div>
        
        <div className='flex flex-col min-w-0'>
          <span className='text-[14px] text-white font-semibold truncate group-hover:text-gray-200 transition-colors'>
            {user?.username}
          </span>
          <span className='text-[12px] text-gray-500 truncate'>
            {user?.name || "New User"}
          </span>
        </div>
      </div>

      <div className='flex-shrink-0 ml-2'>
        <Followbutton 
          targetuserId={user?._id}
          tailwind={'px-4 py-1.5 bg-white text-black font-semibold text-[13px] rounded-full hover:bg-gray-200 active:scale-95 transition-all duration-150 shadow-sm'}
        />
      </div>
    </div>
  )
}

export default Other