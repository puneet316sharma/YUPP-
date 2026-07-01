import React, { useState, useEffect } from 'react'
import { serverUrl } from '../App'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setprofileData, setuserData } from '../redux/userslic'
import { IoMdArrowBack } from "react-icons/io";
import dp from "../assets/dp.png"
import Nav from './components/Nav'
import Followbutton from './components/Followbutton'
import Post from './components/Post'
import Other from './components/Other'
import { setselectedUser } from '../redux/Messageslice'
import axios from 'axios'

function Profile() {
    const { username } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { profileData, userData } = useSelector(state => state.user || {})
    const { postData } = useSelector(state => state.post || { postData: [] })
    const [posttype, setposttype] = useState("posts")
    const [listModal, setlistModal] = useState(null) // "followers" | "following" | null

    const handleprofile = async () => {
        dispatch(setprofileData(null))
        try {
            const result = await axios.get(`${serverUrl}/api/user/getprofile/${username}`, { withCredentials: true })
            const profilePayload = result.data?.user || result.data
            dispatch(setprofileData(profilePayload))
        } catch (error) {
            console.log("getprofile error:", error)
        }
    }

    useEffect(() => {
        handleprofile()
    }, [username, dispatch])

    const handlelogout = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            dispatch(setuserData(null))
            navigate("/login")
        } catch (error) {
            console.log(error)
        }
    }

    const pId = profileData?._id || profileData?.user?._id || "";
    const uId = userData?._id || "";
    const isOwnProfile = pId && uId && pId.toString() === uId.toString();

  return (
    <div className='w-full min-h-screen bg-black text-white'>
      <div className='w-full h-[80px] flex justify-between items-center px-[30px]'>
        <div onClick={() => navigate("/")}>
          <IoMdArrowBack className='text-white h-[25px] w-[25px] cursor-pointer' />
        </div>
        <div className='font-semibold text-[20px]'>{profileData?.username || username}</div>
        <div className='font-semibold cursor-pointer text-[20px] text-blue-500' onClick={handlelogout}>Log Out</div>
      </div>

      <div className='w-full h-[150px] flex items-start gap-[20px] lg:gap-[50px] pt-[20px] px-[10px] justify-center'>
        <div className='w-[80px] h-[80px] md:w-[140px] md:h-[140px] border-2 border-black rounded-full cursor-pointer overflow-hidden flex-shrink-0'>
          <img src={profileData?.profileImage || dp} alt='' className='w-full h-full object-cover' />
        </div>
       
        <div>
          <div className='font-semibold text-[22px] text-white'>{profileData?.name || "Loading..."}</div>
          <div className='text-[17px] text-[#ffffffe8]'>{profileData?.profession || "New user"}</div>
          <div className='text-[17px] text-[#ffffffe8]'>{profileData?.bio || ""}</div>
        </div>
      </div>

      <div className='w-full h-[100px] flex items-center justify-center gap-[40px] md:gap-[60px] px-[20px] pt-[30px]'>
        <div className='text-center'>
          <div className='font-semibold text-[22px] md:text-[30px]'>{profileData?.posts?.length || 0}</div>
          <div className='text-[18px] md:text-[22px] text-[#ffffffc7]'>Posts</div>
        </div>

        <div className='text-center cursor-pointer' onClick={() => setlistModal("followers")}>
          <div className='font-semibold text-[22px] md:text-[30px]'>{profileData?.followers?.length || 0}</div>
          <div className='text-[18px] md:text-[22px] text-[#ffffffc7]'>Followers</div>
        </div>

        <div className='text-center cursor-pointer' onClick={() => setlistModal("following")}>
          <div className='font-semibold text-[22px] md:text-[30px]'>{profileData?.following?.length || 0}</div>
          <div className='text-[18px] md:text-[22px] text-[#ffffffc7]'>Following</div>
        </div>
      </div>

      <div className='w-full h-[80px] flex justify-center items-center gap-[20px] mt-[10px]'>
        {isOwnProfile ? (
          <button 
            className='px-[10px] min-w-[150px] py-[5px] h-[40px] bg-white text-black font-semibold cursor-pointer rounded-2xl' 
            onClick={() => navigate("/editprofile")}
          >
            Edit Profile
          </button>
        ) : (
          <div className='flex items-center gap-[20px]'>
            <Followbutton 
              tailwind={'px-[10px] min-w-[150px] py-[5px] h-[40px] bg-white text-black font-semibold cursor-pointer rounded-2xl'} 
              targetuserId={pId ? pId.toString() : ""} 
              onFollowChange={handleprofile}
            />
            <button 
              className='px-[10px] min-w-[150px] py-[5px] h-[40px] bg-white text-black font-semibold cursor-pointer rounded-2xl' 
              onClick={() => {
                const targetUserObj = profileData?.user || profileData;
                if (targetUserObj) {
                  dispatch(setselectedUser(targetUserObj));
                  navigate("/messageArea");
                }
              }}
            >
              Message
            </button>
          </div>
        )}
      </div>

      <div className='w-full min-h-[100vh] flex justify-center mt-[20px]'>
        <div className='w-full max-w-[900px] flex flex-col items-center rounded-t-[30px] bg-white relative gap-[20px] pt-[30px]'>
          {isOwnProfile && (
            <div className='w-[90%] max-w-[500px] h-[80px] bg-[white] rounded-full flex justify-center items-center gap-[10px] border border-gray-200 shadow-sm'>
              <div className={`${posttype === "posts" ? "bg-black text-white shadow-xl" : "text-black"} w-[48%] h-[80%] flex justify-center items-center text-[19px] font-semibold rounded-full cursor-pointer transition-all`} onClick={() => setposttype("posts")}>
                Posts
              </div>
              <div className={`${posttype === "saved" ? "bg-black text-white shadow-xl" : "text-black"} w-[48%] h-[80%] flex justify-center items-center text-[19px] font-semibold rounded-full cursor-pointer transition-all`} onClick={() => setposttype("saved")}>
                Saved
              </div>
            </div>
          )}
              
          <Nav />

          <div className='w-full flex flex-col items-center gap-[20px]'>
            {posttype === "posts" && Array.isArray(postData) && postData.map((post, index) => (
              post?.author?._id === pId && <Post post={post} key={post?._id || index} />
            ))}
            
            {isOwnProfile && posttype === "saved" && Array.isArray(userData?.saved) && userData.saved.map((post, index) => (
              <Post post={post} key={post?._id || index} />
            ))}
          </div>
        </div>
      </div>

      {listModal && (
        <div className='fixed inset-0 bg-black/70 z-[200] flex items-center justify-center px-[20px]' onClick={() => setlistModal(null)}>
          <div className='w-full max-w-[420px] max-h-[70vh] bg-[#0e1111] rounded-2xl overflow-hidden flex flex-col' onClick={(e) => e.stopPropagation()}>
            <div className='w-full h-[60px] flex items-center justify-between px-[20px] border-b border-gray-800 flex-shrink-0'>
              <h2 className='text-white text-[18px] font-semibold capitalize'>{listModal}</h2>
              <div className='text-white text-[22px] cursor-pointer' onClick={() => setlistModal(null)}>&times;</div>
            </div>
            <div className='w-full overflow-y-auto p-[10px] flex flex-col gap-[5px]'>
              {(profileData?.[listModal] || []).length === 0 && (
                <div className='text-gray-500 text-center py-[30px]'>No {listModal} yet</div>
              )}
              {(profileData?.[listModal] || []).map((user, index) => (
                <Other key={user?._id || index} user={user} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile