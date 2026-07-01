import React, { useEffect, useRef, useState } from 'react'
import { GoUnmute, GoMute } from "react-icons/go"
import dp from "../../assets/dp.png"
import Followbutton from './Followbutton'
import { useDispatch, useSelector } from 'react-redux'
import { AiFillLike, AiOutlineLike } from "react-icons/ai"
import { FaRegComment } from "react-icons/fa"
import { serverUrl } from '../../App'
import axios from 'axios'
import { IoSendSharp } from "react-icons/io5"
import { setscrollData } from '../../redux/Scrollslice'

function Scrollcard({ scroll }) {
  const videoRef = useRef(null)
  const commentRef = useRef()
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)
  const { scrollData } = useSelector(state => state.scroll)
  const { socket } = useSelector(state => state.socket)

  const [isPlaying, setisPlaying] = useState(true)
  const [isMute, setisMute] = useState(true)   // start muted so autoPlay works on all browsers
  const [progress, setprogress] = useState(0)
  const [message, setmessage] = useState("")
  const [showLike, setshowLike] = useState(false)
  const [showcomment, setshowcomments] = useState(false)

  // Close comment panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (commentRef.current && !commentRef.current.contains(event.target)) {
        setshowcomments(false)
      }
    }
    if (showcomment) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showcomment])

  // Auto-play / pause via IntersectionObserver
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        video.play().catch(() => {})
        setisPlaying(true)
      } else {
        video.pause()
        setisPlaying(false)
      }
    }, { threshold: 0.6 })
    observer.observe(video)
    return () => observer.unobserve(video)
  }, [])

  // Live socket updates for likes/comments on scrolls
  useEffect(() => {
    if (!socket) return
    const handleLikedScroll = (updatedData) => {
      const updated = scrollData.map(p => p._id == updatedData.scrollId ? { ...p, likes: updatedData.likes } : p)
      dispatch(setscrollData(updated))
    }
    const handleCommentScroll = (updatedData) => {
      const updated = scrollData.map(p => p._id == updatedData.scrollId ? { ...p, comments: updatedData.comments } : p)
      dispatch(setscrollData(updated))
    }
    socket.on("LikedScroll", handleLikedScroll)
    socket.on("CommentScroll", handleCommentScroll)
    return () => {
      socket.off("LikedScroll", handleLikedScroll)
      socket.off("CommentScroll", handleCommentScroll)
    }
  }, [socket, scrollData, dispatch])

  const handleClick = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setisPlaying(false)
    } else {
      videoRef.current.play().catch(() => {})
      setisPlaying(true)
    }
  }

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (video && video.duration) {
      setprogress((video.currentTime / video.duration) * 100)
    }
  }

  const handleLike = async () => {
    try {
      const result = await axios.post(`${serverUrl}/api/scroll/like/${scroll._id}`, {}, { withCredentials: true })
      const updatedScrolls = scrollData.map(p => p._id == scroll._id ? result.data : p)
      dispatch(setscrollData(updatedScrolls))
    } catch (error) {
      console.log(error)
    }
  }

  const handleLikeonDoubleclick = () => {
    setshowLike(true)
    setTimeout(() => setshowLike(false), 1000)
    // Only like if not already liked
    const alreadyLiked = scroll.likes?.some(id => id.toString() === userData?._id?.toString())
    if (!alreadyLiked) handleLike()
  }

  const handlecomment = async () => {
    if (!message.trim()) return
    try {
      const result = await axios.post(`${serverUrl}/api/scroll/comment/${scroll._id}`, { message }, { withCredentials: true })
      const updatedScrolls = scrollData.map(p => p._id == scroll._id ? result.data : p)
      dispatch(setscrollData(updatedScrolls))
      setmessage("")
    } catch (error) {
      console.log(error)
    }
  }

  const isLiked = scroll.likes?.some(id => id.toString() === userData?._id?.toString())

  return (
    <div className='w-full lg:w-[480px] h-[100vh] flex items-center justify-center border-r-2 border-gray-800 relative overflow-hidden'>

      {/* Double-tap like animation */}
      {showLike && (
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none'>
          <AiFillLike className='w-[100px] h-[100px] text-white drop-shadow-2xl' />
        </div>
      )}

      {/* Comments panel */}
      <div
        ref={commentRef}
        className={`absolute z-[200] bottom-0 transition-transform duration-500 ease-in-out w-full h-[500px] p-[10px] shadow-2xl shadow-black rounded-t-3xl bg-[#0e1718] left-0 ${showcomment ? "translate-y-0" : "translate-y-full"}`}
      >
        <h1 className='text-white text-[20px] text-center font-semibold mb-2'>Comments</h1>
        <div className='w-full h-[350px] overflow-y-auto flex flex-col gap-[15px]'>
          {scroll.comments?.length === 0 && (
            <div className='font-semibold text-center text-white text-[20px] mt-[50px]'>No Comments Yet</div>
          )}
          {scroll.comments?.map((com, index) => (
            <div key={index} className='w-full flex flex-col gap-[5px] border-b border-gray-800 pb-[10px]'>
              <div className='flex items-center gap-[10px]'>
                <div className='w-[36px] h-[36px] border-2 border-gray-700 rounded-full overflow-hidden flex-shrink-0'>
                  <img src={com.author?.profileImage || dp} alt='' className='w-full h-full object-cover' />
                </div>
                <div className='font-semibold text-white truncate'>{com.author?.username}</div>
              </div>
              <div className='text-white pl-[46px]'>{com.message}</div>
            </div>
          ))}
        </div>
        <div className='w-full h-[60px] flex items-center gap-[10px] mt-[5px]'>
          <div className='w-[36px] h-[36px] border-2 border-gray-700 rounded-full overflow-hidden flex-shrink-0'>
            <img src={userData?.profileImage || dp} alt='' className='w-full h-full object-cover' />
          </div>
          <input
            type="text"
            className='flex-1 border-b-2 border-gray-600 bg-transparent outline-none h-[40px] text-white placeholder:text-gray-400 px-[5px]'
            placeholder='Write a comment...'
            onChange={(e) => setmessage(e.target.value)}
            value={message}
          />
          {message && (
            <button className='cursor-pointer' onClick={handlecomment}>
              <IoSendSharp className='w-[25px] h-[25px] text-white' />
            </button>
          )}
        </div>
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        src={scroll?.media}
        autoPlay
        muted={isMute}
        loop
        playsInline
        className='w-full max-h-[100vh] object-cover'
        onClick={handleClick}
        onTimeUpdate={handleTimeUpdate}
        onDoubleClick={handleLikeonDoubleclick}
      />

      {/* Mute toggle */}
      <div className='absolute top-[20px] z-[100] right-[20px] cursor-pointer' onClick={() => setisMute(prev => !prev)}>
        {!isMute
          ? <GoUnmute className='w-[22px] h-[22px] text-white' />
          : <GoMute className='w-[22px] h-[22px] text-white' />
        }
      </div>

      {/* Progress bar */}
      <div className='absolute bottom-0 left-0 w-full h-[3px] bg-gray-800 z-10'>
        <div className='h-full bg-white transition-all duration-200 ease-linear' style={{ width: `${progress}%` }} />
      </div>

      {/* Author info + actions */}
      <div className='w-full absolute bottom-[10px] p-[15px] flex flex-col gap-[8px]'>
        <div className='flex items-center gap-[8px]'>
          <div className='w-[38px] h-[38px] border-2 border-gray-600 rounded-full overflow-hidden flex-shrink-0'>
            <img src={scroll.author?.profileImage || dp} alt='' className='w-full h-full object-cover' />
          </div>
          <div className='font-semibold text-white truncate max-w-[120px]'>{scroll.author?.username}</div>
          {userData?._id !== scroll.author?._id?.toString() && (
            <Followbutton targetuserId={scroll.author?._id} tailwind={"px-[10px] py-[3px] text-white border-2 text-[13px] rounded-2xl border-white"} />
          )}
        </div>
        {scroll.caption && <div className='text-white text-[14px]'>{scroll.caption}</div>}
      </div>

      {/* Like / Comment buttons */}
      <div className='absolute right-[10px] bottom-[120px] flex flex-col gap-[20px] z-10'>
        <div className='flex flex-col items-center cursor-pointer' onClick={handleLike}>
          {isLiked
            ? <AiFillLike className='w-[28px] h-[28px] text-white' />
            : <AiOutlineLike className='w-[28px] h-[28px] text-white' />
          }
          <span className='text-white text-[13px]'>{scroll.likes?.length || 0}</span>
        </div>
        <div className='flex flex-col items-center cursor-pointer' onClick={() => setshowcomments(true)}>
          <FaRegComment className='w-[26px] h-[26px] text-white' />
          <span className='text-white text-[13px]'>{scroll.comments?.length || 0}</span>
        </div>
      </div>
    </div>
  )
}

export default Scrollcard
