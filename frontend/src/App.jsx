import React, { useEffect } from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { VideoCallProvider } from './context/VideoCallContext'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import { useDispatch, useSelector } from 'react-redux'
import getcurrentuser from './hooks/getcurrentuser'
import getsuggestedusers from './hooks/getsuggestedusers'
import Profile from './pages/Profile'
import Editprofile from './pages/Editprofile'
import Upload from './pages/Upload'
import getAllPost from './hooks/getAllPost'
import Scrolls from './pages/Scrolls'
import getAllScrolls from './hooks/getAllScrolls'
import Story from './pages/components/Story'
import getAllStories from './hooks/getAllStories'
import Messages from './pages/components/Messages'
import MessageArea from './pages/components/MessageArea'
import {io} from "socket.io-client"
import { setOnlineUsers, setsocket } from './redux/Socketslice'
import getfollowingList from './hooks/getfollwingList'
import getprevChatUsers from './hooks/getprevChatUsers'
import Search from './pages/components/Search'
import getAllNotifications from './hooks/getallNotifications'
import Notifications from './pages/components/Notifications'
import { setnotificationData } from './redux/userslic'
export const serverUrl = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:8000"
  : "https://yupp-6o8i.onrender.com";
function App() {
  getcurrentuser()
  getsuggestedusers()
  getAllPost()
  getAllScrolls()
  getAllStories()
  getfollowingList()
  getprevChatUsers()
  getAllNotifications()
  const {userData}=useSelector(state=>state.user)
  const location = useLocation()
  const {notificationData}=useSelector(state=>state.user)
   const {socket}=useSelector(state=>state.socket)
   const dispatch=useDispatch()
  useEffect(()=>{
    let socketIo
    if (userData){
      socketIo=io(serverUrl,{
        query:{
          userId:userData._id
        }
      })
      dispatch(setsocket(socketIo))

      socketIo.on('getOnlineUsers',(users)=>{
        dispatch(setOnlineUsers(users))
      })
      socketIo.on("newNotification",(noti)=>{
        dispatch(setnotificationData(noti))
      })

      return ()=>socketIo.close()
    }
    else{
      if(socket){
        socket.close()
        dispatch(setsocket(null))
      }
    }
  },[userData,dispatch])




  return (
    <VideoCallProvider>
      <Routes>
        <Route path='/signup' element={!userData?<Signup/>:<Navigate to={"/"}/>}/>
         <Route path='/signin' element={!userData?<Signin/>:<Navigate to={"/"}/>}/>
         <Route path='/' element={userData?<Home/>:<Navigate to={"/signin"}/>}/>
         <Route path='/ForgotPassword' element={!userData?<ForgotPassword/>:<Navigate to={"/"}/>}/>
         <Route path='/profile/:username' element={userData?<Profile key={location.pathname}/>:<Navigate to={"/signin"}/>}/>
          <Route path='/story/:username' element={userData?<Story/>:<Navigate to={"/signin"}/>}/>
         <Route path='/upload' element={userData?<Upload/>:<Navigate to={"/signin"}/>}/>
         <Route path='/search' element={userData?<Search/>:<Navigate to={"/signin"}/>}/>
                <Route path='/editprofile' element={userData?<Editprofile/>:<Navigate to={"/signin"}/>}/>
                <Route path='/messages' element={userData?<Messages/>:<Navigate to={"/signin"}/>}/>
                <Route path='/messageArea' element={userData?<MessageArea/>:<Navigate to={"/signin"}/>}/>
                <Route path='/notifications' element={userData?<Notifications/>:<Navigate to={"/signin"}/>}/>
                  <Route path='/scrolls' element={userData?<Scrolls/>:<Navigate to={"/signin"}/>}/>
      </Routes>
    </VideoCallProvider>
  )
}

export default App
