import React from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setfollowing, setuserData } from '../redux/userslic'
import { setcurrentuserstory } from '../redux/Storyslice'
import { setprevChatUsers } from '../redux/Messageslice'

function getprevChatUsers() {
  const dispatch =useDispatch()
  const {storyData}=useSelector(state=>state.story)
  const {messages}=useSelector(state=>state.message)
    useEffect(()=>{
     const   fetchUser =async ()=>{
        try {
            const result= await axios.get(`${serverUrl}/api/message/prevChats`,{withCredentials:true})
            dispatch(setprevChatUsers(result.data))
            
        } catch (error) {
            
        }
     }
     fetchUser()
    },[messages])
  
}

export default getprevChatUsers
