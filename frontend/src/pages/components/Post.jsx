import React, { useEffect, useState } from 'react'
import dp from "../../assets/dp.png"
import Videoplayer from './videoplayer'
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { IoSaveOutline, IoSaveSharp, IoSendSharp } from "react-icons/io5";
import axios from 'axios';
import { serverUrl } from '../../App';
import { setpostData } from '../../redux/Postslice';
import { setuserData } from '../../redux/userslic';
import Followbutton from './Followbutton';
import { useNavigate } from 'react-router-dom';

function Post({ post }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    
    const { userData } = useSelector(state => state.user || {})
    const postData = useSelector(state => state.post?.postData || state.post || [])
    const { socket } = useSelector(state => state.socket || {})
    
    const [showcomments, setshowcomments] = useState(false)
    const [message, setmessage] = useState("")

    const postLikes = post?.likes || []
    const postComments = post?.comments || []
    const userSaved = userData?.saved || []
    const isLiked = postLikes.some(id => id?.toString() === userData?._id?.toString())
    const isSaved = userSaved.some(id => id?.toString() === post?._id?.toString())


    const handleLike = async () => {
        try {
            const result = await axios.post(`${serverUrl}/api/post/like/${post._id}`, {}, { withCredentials: true })
            const updatedPost = result.data
            const updatedPosts = postData.map(p => p._id === post._id ? updatedPost : p)
            dispatch(setpostData(updatedPosts))
        } catch (error) {
            console.log(error)
        }
    }

    const handlecomment = async () => {
        if (!message.trim()) return;
        try {
            const result = await axios.post(`${serverUrl}/api/post/comment/${post._id}`, { message }, { withCredentials: true })
            const updatedPost = result.data
            const updatedPosts = postData.map(p => p._id === post._id ? updatedPost : p)
            dispatch(setpostData(updatedPosts))
            setmessage("")
        } catch (error) {
            console.log(error.response)
        }
    }

    const handledSaved = async () => {
        try {
            const result = await axios.post(`${serverUrl}/api/post/saved/${post._id}`, {}, { withCredentials: true })
            dispatch(setuserData(result.data))
        } catch (error) {
               console.log(error.response)
        }
    }

    useEffect(() => {
        if (!socket) return
        const handleLikedPost = (updatedData) => {
           const updatedPosts = postData.map(p => p._id === updatedData.postId ? { ...p, likes: updatedData.likes } : p) 
           dispatch(setpostData(updatedPosts)) 
        }
        const handleCommentPost = (updatedData) => {
           const updatedPosts = postData.map(p => p._id === updatedData.postId ? { ...p, comments: updatedData.comments } : p) 
           dispatch(setpostData(updatedPosts)) 
        }
        socket.on("LikedPost", handleLikedPost)
        socket.on("CommentPost", handleCommentPost)
        return () => {
            socket.off("LikedPost", handleLikedPost)
            socket.off("CommentPost", handleCommentPost)
        }
    }, [socket, postData, dispatch])

  return (
    <div className='w-[90%] flex flex-col gap-[10px] bg-white items-center shadow-2xl shadow-[#00000058] rounded-2xl pb-[20px] text-black'>
      <div className='w-full h-[80px] flex justify-between items-center px-[10px]'>
        <div className='flex justify-center items-center gap-[10px] md:gap-[20px] cursor-pointer' onClick={() => navigate(`/profile/${post?.author?.username}`)}>
          <div className='w-[40px] h-[40px] md:w-[60px] md:h-[60px] border-2 border-black rounded-full overflow-hidden'>
            <img src={post?.author?.profileImage || dp} alt='' className='w-full h-full object-cover'/>
          </div>
          <div className='font-semibold w-[150px] truncate'>
             {post?.author?.username || "Anonymous"}
          </div>
        </div>
        {userData?._id !== post?.author?._id && post?.author?._id && (
          <Followbutton tailwind={'px-[10px] min-w-[60px] md:min-w-[100px] py-[5px] h-[30px] md:h-[40px] bg-black text-white rounded-2xl text-[14px] md:text-[16px]'} targetuserId={post.author._id}/>
        )}
      </div>

      <div className='w-[90%] flex items-center justify-center'> 
        {post?.mediaType === "image" && (
          <div className='w-[90%] flex items-center justify-center'>
            <img src={post?.media} alt='' className='h-[80%] rounded-2xl object-cover'/>
          </div>
        )}

        {post?.mediaType === "video" && (
          <div className='w-[80%] flex flex-col items-center justify-center gap-2'>
            <Videoplayer media={post?.media} />
          </div>
        )}
      </div>

      <div className='w-full h-[60px] flex justify-between items-center px-[20px] mt-[10px]'>
        <div className='flex justify-center items-center gap-[10px]'>
          <div className='flex justify-center items-center gap-[5px]'> 
            {!isLiked ? (
              <AiOutlineLike className='w-[25px] h-[25px] cursor-pointer' onClick={handleLike}/>
            ) : (
              <AiFillLike className='w-[25px] h-[25px] cursor-pointer text-black' onClick={handleLike}/>
            )} 
            <span>{postLikes.length}</span>
          </div>
          
          <div className='flex justify-center items-center gap-[5px] cursor-pointer' onClick={() => setshowcomments(prev => !prev)}>
            <FaRegComment className='w-[25px] h-[25px]' />
            <span>{postComments.length}</span>
          </div>
        </div>
        
        <div onClick={handledSaved} className='cursor-pointer flex items-center gap-1'>
          {!isSaved ? (
            <IoSaveOutline className='w-[25px] h-[25px]'/>
          ) : (
            <IoSaveSharp className='w-[25px] h-[25px] text-black'/>
          )}
        </div>
      </div>

      {post?.caption && (
        <div className='w-full px-[20px] gap-[10px] flex justify-start items-center'>
          <h1 className='font-bold'>{post?.author?.username || "Anonymous"}:</h1>
          <div>{post?.caption}</div>
        </div>
      )}

      {showcomments && (
        <div className='flex flex-col w-full gap-[20px] pb-[20px] px-[20px]'>
          <div className='w-full h-[60px] flex items-center justify-between gap-3 relative'>
            <div className='w-[40px] h-[40px] border-2 border-black rounded-full overflow-hidden flex-shrink-0'>
              <img src={userData?.profileImage || dp} alt='' className='w-full h-full object-cover'/>
            </div>  
            <input type="text" className='px-[10px] border-b-2 border-b-gray-300 w-full outline-none h-[40px] bg-transparent' placeholder='Write comment...' onChange={(e) => setmessage(e.target.value)} value={message}/>
            <button className='cursor-pointer text-black hover:scale-115 transition-transform' onClick={handlecomment}><IoSendSharp className='w-[22px] h-[22px]' /></button>
          </div>

          <div className='w-full max-h-[300px] overflow-auto flex flex-col gap-2'> 
            {postComments.map((com, index) => (
              <div key={index} className='w-full py-[10px] flex items-start gap-[15px] border-b border-gray-100'> 
                <div className='w-[35px] h-[35px] border border-black rounded-full overflow-hidden flex-shrink-0'>
                  <img src={com?.author?.profileImage || dp} alt='' className='w-full h-full object-cover'/>
                </div>
                <div className='flex flex-col'>
                  <span className='text-[14px] font-bold'>{com?.author?.username || "Anonymous"}</span>
                  <span className='text-[15px]'>{com?.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Post