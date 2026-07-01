import React, { useEffect, useState } from 'react'
import dp from "../../assets/dp.png"
import { GoPlusCircle } from "react-icons/go";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { serverUrl } from '../../App';
import axios from 'axios'; 

function StoryDp({ ProfileImage, username, story }) {
  const navigate = useNavigate()
  const { userData } = useSelector(state => state.user || {})
  const { storyData, storyList } = useSelector(state => state.story || {})
  const [viewed, setviewed] = useState(false)

  useEffect(() => {
    const currentUserId = userData?._id?.toString()
    if (!currentUserId || !story?.viewers) return

    const hasViewed = story.viewers.some(
      (viewer) => viewer?._id?.toString() === currentUserId || viewer?.toString() === currentUserId
    )
    setviewed(hasViewed)
  }, [story, userData, storyData, storyList])

  const handleViewers = async () => {
    if (!story?._id) return
    try {
      await axios.get(`${serverUrl}/api/story/view/${story._id}`, { withCredentials: true })
    } catch (error) {
      console.log("Error logging view:", error)
    }
  }

  const handleclick = () => {
    if (username === "Your Story") {
      if (!story) {
        navigate("/upload")
      } else {
        handleViewers()
        navigate(`/story/${userData?.username}`)
      }
    } else if (story) {
      handleViewers()
      navigate(`/story/${username}`)
    }
  }

  return (
    <div className='flex flex-col items-center w-[80px] gap-1'>
      <div 
        className={`w-[75px] h-[75px] ${
          story 
            ? viewed 
              ? "bg-gradient-to-b from-zinc-600 to-zinc-800" 
              : "bg-gradient-to-b from-blue-500 to-indigo-600" 
            : "bg-transparent"
        } rounded-full flex justify-center items-center relative cursor-pointer`} 
        onClick={handleclick}
      >
        <div className='w-[66px] h-[66px] border-2 border-black rounded-full overflow-hidden bg-zinc-900'>
          <img src={ProfileImage || dp} alt='' className='w-full h-full object-cover'/>
        </div>

        {!story && username === "Your Story" && (
          <GoPlusCircle className='text-black absolute bottom-[2px] bg-white right-[2px] rounded-full w-[20px] h-[20px] shadow-md' />
        )}
      </div>
      <div className='text-[12px] text-center truncate w-full text-zinc-300 font-medium px-1'>{username}</div>
    </div>
  )
}

export default StoryDp