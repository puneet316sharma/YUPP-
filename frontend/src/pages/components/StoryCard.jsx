import React, { useEffect, useState } from 'react'
import dp from "../../assets/dp.png"
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { IoMdArrowBack } from "react-icons/io"
import { FaEye } from "react-icons/fa"
import Videoplayer from './videoplayer'
import axios from 'axios'
import { serverUrl } from '../../App'

function StoryCard({ storyData }) {
    const navigate = useNavigate()
    const [showViewers, setshowViewers] = useState(false)
    const [progress, setprogress] = useState(0) 
    const { userData } = useSelector(state => state.user || {})
    const storyViewers = storyData?.viewers || []

    // Log this view on mount
    useEffect(() => {
        if (!storyData?._id) return
        axios.get(`${serverUrl}/api/story/view/${storyData._id}`, { withCredentials: true })
            .catch(err => console.log("view error", err))
    }, [storyData?._id])

    useEffect(() => {
        if (showViewers) return;

        const Interval = setInterval(() => {
            setprogress(prev => {
                if (prev >= 100) {
                    clearInterval(Interval);
                    navigate("/")
                    return 100;
                }
                return prev + 1;
            });
        }, 150)
        
        return () => clearInterval(Interval)
    }, [navigate, showViewers])

  return (
    <div className='w-full max-w-[500px] h-[100vh] border-x-2 border-gray-800 pt-[10px] relative flex flex-col justify-center bg-black text-white'>
      
      <div className='flex items-center gap-[10px] absolute top-[30px] left-[20px] z-50'>
        <IoMdArrowBack onClick={() => navigate("/")} className='text-white h-[25px] w-[25px] cursor-pointer hover:scale-110 transition-transform'/>
        <div className='w-[40px] h-[40px] border-2 border-white rounded-full cursor-pointer overflow-hidden flex-shrink-0'>
            <img src={storyData?.author?.profileImage || dp} alt='' className='w-full h-full object-cover' />
        </div>
        <div className='font-semibold w-[120px] truncate text-white'>
           {storyData?.author?.username || "Anonymous"}
        </div>
      </div>

      <div className='absolute top-[10px] left-0 w-full h-[4px] bg-gray-900 z-50 px-2 flex items-center'>
        <div className='h-full bg-white transition-all duration-150 ease-linear rounded-full' style={{ width: `${progress}%` }}></div>
      </div>

      {!showViewers && (
        <>
          <div className='w-full h-[90vh] flex items-center justify-center mt-[40px]'> 
            {storyData?.mediaType === "image" && (
              <div className='w-[95%] h-full flex items-center justify-center'>
                <img src={storyData?.media} alt='' className='max-h-[80vh] w-full rounded-2xl object-contain'/>
              </div>
            )}

            {storyData?.mediaType === "video" && (
              <div className='w-[95%] h-full flex items-center justify-center bg-zinc-950 rounded-2xl overflow-hidden'>
                <Videoplayer media={storyData?.media} />
              </div>
            )}
          </div>

          {storyData?.author?.username === userData?.username && (
            <div className='w-full flex items-center justify-between h-[70px] absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/80 to-transparent cursor-pointer' onClick={() => setshowViewers(true)}>
              <div className='text-white flex items-center gap-[8px] font-medium'> 
                <FaEye className='w-[18px] h-[18px]' />
                <span>{storyViewers.length} views</span>
              </div>

              <div className='flex items-center h-[30px] pr-6'>
                {storyViewers.slice(0, 3).map((viewer, index) => (
                  <div 
                    key={index} 
                    className='w-[30px] h-[30px] border-2 border-black rounded-full overflow-hidden bg-zinc-800 flex-shrink-0'
                    style={{ marginLeft: index > 0 ? '-10px' : '0px', zIndex: 3 - index }} 
                  >
                    <img src={viewer?.profileImage || dp} alt='' className='w-full h-full object-cover'/>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showViewers && (
        <>
          <div className='w-full h-[25%] flex items-center justify-center mt-[70px] bg-zinc-950 p-4 cursor-pointer' onClick={() => setshowViewers(false)}> 
            {storyData?.mediaType === "image" && (
              <img src={storyData?.media} alt='' className='h-full rounded-xl object-contain'/>
            )}
            {storyData?.mediaType === "video" && (
              <div className='h-full aspect-video rounded-xl overflow-hidden'>
                <Videoplayer media={storyData?.media} />
              </div>
            )}
          </div>
          
          <div className='w-full h-[65%] border-t border-zinc-800 bg-zinc-950 rounded-t-3xl p-[20px] flex flex-col'>
            <div className='flex items-center gap-2 text-zinc-400 font-semibold pb-3 border-b border-zinc-900'>
              <FaEye className='text-white' />
              <span>{storyViewers.length} Viewers</span>
            </div>
            
            <div className='w-full overflow-y-auto pt-[15px] flex flex-col gap-[15px] flex-1'>
              {storyViewers.map((viewer, index) => (
                <div key={index} className='w-full flex items-center gap-[15px] py-1 border-b border-zinc-900/50 last:border-0'>
                  <div className='w-[40px] h-[40px] border border-zinc-800 rounded-full overflow-hidden flex-shrink-0'>
                    <img src={viewer?.profileImage || dp} alt='' className='w-full h-full object-cover' />
                  </div>
                  <div className='font-medium text-white truncate flex-1'>
                     {viewer?.username || "Anonymous"}
                  </div>
                </div>
              ))}
              {storyViewers.length === 0 && (
                <div className='text-zinc-500 text-center py-10 font-medium'>No views yet</div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  )
}

export default StoryCard